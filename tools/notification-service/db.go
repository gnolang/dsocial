package main

import (
	badger "github.com/dgraph-io/badger/v4"
)

type DB interface {
	Get(key []byte) ([]byte, error)
	Set(key, value []byte) error
	Close() error
}

type db struct {
	db   *badger.DB
	path string
}

func NewDB(path string) (DB, error) {
	dbInstance, err := badger.Open(badger.DefaultOptions(path))
	if err != nil {
		return nil, err
	}
	return &db{
		path: path,
		db:   dbInstance,
	}, nil
}

func (db *db) Get(key []byte) ([]byte, error) {
	var rawToken []byte
	err := db.db.View(func(txn *badger.Txn) error {
		item, err := txn.Get(key)
		if err != nil {
			return err
		}

		err = item.Value(func(val []byte) error {
			rawToken = append([]byte{}, val...)
			return nil
		})
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil && err != badger.ErrKeyNotFound {
		return nil, err
	}

	return rawToken, nil
}

func (db *db) Set(key, value []byte) error {
	return db.db.Update(func(txn *badger.Txn) error {
		return txn.Set(key, value)
	})
}

func (db *db) Close() error {
	return db.db.Close()
}
