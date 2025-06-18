## Realtime Server

The Realtime Server handles client connections, manages subscriptions, and broadcasts events to interested clients. It provides an abstraction over different transport mechanisms while enforcing consistent behavior.

### Architecture

```
┌─────────────────────────────┐
│   Server Application        │
└───────────────┬─────────────┘
                │
┌───────────────▼─────────────┐
│     RealtimeServer          │   High-level server interface
│  (WebSocket/NATS/GUN).      │   (broadcast, client management)
└───────────────┬─────────────┘
                │
┌───┬───────────▼───────┬─────┐
│   │   Subscriptions   │     │   Internal management
│   └───────────────────┘     │   (topic → clients mapping)
│                             │
│   ┌───────────────────┐     │
│   │  Client Registry  │     │   (client state tracking)
│   └───────────────────┘     │
└─────────────────────────────┘
```

### Key Interfaces

```typescript
export interface RealtimeServer {
  /**
   * Start the server
   */
  start(): Promise<void>;
  
  /**
   * Stop the server
   */
  stop(): Promise<void>;
  
  /**
   * Broadcast an event to all clients subscribed to a topic
   */
  broadcast(topic: Topic, event: RealtimeEvent): Promise<void>;
  
  /**
   * Get server statistics
   */
  getStats(): RealtimeServerStats;
  
  /**
   * Register an event handler
   */
  on<T extends ServerEventType>(event: T, handler: (data: unknown) => void): void;
  
  /**
   * Send event to specific client (optional feature)
   */
  sendToClient?(clientId: string, event: RealtimeEvent): Promise<void>;
}
```

### Events

The server emits the following events:

- `client.connected`: When a new client connects
- `client.disconnected`: When a client disconnects
- `message.received`: When a message is received from a client

### Transport Implementations

#### WebSocket Server

The WebSocket implementation uses native WebSocket or a WebSocket library (like `ws`) to handle connections. It maintains an in-memory mapping of topics to connected clients and forwards events accordingly.

#### NATS Server

The NATS implementation uses the NATS messaging system. It creates subscriptions for control messages and topics, and leverages NATS subjects for efficient message routing.

## Main README Addition

```markdown
# Synet Realtime Communication

Synet includes a powerful realtime communication framework that enables event-driven communication between server and clients. The framework abstracts away the underlying transport mechanisms, allowing applications to focus on business logic rather than communication details.

## Features

- **Transport Agnostic**: Supports WebSocket and NATS with a consistent API
- **Topic-Based Subscriptions**: Subscribe to specific event topics
- **Type-Safe Event Handling**: TypeScript interfaces for events
- **Automatic Reconnection**: Handles network disruptions gracefully
- **Event Emitter Pattern**: Familiar observer pattern for event handling
- **Direct Channel Access**: For advanced use cases

## Client Usage

```typescript
import { client } from "./services/realtime";

// Initialize connection to topics
await client.init(["users", "notifications"]);

// Subscribe to specific events
const emitter = client.getEventEmitter();
emitter.subscribe("users.created", {
  update: (event) => {
    console.log("User created:", event);
  }
});

// Publish events
await client.publish("users", {
  id: crypto.randomUUID(),
  type: "users.message",
  source: "client",
  timestamp: new Date(),
  data: { message: "Hello from client!" }
});
```

## Server Usage

```typescript
import { RealtimeServerFactory } from "./infrastructure/servers/realtime-server-factory";

// Create a server
const server = RealtimeServerFactory.create({
  type: process.env.REALTIME_SERVER_TYPE || "websocket",
  // Configuration options...
});

// Start the server
await server.start();

// Monitor connections
server.on("client.connected", (data) => {
  console.log("Client connected:", data);
});

// Broadcast events
server.broadcast("users", {
  id: crypto.randomUUID(),
  type: "users.update",
  source: "server",
  timestamp: new Date(),
  data: { message: "Important update!" }
});
```

## Configuration

The realtime framework can be configured via environment variables:

- `REALTIME_TRANSPORT`: Specify the transport mechanism (`websocket` or `nats`)
- `WEBSOCKET_URL`: WebSocket server URL (default: `ws://localhost:3030`)
- `NATS_URL`: NATS server URL (default: `nats://localhost:4222`)
- `NATS_USER`: NATS username (if authentication is enabled)
- `NATS_PASSWORD`: NATS password (if authentication is enabled)

```

Client side:

[realtime-client.md](https://github.com/synthetism/patterns/blob/main/docs/realtime/realtime-client.md) 

[realtime-provider-channel.md](https://github.com/synthetism/patterns/blob/main/docs/realtime/realtime-provider-channel.md) 

Implementations:

You can find ready to use implementations in [Github](https://github.com/synthetism/realtime)
or [npm package](http://npmjs.com/@synet/realtime)

```
