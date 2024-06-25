import { createPromiseClient } from "@connectrpc/connect";
import { createXHRGrpcWebTransport } from "./transport_web";
import { IndexerService } from "@buf/gnolang_dsocial-indexer.connectrpc_es/indexerservice_connect";
import { NotificationService } from "@buf/gnolang_dsocial-notification.connectrpc_es/notificationservice_connect";

// Create an indexer client
export function createIndexerClient(address: string) {
  return createPromiseClient(
    IndexerService,
    createXHRGrpcWebTransport({
      baseUrl: address,
    })
  );
}

// Create an push notitication client
export function createNotificationClient(address: string) {
  return createPromiseClient(
    NotificationService,
    createXHRGrpcWebTransport({
      baseUrl: address,
    })
  );
}
