package main

import (
	"os"
	"path/filepath"
	"testing"
)

// initService initializes a new notificationService manually.
func initService(t *testing.T) *notificationService {
	tmp := t.TempDir()
	dbPath := filepath.Join(tmp, "dsocial-test-notification.db")

	cfg := &Config{}
	cfg.applyOptions(WithDefaultLogger)
	cfg.applyOptions(WithDefaultListen)
	cfg.applyOptions(WithDBPath(dbPath))

	db, err := NewDB(cfg.DBPath)
	if err != nil {
		t.Fatal(err)
	}

	t.Cleanup(func() {
		os.RemoveAll(dbPath)
	})

	service := &notificationService{
		logger: cfg.Logger,
		listen: cfg.Listen,
		db:     db,
	}
	return service
}

func TestNotificationService(t *testing.T) {
	service := initService(t)

	service.Close()
}

func TestRegisterDevice(t *testing.T) {
	pushToken := "pushToken"
	pushToken2 := "pushToken2"
	address := "address"

	service := initService(t)
	t.Cleanup(func() {
		service.Close()
	})

	// register one token

	{
		if err := service.registerDevice(address, pushToken); err != nil {
			t.Fatalf("registerDevice failed: %v", err)
		}

		tokens, err := service.getPushTokens(address)
		if err != nil {
			t.Fatalf("getPushTokens failed: %v", err)
		}

		if len(tokens) != 1 {
			t.Fatalf("getPushTokens failed: expected 1 token, got %d", len(tokens))
		}

		if tokens[0] != pushToken {
			t.Fatalf("getPushTokens failed: expected %s, got %s", pushToken, tokens[0])
		}
	}

	// register another token
	{
		if err := service.registerDevice(address, pushToken2); err != nil {
			t.Fatalf("registerDevice failed: %v", err)
		}

		tokens, err := service.getPushTokens(address)
		if err != nil {
			t.Fatalf("getPushTokens failed: %v", err)
		}

		if len(tokens) != 2 {
			t.Fatalf("getPushTokens failed: expected 1 token, got %d", len(tokens))
		}

		if tokens[1] != pushToken2 {
			t.Fatalf("getPushTokens failed: expected %s, got %s", pushToken, tokens[1])
		}
	}
}
