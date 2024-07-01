package main

import (
	"bytes"
	"context"
	"encoding/gob"
	"time"

	"connectrpc.com/connect"
	"go.uber.org/zap"

	api_gen "github.com/gnolang/dsocial/tools/notification-service/api/gen/go"
	"github.com/pkg/errors"
)

func (s *notificationService) RegisterDevice(ctx context.Context, req *connect.Request[api_gen.RegisterDeviceRequest]) (*connect.Response[api_gen.RegisterDeviceResponse], error) {
	s.logger.Debug("RegisterDevice called", zap.String("address", req.Msg.Address), zap.String("token", req.Msg.Token))

	if req.Msg.Address == "" || req.Msg.Token == "" {
		s.logger.Error("RegisterDevice error: missing input", zap.String("address", req.Msg.Address), zap.String("token", req.Msg.Token))
		return nil, api_gen.ErrCode_ErrMissingInput
	}

	if err := s.registerDevice(req.Msg.Address, req.Msg.Token); err != nil {
		s.logger.Error("RegisterDevice error: failed to register device", zap.Error(err))
		return nil, api_gen.ErrCode_ErrInternal
	}

	s.logger.Debug("RegisterDevice returned ok")

	return connect.NewResponse(&api_gen.RegisterDeviceResponse{}), nil
}

func (s *notificationService) registerDevice(address string, token string) error {
	var tokens []string
	var err error

	if tokens, err = s.getPushTokens(address); err != nil {
		return errors.Wrap(err, "registerDevice error: getPushToken")
	}

	for _, t := range tokens {
		if t == token {
			s.logger.Info("registerDevice: token already exists", zap.String("address", address), zap.String("token", token))
			return nil
		}
	}

	tokens = append(tokens, token)

	var buffer bytes.Buffer
	enc := gob.NewEncoder(&buffer)
	if err := enc.Encode(tokens); err != nil {
		return errors.Wrap(err, "registerDevice error: encode")
	}

	if err := s.db.Set([]byte(address), buffer.Bytes()); err != nil {
		return errors.Wrap(err, "registerDevice error: DB.Set")
	}

	return nil
}

// getPushTokens returns the push tokens slice for the given address
// If the address has no tokens, it returns an empty string slice
func (s *notificationService) getPushTokens(address string) ([]string, error) {
	rawTokens, err := s.db.Get([]byte(address))
	if err != nil {
		return nil, errors.Wrap(err, "getPushTokens error: DB.Get")
	}

	// handle empty tokens
	if len(rawTokens) == 0 {
		return []string{}, nil
	}

	buffer := bytes.NewBuffer(rawTokens)
	var tokens []string

	dec := gob.NewDecoder(buffer)
	if err := dec.Decode(&tokens); err != nil {
		return nil, errors.Wrap(err, "getPushTokens error: decode")
	}

	return tokens, nil
}

// Hello is for debug purposes
func (s *notificationService) Hello(ctx context.Context, req *connect.Request[api_gen.HelloRequest]) (*connect.Response[api_gen.HelloResponse], error) {
	s.logger.Debug("Hello called")
	defer s.logger.Debug("Hello returned ok")
	return connect.NewResponse(&api_gen.HelloResponse{
		Greeting: "Hello " + req.Msg.Name,
	}), nil
}

// HelloStream is for debug purposes
func (s *notificationService) HelloStream(ctx context.Context, req *connect.Request[api_gen.HelloStreamRequest], stream *connect.ServerStream[api_gen.HelloStreamResponse]) error {
	s.logger.Debug("HelloStream called")
	for i := 0; i < 4; i++ {
		if err := stream.Send(&api_gen.HelloStreamResponse{
			Greeting: "Hello " + req.Msg.Name,
		}); err != nil {
			s.logger.Error("HelloStream returned error", zap.Error(err))
			return err
		}
		time.Sleep(2 * time.Second)
	}

	s.logger.Debug("HelloStream returned ok")
	return nil
}
