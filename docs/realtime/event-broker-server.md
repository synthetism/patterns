
## EventBrokerServer

A lightweight event broker server that facilitates pub/sub messaging between distributed components.

## Overview

EventBrokerServer provides a minimal server implementation that allows clients to publish and subscribe to events without direct coupling. It supports:

- Topic-based messaging
- Connection monitoring
- Basic statistics and event monitoring
- Server-side event handling

## Usage

### Basic Setup

```typescript
import { NatsEventBrokerServer } from "@synet/realtime/server";
import { createLogger } from "@synet/logger";

const logger = createLogger({ /* logger options */ });

const broker = new NatsEventBrokerServer({
  transportOptions: {
    url: "nats://localhost:4222",
    reconnect: {
      enabled: true,
      maxAttempts: -1, // infinite
      delayMs: 1000
    }
  }
}, logger);

await broker.start();
console.log("Event broker server started");
```

### Monitoring Events

```typescript
// Listen for all events passing through the broker
broker.on("*", (event) => {
  logger.debug(`Event passing through: [${event.type}]`, event);
});

// Listen for client connections
broker.on("connection", (event) => {
  logger.info(`Client connected: ${event.data.clientId}`);
});

// Listen for client disconnections
broker.on("disconnection", (event) => {
  logger.info(`Client disconnected: ${event.data.clientId}`);
});

// Access statistics
setInterval(() => {
  const stats = broker.getStats();
  logger.info(`Active clients: ${stats.clientCount}, Messages: ${stats.messageCount}`);
}, 60000);
```

### Graceful Shutdown

```typescript
process.on('SIGINT', async () => {
  await broker.stop();
  process.exit(0);
});
```

## Architecture

The EventBrokerServer is designed to be minimal and focused. It:

1. Maintains no application state
2. Only relays messages between publishers and subscribers
3. Provides basic monitoring capabilities
4. Serves as a central connection point for distributed components

This design allows for maximum decoupling between components while providing the benefits of centralized monitoring.

## Implementations

You can find concrete implementations in [Github](https://github.com/synthetism/realtime)
or [npm package](http://npmjs.com/@synet/realtime)