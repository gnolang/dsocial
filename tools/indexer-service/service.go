package main

import (
	"context"
	"io"
	"net"
	"net/http"
	"sync"

	"github.com/Khan/genqlient/graphql"
	api_gen "github.com/gnolang/dsocial/tools/indexer-service/api/gen/go"
	"go.uber.org/zap"
)

type IndexerService interface {
	io.Closer
}

type indexerService struct {
	logger     *zap.Logger
	remoteAddr string
	listen     string

	listener net.Listener
	server   *http.Server

	graphQLClient graphql.Client
	cPostReply    chan *api_gen.StreamPostReplyResponse

	ctx       context.Context
	ctxCancel context.CancelFunc
	closeFunc func()

	lock sync.Mutex
}

var _ IndexerService = (*indexerService)(nil)

func NewIndexerService(opts ...ServiceOption) (IndexerService, error) {
	cfg := &Config{}
	if err := cfg.applyOptions(append(opts, WithFallbackDefaults)...); err != nil {
		return nil, err
	}

	ctx, cancel := context.WithCancel(context.Background())
	c := make(chan *api_gen.StreamPostReplyResponse, 100)

	s := &indexerService{
		logger:     cfg.Logger,
		remoteAddr: cfg.RemoteAddr,
		listen:     cfg.Listen,
		ctx:        ctx,
		ctxCancel:  cancel,
		cPostReply: c,
		closeFunc: func() {
			close(c)
			cancel()
		},
	}

	if err := s.createGrpcServer(); err != nil {
		return nil, err
	}

	if err := s.createGraphQLClient(); err != nil {
		s.closeFunc()
		return nil, err
	}

	return s, nil
}

func (s *indexerService) Close() error {
	if s.closeFunc != nil {
		s.closeFunc()
	}
	return nil
}
