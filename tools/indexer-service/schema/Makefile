all: generate

fetch: schema.graphql 
.PHONY: fetch

schema.graphql:
	go run .

generate: ../generated.go
.PHONY: generate

../generated.go: schema.graphql genqlient.graphql
	go run github.com/Khan/genqlient

clean:
	rm -f schema.graphql
	rm -f ../generated.go

re: clean generate
