import { createPromiseClient } from "@connectrpc/connect";
import { createXHRGrpcWebTransport } from "./transport_web";
import { IndexerService } from "@buf/gnolang_dsocial.connectrpc_es/indexerservice_connect";

// Create an indexer client
export function createIndexerClient(address: string) {
  return createPromiseClient(
    IndexerService,
    createXHRGrpcWebTransport({
      baseUrl: address,
    })
  );
}
