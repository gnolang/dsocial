package main

import (
	"context"
	"io"
	"net"
	"net/http"
	"sync"

	"connectrpc.com/connect"
	expo "github.com/oliveroneill/exponent-server-sdk-golang/sdk"
	"go.uber.org/zap"

	indexerconnect "buf.build/gen/go/gnolang/dsocial-indexer/connectrpc/go/indexerservicev1connect"
	indexerapi "buf.build/gen/go/gnolang/dsocial-indexer/protocolbuffers/go"
)

type NotificationService interface {
	io.Closer
}

type notificationService struct {
	listen      string
	dbPath      string
	indexerAddr string

	logger        *zap.Logger
	listener      net.Listener
	server        *http.Server
	db            DB
	indexerClient indexerconnect.IndexerServiceClient
	pushClient    *expo.PushClient

	ctx       context.Context
	closeFunc func()

	lock sync.Mutex
}

var _ NotificationService = (*notificationService)(nil)

func NewNotificationService(opts ...ServiceOption) (NotificationService, error) {
	cfg := &Config{}
	if err := cfg.applyOptions(append(opts, WithFallbackDefaults)...); err != nil {
		return nil, err
	}

	db, err := NewDB(cfg.DBPath)
	if err != nil {
		cfg.Logger.Error("failed to open the database", zap.Error(err))
		return nil, err
	}

	indexerClient := indexerconnect.NewIndexerServiceClient(
		http.DefaultClient,
		cfg.IndexerAddr,
	)

	// Create a new Expo SDK client
	pushClient := expo.NewPushClient(nil)

	s := &notificationService{
		logger:        cfg.Logger,
		listen:        cfg.Listen,
		indexerAddr:   cfg.IndexerAddr,
		indexerClient: indexerClient,
		pushClient:    pushClient,
		db:            db,
		ctx:           context.Background(),
		closeFunc: func() {
			db.Close()
		},
	}

	if err := s.createGrpcServer(); err != nil {
		return nil, err
	}

	go s.monitorPostReply()

	return s, nil
}

func (s *notificationService) monitorPostReply() {
	req := connect.NewRequest(&indexerapi.StreamPostReplyRequest{})
	stream, err := s.indexerClient.StreamPostReply(s.ctx, req)
	if err != nil {
		s.logger.Error("failed to call the indexer's StreamPostReply", zap.Error(err))
	}

	for stream.Receive() {
		if stream.Msg().UserPostAddr == "" {
			s.logger.Error("UserPostAddr empty")
			continue
		}

		pushTokens, err := s.getPushTokens(stream.Msg().UserPostAddr)
		if err != nil {
			s.logger.Error("failed to get push tokens", zap.Error(err))
			continue
		}

		for _, token := range pushTokens {
			// send push notification
			go func(token string, msg *indexerapi.StreamPostReplyResponse) {
				s.logger.Debug("sending push notification", zap.String("token", token))
				if err := s.sendPushNotification(token, msg); err != nil {
					s.logger.Error("failed to send push notification", zap.String("token", token), zap.Error(err))
				}
			}(token, stream.Msg())
		}
	}
	s.logger.Error("streamPostReply ended", zap.Error(stream.Err()))
}

func (s *notificationService) sendPushNotification(token string, message *indexerapi.StreamPostReplyResponse) error {
	// To check the token is valid
	pushToken, err := expo.NewExponentPushToken(token)
	if err != nil {
		s.logger.Error("pushToken is not valid", zap.String("token", token), zap.Error(err))
		return err
	}

	// Publish message
	response, err := s.pushClient.Publish(
		&expo.PushMessage{
			To:   []expo.ExponentPushToken{pushToken},
			Body: message.Message,
			Data: map[string]string{
				"UserReplyAddr": message.UserReplyAddr,
				"UserPostAddr":  message.UserPostAddr,
				"ThreadID":      message.ThreadID,
				"PostID":        message.PostID,
				"NewPostID":     message.NewPostID,
			},
			Sound:    "default",
			Title:    "New reply",
			Priority: expo.DefaultPriority,
		},
	)
	if err != nil {
		s.logger.Error("failed to send push notification", zap.String("token", token), zap.Error(err))
		return err
	}

	// Validate responses
	if response.ValidateResponse() != nil {
		s.logger.Error("push response is not valid", zap.String("token", token))
	}

	return nil
}

func (s *notificationService) Close() error {
	if s.closeFunc != nil {
		s.closeFunc()
	}
	return nil
}
