module github.com/gnolang/gnosocial/tools/indexer-service

go 1.21

require (
	connectrpc.com/connect v1.13.0
	connectrpc.com/grpchealth v1.2.0
	connectrpc.com/grpcreflect v1.2.0
	github.com/Khan/genqlient v0.7.0
	github.com/gnolang/gnonative v0.0.0-20240409092105-c80efd4dc93c
	github.com/gorilla/websocket v1.5.1
	github.com/peterbourgon/ff/v3 v3.4.0
	github.com/pkg/errors v0.9.1
	github.com/rs/cors v1.10.1
	go.uber.org/zap v1.26.0
	golang.org/x/net v0.22.0
	golang.org/x/xerrors v0.0.0-20200804184101-5ec99f83aff1
	google.golang.org/protobuf v1.33.0
	moul.io/u v1.27.0
)

require (
	github.com/google/uuid v1.3.1 // indirect
	github.com/vektah/gqlparser/v2 v2.5.11 // indirect
	go.uber.org/multierr v1.11.0 // indirect
	golang.org/x/text v0.14.0 // indirect
)

replace github.com/Khan/genqlient => github.com/Interstellar-Lab/genqlient v0.0.0-20231012145326-0d88cfb2110e
