import { WebSocketRealtimeProvider } from "./websocket-provider";
import type { RealtimeProviderOptions } from "@synet/patterns/realtime/client";
import type { WebsocketOptions } from "./websocket-types";

/**
 * Creates a new Gateway client
 * @param gatewayUrl The URL of the gateway server
 * @param options Configuration options for the gateway client
 */
export function createWebsocketClient(
  gatewayUrl: string,
  options: RealtimeProviderOptions<WebsocketOptions> = {},
): WebSocketRealtimeProvider {
  return new WebSocketRealtimeProvider(gatewayUrl, options);
}

export type { RealtimeChannel } from "../../../domain/patterns/realtime-channel";
export type { RealtimeEvent } from "../../../domain/patterns/realtime-event";
export { ChannelState } from "../../../domain/patterns/realtime-channel";
