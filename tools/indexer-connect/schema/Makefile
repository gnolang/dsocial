all: generate

fetch: schema.graphql 
.PHONY: fetch

schema.graphql:
	go run .

generate: ../generated.go
.PHONY: generate

../generated.go: schema.graphql
	go run github.com/Khan/genqlient
