package main

import (
	"context"
	"errors"
	"net"
	"net/http"
	"time"

	"connectrpc.com/connect"
	"connectrpc.com/grpchealth"
	"connectrpc.com/grpcreflect"
	api_gen "github.com/gnolang/dsocial/tools/notification-service/api/gen/go"
	"github.com/gnolang/dsocial/tools/notification-service/api/gen/go/_goconnect"
	"github.com/rs/cors"
	"go.uber.org/zap"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"moul.io/u"
)

func (s *notificationService) createGrpcServer() error {
	s.logger.Debug("createGrpcServer called")

	listener, err := net.Listen("tcp", s.listen)
	if err != nil {
		s.logger.Debug("createGrpcServer error", zap.Error(err))
		return api_gen.ErrCode_ErrRunGRPCServer.Wrap(err)
	}

	s.listener = listener

	if err := s.runGRPCServer(listener); err != nil {
		return err
	}

	s.logger.Info("createGrpcServer: gRPC server listens to", zap.String("addr", s.listen))

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

func (s *notificationService) runGRPCServer(listener net.Listener) error {
	mux := http.NewServeMux()

	compress1KB := connect.WithCompressMinBytes(1024)
	mux.Handle(_goconnect.NewNotificationServiceHandler(
		s,
		compress1KB,
	))
	mux.Handle(grpchealth.NewHandler(
		grpchealth.NewStaticChecker(_goconnect.NotificationServiceName),
		compress1KB,
	))
	mux.Handle(grpcreflect.NewHandlerV1(
		grpcreflect.NewStaticReflector(_goconnect.NotificationServiceName),
		compress1KB,
	))
	mux.Handle(grpcreflect.NewHandlerV1Alpha(
		grpcreflect.NewStaticReflector(_goconnect.NotificationServiceName),
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
