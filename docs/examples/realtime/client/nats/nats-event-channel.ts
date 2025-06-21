import { EventChannel } from "@synet/patterns/realtime/client";
import { connect, StringCodec, type  NatsConnection, type Subscription } from "nats";
import crypto from "node:crypto";
import type {
  RealtimeEvent,
  RealtimeProviderOptions,
} from "@synet/patterns/realtime/client";
import type { NatsOptions } from "./nats-types";

export class NatsEventChannel<TEvent extends RealtimeEvent = RealtimeEvent> implements EventChannel<TEvent> {
  readonly id = crypto.randomUUID();
  private natsConnection?: NatsConnection;
  private subscription?: Subscription;
  private stringCodec = StringCodec();
  private eventHandlers = new Map<string, Set<(event: TEvent) => void>>();
  
  constructor(
    private url: string,
    public readonly topic: string,
    private options: RealtimeProviderOptions<NatsOptions> = {}
  ) {}
  
  async connect(): Promise<void> {

     const natsConfig = {
      servers: this.url,
      user: this.options.transportOptions?.user,
      pass: this.options.transportOptions?.password,
      token: this.options.transportOptions?.token,
      reconnect: this.options.reconnect?.enabled !== false,
      maxReconnectAttempts: this.options.transportOptions?.maxReconnects || 
                          this.options.reconnect?.maxAttempts || -1,
      reconnectTimeWait: this.options.transportOptions?.reconnectTimeWait || 
                        this.options.reconnect?.initialDelayMs || 1000,
    };

    this.natsConnection = await connect(natsConfig);
    
    const subjectPrefix = this.options.transportOptions?.subjectPrefix || "topic";
    const topicSubject = `${subjectPrefix}.${this.topic}`;

    // Subscribe to topic
    this.subscription = this.natsConnection.subscribe(topicSubject);
    
    // Process incoming messages
    (async () => {
      if (!this.subscription) return;
      
      for await (const msg of this.subscription) {
        try {
          const event = JSON.parse(this.stringCodec.decode(msg.data)) as TEvent;
          this.notifyHandlers(event);
        } catch (error) {
          console.error("Error processing message:", error);
        }
      }
    })();
    
     const connectionMessage = {
        clientId: this.id,
        topic: this.topic,
        timestamp: new Date()
      };

    // Notify server of connection
    this.natsConnection.publish("control.connect", this.stringCodec.encode(
      JSON.stringify(connectionMessage)
    ));
  }
  
  on<T extends TEvent>(type: string, handler: (event: T) => void): () => void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, new Set());
    }

   const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.add(handler as (event: TEvent) => void);
    }

    this.eventHandlers.get(type);
    
      return () => {
      const handlers = this.eventHandlers.get(type);
      if (handlers) {
        handlers.delete(handler as (event: TEvent) => void);
        if (handlers.size === 0) {
          this.eventHandlers.delete(type);
        }
      }
    };
  }
  
  getId(): string {
    return this.id;
  }
  async publish(event: TEvent): Promise<void> {
    if (!this.natsConnection) {
      await this.connect();
    }
    
    const completeEvent = {
      ...event,
      clientId: this.id || 'anonymous',
      timestamp: event.timestamp || new Date()
    };
    
    this.natsConnection?.publish(
      `topic.${this.topic}`,
      this.stringCodec.encode(JSON.stringify(completeEvent))
    );
  }
  
  private notifyHandlers(event: TEvent): void {
    // Notify type-specific handlers
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in handler for ${event.type}:`, error);
        }
      }
    }
    
    // Notify wildcard handlers
    const wildcardHandlers = this.eventHandlers.get("*");
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in wildcard handler:', error);
        }
      }
    }
  }
  
  async close(): Promise<void> {
    if (this.natsConnection) {
      this.natsConnection.publish("control.disconnect", this.stringCodec.encode(
        JSON.stringify({ clientId: this.id, topic: this.topic })
      ));
      await this.natsConnection.close();
    }
  }
}