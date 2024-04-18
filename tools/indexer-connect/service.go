package main

import (
	"context"
	"io"
	"net"
	"net/http"
	"net/url"
	"sync"

	"github.com/Khan/genqlient/graphql"
	"go.uber.org/zap"
)

type IndexerService interface {
	io.Closer
}

type indexerService struct {
	logger     *zap.Logger
	remoteAddr *url.URL
	listen     *url.URL

	listener net.Listener
	server   *http.Server

	graphQLClient graphql.Client

	ctx       context.Context
	closeFunc func()

	lock sync.Mutex
}

var _ IndexerService = (*indexerService)(nil)

func NewIndexerService(opts ...ServiceOption) (IndexerService, error) {
	cfg := &Config{}
	if err := cfg.applyOptions(append(opts, WithFallbackDefaults)...); err != nil {
		return nil, err
	}

	s := &indexerService{
		logger:     cfg.Logger,
		remoteAddr: cfg.RemoteAddr,
		listen:     cfg.Listen,
		ctx:        context.Background(),
		closeFunc:  func() {},
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
