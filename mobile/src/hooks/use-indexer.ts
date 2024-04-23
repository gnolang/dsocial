import * as Grpc from "@gno/grpc/client";
import { PromiseClient } from "@connectrpc/connect";
import { IndexerService } from "@gno/api/indexer/indexerservice_connect";

import { GetHomePostsResponse, HelloResponse, HelloStreamResponse } from "@gno/api/indexer/indexerservice_pb";

export interface IndexerResponse {
  getHomePosts: (userPostAddr: string, startIndex: bigint, endIndex: bigint) => Promise<GetHomePostsResponse>;
  hello: (name: string) => Promise<HelloResponse>;
  helloStream: (name: string) => Promise<AsyncIterable<HelloStreamResponse>>;
}

let clientIndexerInstance: PromiseClient<typeof IndexerService> | undefined = undefined;

export const useIndexer = (): IndexerResponse => {
  const getClient = async () => {
    if (!clientIndexerInstance) {
      clientIndexerInstance = Grpc.createIndexerClient("http://localhost:26660");
      //clientIndexerInstance = Grpc.createIndexerClient('http://testnet.gno.berty.io:26660');
    }

    // FIXME: Remove this test code.
    // const greeting = await clientIndexerInstance.hello({name: 'gno'});
    // console.log('Greeting:', greeting);
    //   for await (const response of clientIndexerInstance.helloStream({name: 'gno'})) {
    //     console.log('response: ', response);
    //   }

    return clientIndexerInstance;
  };

  const getHomePosts = async (userPostAddr: string, startIndex: bigint, endIndex: bigint) => {
    const client = await getClient();
    return client.getHomePosts({ userPostAddr, startIndex, endIndex });
  };

  const hello = async (name: string) => {
    const client = await getClient();
    return client.hello({ name });
  };

  const helloStream = async (name: string) => {
    const client = await getClient();
    return client.helloStream({ name });
  };

  return {
    getHomePosts,
    hello,
    helloStream,
  };
};
