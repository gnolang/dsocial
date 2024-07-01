package main

import (
	"go.uber.org/zap"
)

type Config struct {
	Logger      *zap.Logger
	Listen      string
	DBPath      string
	IndexerAddr string
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

// --- WithListen options ---

// WithListen sets the given TCP address to serve the gRPC server.
// If no TCP address is defined, a default will be used.
// If the TCP port is set to 0, a random port number will be chosen.
var WithListen = func(addr string) ServiceOption {
	return func(cfg *Config) error {
		cfg.Listen = addr
		return nil
	}
}

// WithDefaultListen sets a default TCP addr to listen to.
var WithDefaultListen ServiceOption = func(cfg *Config) error {
	cfg.Listen = DEFAULT_LISTEN_ADDR
	return nil
}

var fallbackListen = FallBackOption{
	fallback: func(cfg *Config) bool { return cfg.Listen == "" },
	opt:      WithDefaultListen,
}

// WithDefaultListen sets a default TCP addr to listen to if no address is set.
var WithFallbackListen ServiceOption = func(cfg *Config) error {
	if fallbackListen.fallback(cfg) {
		return fallbackListen.opt(cfg)
	}
	return nil
}

// --- WithDBPath options ---

// WithDBPath sets the path where to store the database.
// If no path is defined, a default will be used.
var WithDBPath = func(path string) ServiceOption {
	return func(cfg *Config) error {
		cfg.DBPath = path
		return nil
	}
}

// WithDefaultDBPath sets a default database path.
var WithDefaultDBPath ServiceOption = func(cfg *Config) error {
	cfg.Listen = DEFAULT_DB_PATH
	return nil
}

var fallbackDBPath = FallBackOption{
	fallback: func(cfg *Config) bool { return cfg.DBPath == "" },
	opt:      WithDefaultDBPath,
}

// WithDefaultDBPath sets a default path to store the database to if one is set.
var WithFallbackDBPath ServiceOption = func(cfg *Config) error {
	if fallbackDBPath.fallback(cfg) {
		return fallbackDBPath.opt(cfg)
	}
	return nil
}

// --- WithIndexerAddr options ---

// WithIndexerAddr sets the address to the dSocial indexer service.
// If no path is defined, a default will be used.
var WithIndexerAddr = func(addr string) ServiceOption {
	return func(cfg *Config) error {
		cfg.IndexerAddr = addr
		return nil
	}
}

// WithDefaultIndexerAddr sets a default TCP addr to listen to.
var WithDefaultIndexerAddr ServiceOption = func(cfg *Config) error {
	cfg.IndexerAddr = DEFAULT_INDEXER_ADDR
	return nil
}

var fallbackIndexerAddr = FallBackOption{
	fallback: func(cfg *Config) bool { return cfg.DBPath == "" },
	opt:      WithDefaultIndexerAddr,
}

// WithDefaultIndexerAddr sets a default indexer address.
var WithFallbackIndexerAddr ServiceOption = func(cfg *Config) error {
	if fallbackIndexerAddr.fallback(cfg) {
		return fallbackIndexerAddr.opt(cfg)
	}
	return nil
}

// --- fallback config ---

var defaults = []FallBackOption{
	fallbackLogger,
	fallbackListen,
	fallbackDBPath,
	fallbackIndexerAddr,
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
