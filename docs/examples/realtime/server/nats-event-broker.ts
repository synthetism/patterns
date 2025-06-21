// Simplified NATS server

import { EventBrokerServer } from "@synet/patterns/server";
import { connect, StringCodec, type NatsConnection, type Subscription } from "nats";
import type { Logger } from "@synet/logger";
import type { 
  RealtimeServerOptions,
  Topic,
  RealtimeEvent
} from "@synet/patterns/realtime";

export interface NatsServerOptions {
  url?: string;
  user?: string;
  password?: string;
  token?: string;
  reconnect?: {
    enabled: boolean;
    maxAttempts: number;
    delayMs: number;
  };
}
  
export class NatsEventBrokerServer implements EventBrokerServer {
  private natsConnection?: NatsConnection;
  private stats = { messageCount: 0, clientCount: 0 };
  private eventHandlers = new Map<string, Set<(event: RealtimeEvent) => void>>();
  private stringCodec = StringCodec();

  constructor(    
    private options: RealtimeServerOptions<NatsServerOptions> = {},
      private logger?: Logger
    ) {}
  
  async start(): Promise<void> {
    const natsUrl = this.options.transportOptions?.url || "nats://localhost:4222";

    this.natsConnection = await connect({
        servers: natsUrl,
        user: this.options.transportOptions?.user,
        pass: this.options.transportOptions?.password,
        token: this.options.transportOptions?.token,
        reconnect: this.options.transportOptions?.reconnect?.enabled !== false,
        maxReconnectAttempts: this.options.transportOptions?.reconnect?.maxAttempts || -1,
        reconnectTimeWait: this.options.transportOptions?.reconnect?.delayMs || 1000,
    });


    this.logger?.debug(`NATS Event Broker connected to ${natsUrl}`);
    
    await this.setupSubscriptions();

  }

 private async setupSubscriptions(): Promise<void> {
  
    if (!this.natsConnection) return;

        // Set up minimal control channel for connection tracking
    const controlSub = this.natsConnection.subscribe("control.*");
    
    (async () => {
      for await (const msg of controlSub) {
        try {
          // Simple connection tracking for stats only
          if (msg.subject === "control.connect") {
            this.stats.clientCount++;
            
            // Notify handlers about the connection event
            const connectData = JSON.parse(this.stringCodec.decode(msg.data));
            this.notifyHandlers("connection", {
              type: "connection",
              data: connectData
            });
          } else if (msg.subject === "control.disconnect") {
            this.stats.clientCount--;
            
            // Notify handlers about the disconnect event
            const disconnectData = JSON.parse(this.stringCodec.decode(msg.data));
            this.notifyHandlers("disconnection", {
              type: "disconnection",
              data: disconnectData
            });
          }
        } catch (error) {
          this.logger?.error("Error processing control message:", error);
        }
      }
    })();
    
    // Subscribe to all topic messages for monitoring
    const topicSub = this.natsConnection.subscribe("topic.*");
    
    (async () => {
      for await (const msg of topicSub) {
        try {
          this.stats.messageCount++;
          const event = JSON.parse(this.stringCodec.decode(msg.data));
          
          // Notify handlers about the event
          this.notifyHandlers(event.type, event);
          this.notifyHandlers("*", event);
        } catch (error) {
          this.logger?.error("Error processing topic message:", error);
        }
      }
    })();

  }

  on(type: string, handler: (event: any) => void): () => void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, new Set());
    }

    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.add(handler);
    }
    
    return () => {
      const handlers = this.eventHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(type);
        }
      }
    };
  }
  
  private notifyHandlers(type: string, event: any): void {
    // Notify type-specific handlers
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(event);
        } catch (error) {
          this.logger?.error(`Error in event handler for ${type}:`, error);
        }
      }
    }
  }

  getStats(): { messageCount: number; clientCount: number } {
    return { ...this.stats };
  }
  
  async stop(): Promise<void> {
    await this.natsConnection?.close();
  }
}