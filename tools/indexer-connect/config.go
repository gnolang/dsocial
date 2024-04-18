package main

import (
	"net/url"

	"go.uber.org/zap"
)

const DEFAULT_LISTEN_ADDR = ":26660"
const DEFAULT_REMOTE_ADDR = "127.0.0.1:8546"

type Config struct {
	Logger     *zap.Logger
	RemoteAddr *url.URL
	Listen     *url.URL
}

type ServiceOption func(cfg *Config) error

func (cfg *Config) applyOptions(opts ...ServiceOption) error {
	withDefaultOpts := make([]ServiceOption, len(opts))
	copy(withDefaultOpts, opts)
	withDefaultOpts = append(withDefaultOpts, WithFallbackDefaults)
	for _, opt := range withDefaultOpts {
		if err := opt(cfg); err != nil {
			return err
		}
	}
	return nil
}

// FallBackOption is a structure that permits to fallback to a default option if the option is not set.
type FallBackOption struct {
	fallback func(cfg *Config) bool
	opt      ServiceOption
}

// --- Logger options ---

// WithLogger set the given logger.
var WithLogger = func(l *zap.Logger) ServiceOption {
	return func(cfg *Config) error {
		cfg.Logger = l
		return nil
	}
}

// WithDefaultLogger init a noop logger.
var WithDefaultLogger ServiceOption = func(cfg *Config) error {
	logger, err := zap.NewDevelopment()
	if err != nil {
		return err
	}

	cfg.Logger = logger

	return nil
}

var fallbackLogger = FallBackOption{
	fallback: func(cfg *Config) bool { return cfg.Logger == nil },
	opt:      WithDefaultLogger,
}

// WithFallbackLogger sets the logger if no logger is set.
var WithFallbackLogger ServiceOption = func(cfg *Config) error {
	if fallbackLogger.fallback(cfg) {
		return fallbackLogger.opt(cfg)
	}
	return nil
}

// --- RemoteAddr options ---

// WithRemoteAddr sets the given remote tx-indexer address.
var WithRemoteAddr = func(remote string) ServiceOption {
	return func(cfg *Config) error {
		var err error
		cfg.RemoteAddr, err = url.Parse(remote)
		return err
	}
}

// WithDefaultRemoteAddr inits a default remote tx-indexer address.
var WithDefaultRemoteAddr ServiceOption = func(cfg *Config) error {
	var err error
	cfg.RemoteAddr, err = url.Parse(DEFAULT_REMOTE_ADDR)
	return err
}

var fallbackRemoteAddr = FallBackOption{
	fallback: func(cfg *Config) bool { return cfg.RemoteAddr == nil },
	opt:      WithDefaultRemoteAddr,
}

// WithFallbackRemoteAddr sets the remote tx-indexer address if no address is set.
var WithFallbacRemoteAddr ServiceOption = func(cfg *Config) error {
	if fallbackRemoteAddr.fallback(cfg) {
		return fallbackRemoteAddr.opt(cfg)
	}
	return nil
}

// --- WithListen options ---

// WithListen sets the given TCP address to serve the gRPC server.
// If no TCP address is defined, a default will be used.
// If the TCP port is set to 0, a random port number will be chosen.
var WithListen = func(addr string) ServiceOption {
	return func(cfg *Config) error {
		var err error
		cfg.Listen, err = url.Parse(addr)
		return err
	}
}

// WithDefaultListen sets a default TCP addr to listen to.
var WithDefaultListen ServiceOption = func(cfg *Config) error {
	var err error
	cfg.Listen, err = url.Parse(DEFAULT_LISTEN_ADDR)
	return err
}

var fallbackListen = FallBackOption{
	fallback: func(cfg *Config) bool { return cfg.Listen == nil },
	opt:      WithDefaultListen,
}

// WithDefaultListen sets a default TCP addr to listen to if no address is set.
var WithFallbackListen ServiceOption = func(cfg *Config) error {
	if fallbackListen.fallback(cfg) {
		return fallbackListen.opt(cfg)
	}
	return nil
}

var defaults = []FallBackOption{
	fallbackLogger,
	fallbackRemoteAddr,
	fallbackListen,
}

// WithFallbackDefaults sets the default options if no option is set.
var WithFallbackDefaults ServiceOption = func(cfg *Config) error {
	for _, def := range defaults {
		if !def.fallback(cfg) {
			continue
		}
		if err := def.opt(cfg); err != nil {
			return err
		}
	}
	return nil
}
