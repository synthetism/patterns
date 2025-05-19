
# Event Emitter Pattern

## Overview

The Event Emitter pattern implements a specialized version of the Observer pattern focused on event-based communication. It allows objects to communicate without direct references to each other by sending events through a central event emitter. This pattern is particularly useful for building loosely coupled systems where components need to react to specific events without knowing the details of their source.

## Core Components

### Event Interface

```typescript
export interface Event {
  type: string;
}
```

This base interface defines the minimum structure for all events. The `type` property serves as an identifier for different kinds of events, allowing observers to selectively subscribe to specific event categories.

### EventObserver Interface

```typescript
export interface EventObserver<T extends Event> {
  update(event: T): void;
}
```

Objects implementing this interface can receive notifications about specific events. The generic parameter `T` ensures type safety for the event data structure.

### EventEmitter Class

```typescript
export class EventEmitter<T extends Event> {
  private observers: Map<string, EventObserver<T>[]> = new Map();

  subscribe(eventType: string, observer: EventObserver<T>): void { /* ... */ }
  unsubscribe(eventType: string, observer: EventObserver<T>): void { /* ... */ }
  emit(event: T): void { /* ... */ }
  hasObservers(eventType: string): boolean { /* ... */ }
}
```

The `EventEmitter<T>` class manages subscriptions and event distribution. It maintains a mapping between event types and their respective observers, ensuring events are only delivered to interested parties.

## Key Features

1. **Type-Based Filtering**: Events are filtered by type, ensuring observers only receive notifications for events they're interested in.
2. **Type-Safe Event Data**: The generic typing ensures that event data is consistent and type-safe.
3. **One-to-Many Communication**: A single event can notify multiple observers.
4. **Loose Coupling**: Event producers and consumers don't need direct references to each other.
5. **Subscription Management**: The API provides methods to subscribe, unsubscribe, and check for the existence of observers.

## API Reference

### `subscribe(eventType: string, observer: EventObserver<T>): void`

Registers an observer to receive notifications for a specific event type.

- **Parameters:**

  - `eventType`: The type of event to subscribe to
  - `observer`: The object that will receive event notifications
- **Behavior:**

  - If the observer is already subscribed to this event type, it won't be added again
  - Multiple observers can subscribe to the same event type

### `unsubscribe(eventType: string, observer: EventObserver<T>): void`

Removes an observer's subscription to a specific event type.

- **Parameters:**

  - `eventType`: The type of event to unsubscribe from
  - `observer`: The observer to remove from notifications
- **Behavior:**

  - If the observer isn't subscribed or the event type doesn't exist, does nothing
  - If removing the last observer for an event type, cleans up the event type entry

### `emit(event: T): void`

Sends an event to all observers subscribed to its type.

- **Parameters:**

  - `event`: The event object to emit, must include a `type` property
- **Behavior:**

  - Notifies all registered observers for the event's type
  - If no observers are subscribed to the event type, does nothing
  - Calls the `update` method on each observer, passing the event object

### `hasObservers(eventType: string): boolean`

Checks if there are any observers subscribed to a specific event type.

- **Parameters:**

  - `eventType`: The event type to check
- **Returns:**

  - `true` if there is at least one observer for the specified event type
  - `false` otherwise

## Usage Examples

### Basic Usage

```typescript
import { EventEmitter, EventObserver, Event } from '@synet/patterns';

// Define a custom event type
interface MessageEvent extends Event {
  type: 'info' | 'warning' | 'error';
  payload: {
    message: string;
    timestamp: Date;
  };
}

// Create observers
const logger: EventObserver<MessageEvent> = {
  update(event: MessageEvent): void {
    console.log(`[${event.type.toUpperCase()}] ${event.payload.message}`);
  }
};

const analyticsTracker: EventObserver<MessageEvent> = {
  update(event: MessageEvent): void {
    // Track event in analytics system
    console.log(`Tracking ${event.type} event at ${event.payload.timestamp}`);
  }
};

// Create event emitter
const events = new EventEmitter<MessageEvent>();

// Subscribe observers
events.subscribe('error', logger);
events.subscribe('warning', logger);
events.subscribe('info', logger);
events.subscribe('error', analyticsTracker);

// Emit events
events.emit({
  type: 'info',
  payload: {
    message: 'System started',
    timestamp: new Date()
  }
});

events.emit({
  type: 'error',
  payload: {
    message: 'Connection failed',
    timestamp: new Date()
  }
});
```

### Class-Based Observers

```typescript
import { EventEmitter, EventObserver, Event } from '@synet/patterns';

// Define event type
interface UserEvent extends Event {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  payload: {
    id: string;
    name?: string;
    email?: string;
  };
}

// Create an observer class
class UserLogger implements EventObserver<UserEvent> {
  update(event: UserEvent): void {
    switch (event.type) {
      case 'user.created':
        console.log(`New user created: ${event.payload.name} (${event.payload.id})`);
        break;
      case 'user.updated':
        console.log(`User updated: ${event.payload.id}`);
        break;
      case 'user.deleted':
        console.log(`User deleted: ${event.payload.id}`);
        break;
    }
  }
}

// Create event emitter and observer
const userEvents = new EventEmitter<UserEvent>();
const userLogger = new UserLogger();

// Subscribe to all user events
userEvents.subscribe('user.created', userLogger);
userEvents.subscribe('user.updated', userLogger);
userEvents.subscribe('user.deleted', userLogger);

// Emit an event
userEvents.emit({
  type: 'user.created',
  payload: {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com'
  }
});
```

## Integration Examples

### With Domain Entities

```typescript
import { EventEmitter, Event, UniqueId } from '@synet/patterns';

// Define domain events
interface OrderEvent extends Event {
  type: 'order.placed' | 'order.shipped' | 'order.delivered';
  payload: {
    orderId: string;
    customerId: string;
    timestamp: Date;
  };
}

// Order entity that emits events
class Order {
  private id: UniqueId;
  private customerId: UniqueId;
  private status: 'new' | 'placed' | 'shipped' | 'delivered';

  constructor(
    customerId: string,
    private eventEmitter: EventEmitter<OrderEvent>
  ) {
    this.id = new UniqueId();
    this.customerId = new UniqueId(customerId);
    this.status = 'new';
  }

  place(): void {
    this.status = 'placed';
  
    this.eventEmitter.emit({
      type: 'order.placed',
      payload: {
        orderId: this.id.toString(),
        customerId: this.customerId.toString(),
        timestamp: new Date()
      }
    });
  }

  ship(): void {
    this.status = 'shipped';
  
    this.eventEmitter.emit({
      type: 'order.shipped',
      payload: {
        orderId: this.id.toString(),
        customerId: this.customerId.toString(),
        timestamp: new Date()
      }
    });
  }

  deliver(): void {
    this.status = 'delivered';
  
    this.eventEmitter.emit({
      type: 'order.delivered',
      payload: {
        orderId: this.id.toString(),
        customerId: this.customerId.toString(),
        timestamp: new Date()
      }
    });
  }
}
```

## Best Practices

1. **Event Naming Conventions**: Use consistent naming for event types, such as `domain.action` (e.g., `user.created`, `order.shipped`).
2. **Immutable Event Objects**: Ensure event objects cannot be modified after they're created to prevent observers from affecting each other.
3. **Error Handling**: Consider adding error handling in the `emit` method to prevent one faulty observer from affecting others:

   ```typescript
   emit(event: T): void {
     const observers = this.observers.get(event.type) || [];
     for (const observer of observers) {
       try {
         observer.update(event);
       } catch (error) {
         console.error(`Error notifying observer for ${event.type}:`, error);
       }
     }
   }
   ```
4. **Clean Subscriptions**: Always unsubscribe observers that are no longer needed to prevent memory leaks.
5. **Avoid Circular Event Chains**: Be cautious about observers that might emit events that could trigger themselves.
6. **Type-Safe Event Definitions**: Use TypeScript's union types for the `type` property to ensure type safety:

   ```typescript
   interface AppEvent extends Event {
     type: 'user.login' | 'user.logout' | 'system.error';
     payload: UserPayload | SystemPayload;
   }
   ```
7. **Performance Considerations**: For high-frequency events, consider debouncing or batching events.

## Common Patterns

### Event Bus

Use an EventEmitter as a global communication channel:

```typescript
// Create a global event bus
export const eventBus = new EventEmitter<AppEvent>();

// Use in components
import { eventBus } from './events';

eventBus.subscribe('user.login', authObserver);
```

### Composite Events

Emit multiple events for a single action:

```typescript
function processOrder(order) {
  // Process the order...
  
  // Emit multiple related events
  eventEmitter.emit({ type: 'order.processed', payload: { orderId: order.id } });
  eventEmitter.emit({ type: 'inventory.updated', payload: { items: order.items } });
  eventEmitter.emit({ type: 'notification.send', payload: { userId: order.userId } });
}
```

### Event Sourcing

Use events as the primary record of state changes:

```typescript
class EventSourcedEntity {
  private state = {};
  
  applyEvent(event: AppEvent): void {
    // Update state based on event
    this.state = this.reducer(this.state, event);
  
    // Emit event for observers
    eventEmitter.emit(event);
  }
  
  private reducer(state, event): any {
    // State transition logic based on event type
    switch(event.type) {
      case 'entity.created': return { ...state, id: event.payload.id };
      case 'entity.updated': return { ...state, ...event.payload };
      default: return state;
    }
  }
}
```

## Limitations and Considerations

1. **Synchronous Execution**: The current implementation is synchronous, which may not be ideal for long-running operations.
2. **No Event Queueing**: Events are processed immediately; there's no built-in queueing mechanism.
3. **No Event History**: The emitter doesn't maintain a history of emitted events.
4. **No Wildcard Subscriptions**: Observers must subscribe to specific event types; there's no way to subscribe to all events.
5. **No Built-in Priority**: All observers are notified in the order they were added.

## Related Patterns

- **Command Pattern**: Where Event Emitter is reactive (responding to things that happened), Command pattern is proactive (requesting things to happen).
- **Mediator Pattern**: Similar to Event Emitter but typically involves more direct object-to-object communication.
- **Pub/Sub Pattern**: A more distributed version of the observer pattern, often used across systems rather than within them.

## Conclusion

The Event Emitter pattern in the `@synet/patterns` library provides a flexible, type-safe approach to event-based communication. By separating event producers from consumers, it enables building modular, maintainable systems where components can interact without direct dependencies. This pattern is particularly valuable for domain-driven design and event-driven architectures.
