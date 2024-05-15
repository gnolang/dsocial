package main

import (
	"context"
	"fmt"
	"os"

	"github.com/Khan/genqlient/generate"
	"github.com/suessflorian/gqlfetch"
)

func main() {
	schema, err := gqlfetch.BuildClientSchema(context.Background(), "https://txindexer.gno.berty.io/graphql/query", false)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	if err = os.WriteFile("schema.graphql", []byte(schema), 0644); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	generate.Main()
}
