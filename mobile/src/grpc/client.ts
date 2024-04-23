import { createPromiseClient } from "@connectrpc/connect";
import { createXHRGrpcWebTransport } from "./transport_web";
import { IndexerService } from "@gno/api/indexer/indexerservice_connect";

// Create an indexer client
export function createIndexerClient(address: string) {
  return createPromiseClient(
    IndexerService,
    createXHRGrpcWebTransport({
      baseUrl: address,
    })
  );
}
