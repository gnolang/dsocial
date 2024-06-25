src := $(wildcard ./*.go) go.mod go.sum

#### API ####

api/gen: api/indexerservice.proto
	buf generate api
	touch api/gen

api.build: api/gen
.PHONY: api.build

api.push: api.build
	buf push api
.PHONY: api.push

#### BUILD ####

build/indexer: $(src)
	mkdir -p build
	go build -o build/indexer .

build: build/indexer
.PHONY: build

#### CLEAN ####

clean:
	rm -rf build
