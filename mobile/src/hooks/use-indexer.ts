import * as Grpc from "@gno/grpc/client";
import { PromiseClient } from "@connectrpc/connect";
import { IndexerService } from "@gno/api/indexer/indexerservice_connect";

import { HelloResponse, HelloStreamResponse, UserAndPostID } from "@gno/api/indexer/indexerservice_pb";

export interface IndexerResponse {
  getHomePosts: (userPostAddr: string, startIndex: bigint, endIndex: bigint) => Promise<string>;
  hello: (name: string) => Promise<HelloResponse>;
  helloStream: (name: string) => Promise<AsyncIterable<HelloStreamResponse>>;
}

let clientIndexerInstance: PromiseClient<typeof IndexerService> | undefined = undefined;

export const useIndexer = (): IndexerResponse => {
  const getClient = async () => {
    const serviceRemote = process.env.EXPO_PUBLIC_SERVICE_REMOTE;
    if (!serviceRemote) {
      throw new Error("service remote address is undefined");
    }
    if (!clientIndexerInstance) {
      clientIndexerInstance = Grpc.createIndexerClient(serviceRemote);
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

  const formatHomePost = (homePosts: UserAndPostID[]): string => {
    let result = "[]UserAndPostID{";
    for (const homePost of homePosts) {
      result += `{"${homePost.userPostAddr}", ${homePost.postID}},`;
    }
    result += "}";

    return result;
  };

  const getHomePosts = async (userPostAddr: string, startIndex: bigint, endIndex: bigint): Promise<string> => {
    const client = await getClient();

    const homePostsResult = await client.getHomePosts({
      userPostAddr,
      startIndex,
      endIndex,
    });
    const homePosts = formatHomePost(homePostsResult.homePosts);

    console.log(`HomePosts: ${homePosts}`);
    return homePosts;
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
