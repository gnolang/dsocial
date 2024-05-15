package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strings"

	"github.com/gnolang/gnonative/api/gen/go/_goconnect"
	"github.com/peterbourgon/ff/v3/ffcli"
	"github.com/pkg/errors"
)

var remote string
var listen string

func main() {
	err := runMain(os.Args[1:])

	switch {
	case err == nil:
		// noop
	case err == flag.ErrHelp || strings.Contains(err.Error(), flag.ErrHelp.Error()):
		os.Exit(2)
	default:
		fmt.Fprintf(os.Stderr, "error: %+v\n", err)
		os.Exit(1)
	}

}

func runMain(args []string) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// setup flags
	var fs *flag.FlagSet
	{
		fs = flag.NewFlagSet("indexer", flag.ContinueOnError)
	}

	fs.StringVar(&remote, "remote", "https://txindexer.gno.berty.io/graphql/query", "address of the GraphQL tx-indexer")
	fs.StringVar(&listen, "listen", "localhost:26660", "gRPC listening address")

	var root *ffcli.Command
	{
		root = &ffcli.Command{
			ShortUsage: "indexer [flag]",
			ShortHelp:  "start an indexer service",
			FlagSet:    fs,
			Exec: func(ctx context.Context, args []string) error {
				service, err := startService()
				if err != nil {
					return errors.Wrap(err, "unable to start service")
				}
				c := make(chan os.Signal, 1)
				signal.Notify(c, os.Interrupt)
				<-c

				service.Close()

				return nil
			},
		}
	}

	if err := root.ParseAndRun(ctx, args); err != nil {
		log.Fatal(err)
	}

	return nil
}

func startService() (IndexerService, error) {
	options := []ServiceOption{
		WithRemoteAddr(remote),
		WithListen(listen),
	}

	service, err := NewIndexerService(options...)
	if err != nil {
		return nil, errors.Wrap(err, "unable to create bridge service")
	}

	return service, nil
}

func run(client _goconnect.GnoNativeServiceClient) error {
	return nil
}
