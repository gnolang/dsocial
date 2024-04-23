package main

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/Khan/genqlient/graphql"
	"github.com/gorilla/websocket"
)

func (s *indexerService) createGraphQLClient() error {
	s.graphQLClient = graphql.NewClient(s.remoteAddr, http.DefaultClient)
	resp, err := getTransactions(s.ctx, s.graphQLClient, "g1jg8mtutu9khhfwc4nxmuhcpftf0pajdhfvsqf5")
	if err != nil {
		return err
	}
	fmt.Println(resp)

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
	return fmt.Sprintf("ws://%s%s", url.Host, url.Path), nil
}

type MyDialer struct {
	*websocket.Dialer
}

func (md *MyDialer) DialContext(ctx context.Context, urlStr string, requestHeader http.Header) (graphql.WSConn, error) {
	conn, _, err := md.Dialer.DialContext(ctx, urlStr, requestHeader)
	return graphql.WSConn(conn), err
}
