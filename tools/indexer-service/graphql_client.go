package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/Khan/genqlient/graphql"
	api_gen "github.com/gnolang/dsocial/tools/indexer-service/api/gen/go"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

var gUserPostsByAddress = make(map[string]*UserPosts) // user's std.Address -> *UserPosts

type UserAndPostID struct {
	UserPostAddr string
	PostID       uint64
}

type UserPosts struct {
	homePosts []*UserAndPostID  // Includes this user's threads posts plus posts of users being followed.
	followers map[string]uint64 // std.Address -> startedPostsCtr of the follower
}

func newUserPosts() *UserPosts {
	return &UserPosts{
		homePosts: []*UserAndPostID{},
		followers: make(map[string]uint64),
	}
}

func getOrCreateUserPosts(userAddr string) *UserPosts {
	userPosts, ok := gUserPostsByAddress[userAddr]
	if ok {
		return userPosts
	}

	userPosts = newUserPosts()
	gUserPostsByAddress[userAddr] = userPosts
	return userPosts
}

func getPostIDStr(response string) (string, error) {
	response = strings.TrimSpace(response)
	const postIDSuffix = " gno.land/r/berty/social.PostID)"

	if !strings.HasSuffix(response, postIDSuffix) {
		return "", errors.New("Expected PostID suffix: " + response)
	}

	return response[1 : len(response)-len(postIDSuffix)], nil
}

func getPostID(response string) (uint64, error) {
	postIDStr, err := getPostIDStr(response)
	if err != nil {
		return 0, err
	}

	postID, err := strconv.ParseUint(postIDStr, 10, 64)
	if err != nil {
		return 0, err
	}

	return postID, nil
}

func (s *indexerService) processCallInfo(messages []CallInfoMessagesTransactionMessage, response CallInfoResponseTransactionResponse, streaming bool) {
	for _, m := range messages {
		msgCall, ok := m.Value.(*CallInfoMessagesTransactionMessageValueMsgCall)
		if !ok {
			continue
		}

		switch msgCall.Func {
		case "Follow":
			followedUserPosts := getOrCreateUserPosts(msgCall.Args[0])
			startedPostsCtr, err := getPostID(response.Data)
			if err != nil {
				fmt.Printf("Error getting PostID: %s\n", err.Error())
				continue
			}
			if startedPostsCtr == 0 {
				// Not a new following.
				continue
			}

			followedUserPosts.followers[msgCall.Caller] = startedPostsCtr
		case "PostMessage", "RepostThread":
			userPosts := getOrCreateUserPosts(msgCall.Caller)
			postID, err := getPostID(response.Data)
			if err != nil {
				s.logger.Error("Error getting PostID", zap.Error(err))
				continue
			}
			userAndPostID := &UserAndPostID{
				UserPostAddr: msgCall.Caller,
				PostID:       postID,
			}
			userPosts.homePosts = append(userPosts.homePosts, userAndPostID)

			for followerAddr, startedPostsCtr := range userPosts.followers {
				if postID > startedPostsCtr {
					followerUserPosts := getOrCreateUserPosts(followerAddr)
					followerUserPosts.homePosts = append(followerUserPosts.homePosts, userAndPostID)
				}
			}
		case "PostReply":
			// we want to filter out the PostReply to only handle new PostReply calls
			if !streaming {
				continue
			}

			go func(msgCall *CallInfoMessagesTransactionMessageValueMsgCall, response CallInfoResponseTransactionResponse) {
				if len(msgCall.Args) < 4 {
					s.logger.Error("Not enought argument in the PostReply transaction")
					return
				}

				newPostID, err := getPostIDStr(response.Data)
				if err != nil {
					s.logger.Error("Error getting newPostID", zap.Error(err))
					return
				}

				reply := &api_gen.StreamPostReplyResponse{
					UserReplyAddr: msgCall.Caller,
					UserPostAddr:  msgCall.Args[0],
					ThreadID:      msgCall.Args[1],
					PostID:        msgCall.Args[2],
					Message:       msgCall.Args[3],
					NewPostID:     newPostID,
				}

				// set a timeout for sending into channel
				ctx, cancel := context.WithTimeout(s.ctx, 2*time.Second)
				defer cancel()

				select {
				case s.cPostReply <- reply:
				case <-ctx.Done():
					s.logger.Error("Timeout sending into channel", zap.String("UserPostAddr", msgCall.Args[0]))
				}
			}(msgCall, response)
		}
	}
}

func (s *indexerService) createGraphQLClient() error {
	s.graphQLClient = graphql.NewClient(s.remoteAddr, http.DefaultClient)
	resp, err := getTransactions(s.ctx, s.graphQLClient)
	if err != nil {
		return err
	}
	for _, t := range resp.Transactions {
		s.processCallInfo(t.Messages, t.Response, false)
	}

	clientAddr, err := websocketURL(s.remoteAddr)
	if err != nil {
		return err
	}
	wsClient := graphql.NewClientUsingWebSocket(
		clientAddr,
		&MyDialer{Dialer: websocket.DefaultDialer},
		nil,
	)

	errChan, err := wsClient.StartWebSocket(s.ctx)
	if err != nil {
		return err
	}

	dataChan, subscriptionID, err := subscribeTransactions(s.ctx, wsClient)
	if err != nil {
		return err
	}

	defer wsClient.CloseWebSocket()
	for loop := true; loop; {
		select {
		case msg, more := <-dataChan:
			if !more {
				loop = false
				break
			}
			if msg.Data != nil {
				s.processCallInfo(msg.Data.Transactions.Messages, msg.Data.Transactions.Response, true)
			}
			if msg.Errors != nil {
				fmt.Println("error:", msg.Errors)
				loop = false
			}
		case err = <-errChan:
			return err
		case <-s.ctx.Done():
			wsClient.Unsubscribe(subscriptionID)
			loop = false
		}
	}

	return nil
}

func websocketURL(addr string) (string, error) {
	url, err := url.Parse(addr)
	if err != nil {
		return "", err
	}

	var wsScheme string
	switch url.Scheme {
	case "https", "wss":
		wsScheme = "wss"
	default:
		wsScheme = "ws"
	}

	return fmt.Sprintf("%s://%s%s", wsScheme, url.Host, url.Path), nil
}

type MyDialer struct {
	*websocket.Dialer
}

func (md *MyDialer) DialContext(ctx context.Context, urlStr string, requestHeader http.Header) (graphql.WSConn, error) {
	conn, _, err := md.Dialer.DialContext(ctx, urlStr, requestHeader)
	return graphql.WSConn(conn), err
}
