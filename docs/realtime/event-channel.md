### EventChannel

A client-side abstraction for publishing and subscribing to events in a distributed system.

## Overview

EventChannel provides a clean, type-safe interface for components to communicate via events. Key features:

- Type-safe event publishing and handling
- Connection management with automatic reconnection
- Simple subscription API with wildcard support
- Minimal dependencies

## Usage

### Basic Setup

```typescript
import { NatsEventChannel } from "@synet/realtime/client";
import type { LoggerEvent } from "./domain/events/types";

// Create a typed event channel
const eventChannel = new NatsEventChannel<LoggerEvent>(
  "nats://localhost:4222",
  "notifications",
  { reconnect: { enabled: true } }
);

// Connect to the broker
await eventChannel.connect();

// Get the channel's unique ID
const clientId = eventChannel.getId();
```

### Subscribing to Events

```typescript
// Subscribe to a specific event type
eventChannel.on("error", (event) => {
  console.error(`Error event: ${event.data.message}`, event.data.metadata);
});

// Subscribe to all events (wildcard)
eventChannel.on("*", (event) => {
  console.log(`Received: [${event.type}] ${event.data.message}`);
});

// Subscription returns an unsubscribe function
const unsubscribe = eventChannel.on("user.login", (event) => {
  console.log(`User logged in: ${event.data.userId}`);
});

// Later: stop receiving events
unsubscribe();
```

### Publishing Events

```typescript
// Publish an event to all subscribers
await eventChannel.publish({
  type: "logger.info",
  data: {
    message: "System started successfully",
    context: "startup"
  }
});
```

### Cleanup

```typescript
// Close the connection when done
await eventChannel.close();
```

## Integration Examples

### Logger Integration

```typescript
import { Logger } from "@synet/logger";
import { NatsEventChannel } from "@synet/realtime/client";

const eventChannel = new NatsEventChannel(
  "nats://localhost:4222", 
  "system-logs"
);

// Connect the channel
await eventChannel.connect();

// Create logger that publishes to the event channel
const logger = new Logger({
  onLog: (level, message, context, meta) => {
    eventChannel.publish({
      type: `logger.${level.toLowerCase()}`,
      data: { message, context, ...meta }
    });
  }
});

// Use the logger as normal
logger.info("Application started");
logger.error("Connection failed", { retryCount: 3 });
```

### Monitoring Dashboard

```typescript
const logsChannel = new NatsEventChannel(
  "nats://localhost:4222",
  "system-logs"
);

await logsChannel.connect();

// Display errors prominently
logsChannel.on("logger.error", (event) => {
  displayErrorAlert(event.data.message, event.data.context);
});

// Log all events to console
logsChannel.on("*", (event) => {
  addToLogHistory(event);
});
```

## Design Philosophy

The EventChannel pattern is designed with these principles:

1. **Decoupling** - Components communicate without direct dependencies
2. **Type Safety** - Events are fully typed for better developer experience
3. **Simplicity** - Minimal API surface with intuitive methods
4. **Resilience** - Automatic reconnection and error handling

## Implementation Guidelines

### EventBrokerServer Implementation

```typescript
import type { Logger } from "@synet/logger";
import type { RealtimeEvent, RealtimeServerOptions } from "@synet/patterns/realtime";

/**
 * Core interface for EventBrokerServer implementations
 */
export interface EventBrokerServer {
  /**
   * Start the event broker
   */
  start(): Promise<void>;
  
  /**
   * Stop the event broker and clean up resources
   */
  stop(): Promise<void>;
  
  /**
   * Register an event handler
   * @param type Event type to listen for, or "*" for all events
   * @param handler Function to call when matching events are received
   * @returns Function to call to unregister the handler
   */
  on(type: string, handler: (event: any) => void): () => void;
  
  /**
   * Get current broker statistics
   */
  getStats(): { messageCount: number; clientCount: number };
}

/**
 * Base implementation with common functionality for event broker servers
 */
export abstract class BaseEventBrokerServer implements EventBrokerServer {
  protected eventHandlers = new Map<string, Set<(event: any) => void>>();
  protected stats = { messageCount: 0, clientCount: 0 };
  
  constructor(
    protected options: RealtimeServerOptions<any> = {},
    protected logger?: Logger
  ) {}
  
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  
  /**
   * Register an event handler
   */
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
  
  /**
   * Get current broker statistics
   */
  getStats(): { messageCount: number; clientCount: number } {
    return { ...this.stats };
  }
  
  /**
   * Notify registered event handlers
   */
  protected notifyHandlers(type: string, event: any): void {
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
}
```

### EventChannel Implementation

```typescript
import type { RealtimeEvent } from "@synet/patterns/realtime";

/**
 * Core interface for EventChannel implementations
 */
export interface EventChannel<TEvent extends RealtimeEvent = RealtimeEvent> {
  /**
   * Connect to the event broker
   */
  connect(): Promise<void>;
  
  /**
   * Subscribe to events
   * @param type Event type to listen for, or "*" for all events
   * @param handler Function to call when matching events are received
   * @returns Function to call to unsubscribe
   */
  on<T extends TEvent = TEvent>(type: string, handler: (event: T) => void): () => void;
  
  /**
   * Publish an event
   * @param event The event to publish
   */
  publish(event: TEvent): Promise<void>;
  
  /**
   * Close the connection and clean up resources
   */
  close(): Promise<void>;
  
  /**
   * Get the unique ID of this channel instance
   */
  getId(): string;
}

/**
 * Base implementation with common functionality for event channels
 */
export abstract class BaseEventChannel<TEvent extends RealtimeEvent = RealtimeEvent> 
  implements EventChannel<TEvent> {
  
  protected eventHandlers = new Map<string, Set<(event: TEvent) => void>>();
  
  constructor(
    protected url: string,
    public readonly topic: string
  ) {}
  
  abstract connect(): Promise<void>;
  abstract publish(event: TEvent): Promise<void>;
  abstract close(): Promise<void>;
  abstract getId(): string;
  
  /**
   * Subscribe to events
   */
  on<T extends TEvent = TEvent>(type: string, handler: (event: T) => void): () => void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, new Set());
    }

    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.add(handler as (event: TEvent) => void);
    }
  
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
  
  /**
   * Notify registered event handlers
   */
  protected notifyHandlers(event: TEvent): void {
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

```

## Implementations

You can find concrete implementations in [Github](https://github.com/synthetism/realtime)
or [npm package](http://npmjs.com/@synet/realtime)