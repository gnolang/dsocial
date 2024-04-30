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
	"github.com/gorilla/websocket"
)

var gUserPostsByAddress = make(map[string]*UserPosts) // user's std.Address -> *UserPosts

type UserAndPostID struct {
	UserPostAddr string
	PostID       int
}

type UserPosts struct {
	homePosts []*UserAndPostID // Includes this user's threads posts plus posts of users being followed.
	followers map[string]int   // std.Address -> startedPostsCtr of the follower
}

func newUserPosts() *UserPosts {
	return &UserPosts{
		homePosts: []*UserAndPostID{},
		followers: make(map[string]int),
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

func getPostID(response string) (int, error) {
	const postIDSuffix = " gno.land/r/berty/social.PostID)"
	if !strings.HasSuffix(response, postIDSuffix) {
		return 0, errors.New("Expected PostID suffix: " + response)
	}
	postID, err := strconv.Atoi(response[1 : len(response)-len(postIDSuffix)])
	if err != nil {
		return 0, err
	}
	return postID, nil
}

func (s *indexerService) createGraphQLClient() error {
	s.graphQLClient = graphql.NewClient(s.remoteAddr, http.DefaultClient)
	resp, err := getTransactions(s.ctx, s.graphQLClient)
	if err != nil {
		return err
	}
	for _, t := range resp.Transactions {
		for _, m := range t.Messages {
			msgCall, ok := m.Value.(*getTransactionsTransactionsTransactionMessagesTransactionMessageValueMsgCall)
			if !ok {
				continue
			}

			if msgCall.Func == "Follow" {
				followedUserPosts := getOrCreateUserPosts(msgCall.Args[0])
				startedPostsCtr, err := getPostID(t.Response.Data)
				if err != nil {
					fmt.Printf("Error getting PostID: %s\n", err.Error())
					continue
				}
				if startedPostsCtr == 0 {
					// Not a new following.
					continue
				}

				followedUserPosts.followers[msgCall.Caller] = startedPostsCtr
			}

			if msgCall.Func == "PostMessage" {
				userPosts := getOrCreateUserPosts(msgCall.Caller)
				postID, err := getPostID(t.Response.Data)
				if err != nil {
					fmt.Printf("Error getting PostID: %s\n", err.Error())
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
			}
		}
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

	dataChan, subscriptionID, err := subscribeBlocks(s.ctx, wsClient)
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
				fmt.Println(msg.Data.Blocks.Height)
			}
			if msg.Errors != nil {
				fmt.Println("error:", msg.Errors)
				loop = false
			}
		case err = <-errChan:
			return err
		case <-time.After(time.Minute):
			err = wsClient.Unsubscribe(subscriptionID)
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
