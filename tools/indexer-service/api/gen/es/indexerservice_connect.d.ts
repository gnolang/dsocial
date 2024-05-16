// @generated by protoc-gen-connect-es v1.4.0
// @generated from file indexerservice.proto (package land.gno.gnosocial.indexerservice.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { GetHomePostsRequest, GetHomePostsResponse, HelloRequest, HelloResponse, HelloStreamRequest, HelloStreamResponse } from "./indexerservice_pb.js";
import { MethodKind } from "@bufbuild/protobuf";

/**
 * IndexerService is the service to interact with the Gnosocial Indexer
 *
 * @generated from service land.gno.gnosocial.indexerservice.v1.IndexerService
 */
export declare const IndexerService: {
  readonly typeName: "land.gno.gnosocial.indexerservice.v1.IndexerService",
  readonly methods: {
    /**
     * @generated from rpc land.gno.gnosocial.indexerservice.v1.IndexerService.GetHomePosts
     */
    readonly getHomePosts: {
      readonly name: "GetHomePosts",
      readonly I: typeof GetHomePostsRequest,
      readonly O: typeof GetHomePostsResponse,
      readonly kind: MethodKind.Unary,
    },
    /**
     * Hello is for debug purposes
     *
     * @generated from rpc land.gno.gnosocial.indexerservice.v1.IndexerService.Hello
     */
    readonly hello: {
      readonly name: "Hello",
      readonly I: typeof HelloRequest,
      readonly O: typeof HelloResponse,
      readonly kind: MethodKind.Unary,
    },
    /**
     * HelloStream is for debug purposes
     *
     * @generated from rpc land.gno.gnosocial.indexerservice.v1.IndexerService.HelloStream
     */
    readonly helloStream: {
      readonly name: "HelloStream",
      readonly I: typeof HelloStreamRequest,
      readonly O: typeof HelloStreamResponse,
      readonly kind: MethodKind.ServerStreaming,
    },
  }
};
