package main

import (
	"bytes"
	"fmt"
	"os"
	"testing"
)

func TestDB(t *testing.T) {
	tempDir := t.TempDir()
	path := fmt.Sprintf("%s/test.db", tempDir)
	key := []byte("test_key")
	value := []byte("test_value")

	db, err := NewDB(path)
	if err != nil {
		t.Fatalf("Error while creating new DB: %v", err)
	}

	t.Cleanup(func() {
		db.Close()
		os.RemoveAll(path)
	})

	t.Run("Set", func(t *testing.T) {
		err := db.Set(key, value)
		if err != nil {
			t.Fatalf("Error while setting value: %v", err)
		}
	})

	t.Run("Get", func(t *testing.T) {
		dbValue, err := db.Get(key)
		if err != nil {
			t.Fatalf("Error while getting value: %v", err)
		}
		if !bytes.Equal(dbValue, value) {
			t.Fatalf("Expected value to be '%s', got %s", value, dbValue)
		}
	})
}
