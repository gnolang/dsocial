package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gnolang/gnonative/api/gen/go/_goconnect"
	"github.com/gnolang/gnonative/service"
)

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
	client := _goconnect.NewGnoNativeServiceClient(
		http.DefaultClient,
		fmt.Sprintf("http://localhost:%d", service.GetTcpPort()),
	)

	if err := run(client); err != nil {
		log.Fatal(err)
		return
	}
}

func run(client _goconnect.GnoNativeServiceClient) error {
	return nil
}
