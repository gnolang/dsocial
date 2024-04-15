package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/gnolang/gnonative/api/gen/go/_goconnect"
	"github.com/gnolang/gnonative/service"
	graphql "github.com/hasura/go-graphql-client"
)

var remote = "http://testnet.gno.berty.io:8546/graphql/query"

type IndexerClient struct {
	gnoNativeClient _goconnect.GnoNativeServiceClient // Gno Native Kit gRPC client
	iClient         graphql.Client
}

func main() {
	// Start the Gno Native Kit gRPC service where the remote is gnoland.
	options := []service.GnoNativeOption{
		service.WithTcpAddr("localhost:0"),
		service.WithUseTcpListener(),
	}
	service, err := service.NewGnoNativeService(options...)
	if err != nil {
		log.Fatalf("failed to run GnoNativeService: %v", err)
		return
	}
	defer service.Close()

	// Create a Gno Native Kit gRPC client.
	gnoNativeClient := _goconnect.NewGnoNativeServiceClient(
		http.DefaultClient,
		fmt.Sprintf("http://localhost:%d", service.GetTcpPort()),
	)

	if err := run(gnoNativeClient); err != nil {
		log.Fatal(err)
		return
	}

	// var filter struct {
	// 	Filter struct {
	// 		Message struct {
	// 			VmParam struct {
	// 				Exec struct {
	// 					Func    string `graphql:"func: \"Follow\""`
	// 					PkgPath string `graphql:"pkg_path: \"gno.land/r/berty/social\""`
	// 				} `graphql:"exec"`
	// 			} `graphql:"vm_param"`
	// 		} `graphql:"message"`
	// 	} `graphql:"filter"`
	// }

	var transactions struct {
		Transactions struct {
			Hash string `graphql:"hash"`
		} `graphql:"transactions(filter: $filter)"`
	}

	var filter struct {
		Filter struct {
		} `graphql:"filter"`
	}

	variables := map[string]interface{}{
		"filter": filter,
	}

	// Create a new RPC client.
	iClient := graphql.NewClient(remote, nil)
	err = iClient.Query(context.Background(), &transactions, variables)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(transactions)

}

func run(client _goconnect.GnoNativeServiceClient) error {
	return nil
}
