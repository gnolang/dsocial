package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strings"

	"github.com/peterbourgon/ff/v3/ffcli"
	"github.com/pkg/errors"
)

const (
	DEFAULT_LISTEN_ADDR  = ":26661"
	DEFAULT_DB_PATH      = "./data.db"
	DEFAULT_INDEXER_ADDR = "http://localhost:26660"
)

var (
	listen      string
	dbPath      string
	indexerAddr string
)

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
		fs = flag.NewFlagSet("notification", flag.ContinueOnError)
	}

	fs.StringVar(&listen, "listen", DEFAULT_LISTEN_ADDR, "gRPC listening address")
	fs.StringVar(&dbPath, "db-path", DEFAULT_DB_PATH, "path of the database")
	fs.StringVar(&indexerAddr, "indexer-addr", DEFAULT_INDEXER_ADDR, "address of the indexer")

	var root *ffcli.Command
	{
		root = &ffcli.Command{
			ShortUsage: "notification [flag]",
			ShortHelp:  "start an notification service",
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

func startService() (NotificationService, error) {
	options := []ServiceOption{
		WithListen(listen),
		WithDBPath(dbPath),
		WithIndexerAddr(indexerAddr),
	}

	service, err := NewNotificationService(options...)
	if err != nil {
		return nil, errors.Wrap(err, "unable to create bridge service")
	}

	return service, nil
}
