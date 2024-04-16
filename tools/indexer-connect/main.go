package main

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/Khan/genqlient/graphql"
	"github.com/gnolang/gnonative/api/gen/go/_goconnect"
	"github.com/gorilla/websocket"
)

var remote = "testnet.gno.berty.io:8546/graphql/query"

type IndexerClient struct {
	gnoNativeClient _goconnect.GnoNativeServiceClient // Gno Native Kit gRPC client
	iClient         graphql.WebSocketClient
}

func main() {
	// Start the Gno Native Kit gRPC service where the remote is gnoland.
	// options := []service.GnoNativeOption{
	// 	service.WithTcpAddr("localhost:0"),
	// 	service.WithUseTcpListener(),
	// }
	// service, err := service.NewGnoNativeService(options...)
	// if err != nil {
	// 	log.Fatalf("failed to run GnoNativeService: %v", err)
	// 	return
	// }
	// defer service.Close()

	// Create a Gno Native Kit gRPC client.
	// gnoNativeClient := _goconnect.NewGnoNativeServiceClient(
	// 	http.DefaultClient,
	// 	fmt.Sprintf("http://localhost:%d", service.GetTcpPort()),
	// )
	//
	// if err := run(gnoNativeClient); err != nil {
	// 	log.Fatal(err)
	// 	return
	// }

	ctx := context.Background()

	// Create a new RPC client.
	iClient := graphql.NewClient("http://"+remote, http.DefaultClient)
	resp, err := getTransactions(ctx, iClient, "g1jg8mtutu9khhfwc4nxmuhcpftf0pajdhfvsqf5")
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(resp)

	wsClient := graphql.NewClientUsingWebSocket(
		"ws://"+remote,
		&MyDialer{Dialer: websocket.DefaultDialer},
		nil,
	)

	errChan, err := wsClient.StartWebSocket(ctx)
	if err != nil {
		return
	}

	dataChan, subscriptionID, err := subscribeBlocks(ctx, wsClient)
	if err != nil {
		return
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
			return
		case <-time.After(time.Minute):
			err = wsClient.Unsubscribe(subscriptionID)
			loop = false
		}
	}

}

func run(client _goconnect.GnoNativeServiceClient) error {
	return nil
}

type MyDialer struct {
	*websocket.Dialer
}

func (md *MyDialer) DialContext(ctx context.Context, urlStr string, requestHeader http.Header) (graphql.WSConn, error) {
	conn, _, err := md.Dialer.DialContext(ctx, urlStr, requestHeader)
	return graphql.WSConn(conn), err
}
