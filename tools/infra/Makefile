help:
	@echo "Available make commands:"
	@cat Makefile | grep '^[a-z][^:]*:' | cut -d: -f1 | sort | sed 's/^/  /'
.PHONY: help

### Docker ###

up:
	docker compose up -d
.PHONY: up

down:
	docker compose down
.PHONY: down

re: down up
.PHONY: re

logs:
	docker compose logs -f
.PHONY: logs

### Services ###

build: gno.build faucet.build tx-indexer.build indexer.build
.PHONY: build

gno:
	git clone https://github.com/gnolang/gno.git

gno.pull: gno
	cd gno; git pull
.PHONY: gno.pull

gno.build: gno.pull
	cd gno; docker build -t gno .
.PHONY: gno.build

faucet:
	git clone https://github.com/gnolang/faucet.git

faucet.pull: faucet
	cd faucet; git pull
.PHONY: faucet.pull

faucet.build: faucet.pull
	cd faucet; docker build -f ./Dockerfile.local -t gno.faucet .
.PHONY: faucet.build

tx-indexer:
	git clone https://github.com/gnolang/tx-indexer.git

tx-indexer.pull: tx-indexer
	cd tx-indexer; git pull
.PHONY: tx-indexer.pull

tx-indexer.build: tx-indexer.pull
	cd tx-indexer; docker build -t gno.tx-indexer .
.PHONY: tx-indexer.build

indexer:
	git clone https://github.com/gnolang/dsocial.git

indexer.pull: indexer
	cd indexer; git pull
.PHONY: indexer.pull

indexer.build: indexer.pull
	cd indexer/tools/indexer-connect; docker build -t gno.indexer .
.PHONY: indexer.build

gno-curl.build:
	docker build -t gno-curl .
.PHONY: gno-curl.build
