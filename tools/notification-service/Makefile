src := $(wildcard ./*.go) go.mod go.sum

#### API ####

api/gen: api/notificationservice.proto
	buf generate api
	touch api/gen

api.build: api/gen
.PHONY: api.build

api.push: api.build
	buf push api
.PHONY: api.push

#### BUILD ####

build/notification: $(src)
	mkdir -p build
	go build -o build/notification .

build: build/notification
.PHONY: build

#### CLEAN ####

clean:
	rm -rf build
