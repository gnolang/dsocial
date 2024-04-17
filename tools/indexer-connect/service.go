package main

import (
	"context"
	"errors"
	"io"
	"net"
	"net/http"
	"sync"
	"time"

	"connectrpc.com/connect"
	"connectrpc.com/grpchealth"
	"connectrpc.com/grpcreflect"
	"github.com/rs/cors"
	"go.uber.org/zap"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"moul.io/u"

	api_gen "github.com/gnolang/gnosocial/tools/indexer-connect/api/gen/go"
	"github.com/gnolang/gnosocial/tools/indexer-connect/api/gen/go/_goconnect"
)

type IndexerService interface {
	io.Closer
}

type indexerService struct {
	logger     *zap.Logger
	remoteAddr string
	tcpAddr    string

	listener  net.Listener
	server    *http.Server
	closeFunc func()

	lock sync.Mutex
}

var _ IndexerService = (*indexerService)(nil)

func NewIndexerService(opts ...ServiceOption) (IndexerService, error) {
	cfg := &Config{}
	if err := cfg.applyOptions(append(opts, WithFallbackDefaults)...); err != nil {
		return nil, err
	}

	return &indexerService{
		logger:     cfg.Logger,
		remoteAddr: cfg.RemoteAddr,
		tcpAddr:    cfg.TcpAddr,
		closeFunc:  func() {},
	}, nil
}

func (s *indexerService) Close() error {
	if s.closeFunc != nil {
		s.closeFunc()
	}
	return nil
}

func (s *indexerService) createTcpGrpcServer() error {
	s.logger.Debug("createTcpGrpcServer called")

	listener, err := net.Listen("tcp", s.tcpAddr)
	if err != nil {
		s.logger.Debug("createTcpGrpcServer error", zap.Error(err))
		return api_gen.ErrCode_ErrRunGRPCServer.Wrap(err)
	}

	s.listener = listener

	if err := s.runGRPCServer(listener); err != nil {
		return err
	}

	s.logger.Info("createTcpGrpcServer: gRPC server listens to", zap.String("addr", s.tcpAddr))

	return nil
}

func newCORS() *cors.Cors {
	// To let web developers play with the demo service from browsers, we need a
	// very permissive CORS setup.
	return cors.New(cors.Options{
		AllowedMethods: []string{
			http.MethodHead,
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
		},
		AllowOriginFunc: func(origin string) bool {
			// Allow all origins, which effectively disables CORS.
			return true
		},
		AllowedHeaders: []string{"*"},
		ExposedHeaders: []string{
			// Content-Type is in the default safelist.
			"Accept",
			"Accept-Encoding",
			"Accept-Post",
			"Connect-Accept-Encoding",
			"Connect-Content-Encoding",
			"Content-Encoding",
			"Grpc-Accept-Encoding",
			"Grpc-Encoding",
			"Grpc-Message",
			"Grpc-Status",
			"Grpc-Status-Details-Bin",
		},
		// Let browsers cache CORS information for longer, which reduces the number
		// of preflight requests. Any changes to ExposedHeaders won't take effect
		// until the cached data expires. FF caps this value at 24h, and modern
		// Chrome caps it at 2h.
		MaxAge: int(2 * time.Hour / time.Second),
	})
}

func (s *indexerService) runGRPCServer(listener net.Listener) error {
	mux := http.NewServeMux()

	compress1KB := connect.WithCompressMinBytes(1024)
	mux.Handle(_goconnect.NewIndexerServiceHandler(
		s,
		compress1KB,
	))
	mux.Handle(grpchealth.NewHandler(
		grpchealth.NewStaticChecker(_goconnect.IndexerServiceName),
		compress1KB,
	))
	mux.Handle(grpcreflect.NewHandlerV1(
		grpcreflect.NewStaticReflector(_goconnect.IndexerServiceName),
		compress1KB,
	))
	mux.Handle(grpcreflect.NewHandlerV1Alpha(
		grpcreflect.NewStaticReflector(_goconnect.IndexerServiceName),
		compress1KB,
	))

	server := &http.Server{
		Handler: h2c.NewHandler(
			newCORS().Handler(mux),
			&http2.Server{},
		),
		ReadHeaderTimeout: time.Second,
		ReadTimeout:       5 * time.Minute,
		WriteTimeout:      5 * time.Minute,
		MaxHeaderBytes:    8 * 1024, // 8KiB
	}

	s.lock.Lock()
	s.server = server
	s.closeFunc = u.CombineFuncs(s.closeFunc, func() {
		if err := server.Shutdown(context.Background()); err != nil {
			s.logger.Error("cannot close the gRPC server", zap.Error(err)) //nolint:gocritic
		}
	})
	s.lock.Unlock()

	go func() {
		// we dont need to log the error
		err := s.server.Serve(listener)
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			s.logger.Error("failed to serve the gRPC listener")
		}
	}()

	return nil
}
