# Realtime Client

The Realtime Client provides a seamless way to connect to remote event streams, subscribe to topics of interest, and publish events. It abstracts the underlying transport mechanisms (WebSocket, NATS) while providing a consistent interface for applications.

### Architecture

The Realtime Client architecture follows a layered approach:

```
┌─────────────────────────────┐
│     Application Layer       │
└───────────────┬─────────────┘
                │
┌───────────────▼─────────────┐
│     RealtimeClient          │   High-level client interface
│  (GatewayRealtimeClient)    │   (subscribe, publish, event emitter)
└───────────────┬─────────────┘
                │
┌───────────────▼─────────────┐
│     RealtimeProvider        │   Provider abstraction
│  (WebSocket/NATS Provider)  │   (createChannel, connection management)
└───────────────┬─────────────┘
                │
┌───────────────▼─────────────┐
│     RealtimeChannel         │   Channel implementation
│  (WebSocket/NATS Channel)   │   (on, emit, connection handling)
└───────────────┬─────────────┘
                │
┌───────────────▼─────────────┐
│   Transport Layer           │   Low-level transport
│  (WebSocket/NATS)           │
└─────────────────────────────┘
```

### Client vs Service Implementation

#### Client Implementation (`RealtimeClient`)

- **Purpose**: Direct integration into application code to connect to realtime servers
- **Methods**: `subscribe()`, `unsubscribe()`, `publish()`, `getEventEmitter()`, etc.
- **Ownership**: Application owns the client instance
- **Lifecycle**: Typically matches the application's lifecycle
- **Example**: `GatewayRealtimeClient` used directly in components

#### Service Implementation

- **Purpose**: Provides a singleton, pre-configured client instance
- **Exports**: An already initialized client and helper functions
- **Ownership**: The service owns the client instance
- **Lifecycle**: Usually application-wide singleton
- **Example**: `websocket.ts` or `nats.ts` service modules that export `client` and `initializeEventSubscriptions()`

### Key Interfaces

```typescript
export interface RealtimeClient {
  /**
   * Initialize with topics to subscribe to
   */
  init(topics: Topic[]): Promise<void>;
  
  /**
   * Subscribe to a topic
   */
  subscribe(topic: Topic): RealtimeChannel;
  
  /**
   * Unsubscribe from a topic
   */
  unsubscribe(topic: Topic): Promise<void>;
  
  /**
   * Publish an event to a topic
   */
  publish(topic: Topic, event: RealtimeEvent): Promise<void>;
  
  /**
   * Get the event emitter for subscribing to events
   */
  getEventEmitter(): EventEmitter<RealtimeEvent>;
}
```

### Usage Example

```typescript
// Using client directly
const client = new GatewayRealtimeClient(provider);
await client.init(["users", "notifications"]);
const emitter = client.getEventEmitter();
emitter.subscribe("users.created", userCreatedHandler);

// Using service approach
import { client, initializeEventSubscriptions } from "./services/realtime";
await client.init(["users", "notifications"]);
initializeEventSubscriptions();
```

See also:

[realtime-server.md](https://github.com/anton-ecom/patterns/blob/main/docs/realtime/realtime-server.md) 

[realtime-provider-channel.md](https://github.com/anton-ecom/patterns/blob/main/docs/realtime/realtime-provider-channel.md) 