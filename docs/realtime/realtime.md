# Realtime Communication Pattern

Realtime communication framework that enables event-driven communication between server and clients. The framework abstracts away the underlying transport mechanisms, allowing applications to focus on business logic rather than communication details.

## Features

- **Transport Agnostic**: Supports WebSocket and NATS with a consistent API
- **Topic-Based Subscriptions**: Subscribe to specific event topics
- **Type-Safe Event Handling**: TypeScript interfaces for events
- **Automatic Reconnection**: Handles network disruptions gracefully
- **Event Emitter Pattern**: Familiar observer pattern for event handling
- **Direct Channel Access**: For advanced use cases

### Realtime Client 

The Realtime Client provides a seamless way to connect to remote event streams, subscribe to topics of interest, and publish events. It abstracts the underlying transport mechanisms (WebSocket, NATS) while providing a consistent interface for applications.

See [realtime-client.md](https://github.com/synthetism/patterns/blob/main/docs/realtime/realtime-client.md) for details and examples.

### Realtime Service [Depricated]

A consumer-facing abstraction for subscribing to realtime events, regardless of the underlying provider (Supabase, WebSocket, GUN, etc).
See [realtime-service.md](https://github.com/synthetism/patterns/blob/main/docs/realtime/realtime-service.md) for details and examples.

### Realtime Provider &amp; Channel

Low-level abstractions for implementing realtime transports and channels following Supabase Realtime implementation, but you can plug any service this way and connect it to [Event Emitter](https://github.com/synthetism/patterns/blob/main/docs/event-emitter.md) pattern.

See  [realtime-provider-channel.md](https://github.com/synthetism/patterns/blob/main/docs/realtime/realtime-provider-channel.md) for short intro and working examples.

---


``

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

Server usage:

``` typescript
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

## Contributing

I maintain these patterns for my own projects, but PRs and issues are welcome!
If you find a bug or want to suggest an improvement, open an issue or pull request
