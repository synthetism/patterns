# Observer Pattern

## Overview

The Observer pattern establishes a relationship between objects where a subject (or publisher) notifies multiple observers (or subscribers) when its state changes. This pattern is implemented in two variants within the `@synet/patterns` library:

1. **Basic Observer Pattern** (observer.ts): Subject-based implementation for general state observation
2. **Event Emitter Pattern** (event-emitter.ts): Event-type based implementation for more granular event handling

## Basic Observer Pattern

### Core Components

#### Observer Interface

```typescript
export interface Observer<T> {
  update(data: T): void;
}
```

The `Observer<T>` interface defines objects that can receive notifications. The generic type parameter `T` represents the type of data passed to observers.

#### Subject Class

```typescript
export class Subject<T> {
  private observers: Observer<T>[] = [];

  subscribe(observer: Observer<T>): void { /* ... */ }
  unsubscribe(observer: Observer<T>): void { /* ... */ }
  notify(data: T): void { /* ... */ }
}
```

The `Subject<T>` class maintains a list of observers and notifies them when needed.

### Usage Example

```typescript
import { Subject, Observer } from '@synet/patterns';

// Define the data type to be observed
interface UserData {
  name: string;
  email: string;
}

// Create observers
class UserLogger implements Observer<UserData> {
  update(data: UserData): void {
    console.log(`User updated: ${data.name} (${data.email})`);
  }
}

class EmailService implements Observer<UserData> {
  update(data: UserData): void {
    console.log(`Sending email to: ${data.email}`);
  }
}

// Create the subject
const userSubject = new Subject<UserData>();

// Add observers
const logger = new UserLogger();
const emailer = new EmailService();

userSubject.subscribe(logger);
userSubject.subscribe(emailer);

// Notify all observers
userSubject.notify({ name: 'Alice', email: 'alice@example.com' });
```

## Event Emitter Pattern

### Core Components

#### Event Interface

```typescript
export interface Event {
  type: string;
}
```

The base `Event` interface defines the common structure for all events, with a required `type` property to categorize events.

#### EventObserver Interface

```typescript
export interface EventObserver<T extends Event> {
  update(event: T): void;
}
```

The `EventObserver<T>` interface defines objects that can respond to specific event types.

#### EventEmitter Class

```typescript
export class EventEmitter<T extends Event> {
  private observers: Map<string, EventObserver<T>[]> = new Map();

  subscribe(eventType: string, observer: EventObserver<T>): void { /* ... */ }
  unsubscribe(eventType: string, observer: EventObserver<T>): void { /* ... */ }
  emit(event: T): void { /* ... */ }
  hasObservers(eventType: string): boolean { /* ... */ }
}
```

The `EventEmitter<T>` class maintains a mapping of event types to their respective observers.

### Usage Example

```typescript
import { EventEmitter, EventObserver, Event } from '@synet/patterns';

// Define custom event types
interface UserEvent extends Event {
  type: 'user.login' | 'user.logout';
  payload: {
    userId: string;
    timestamp: Date;
  };
}

// Define observers
class SecurityMonitor implements EventObserver<UserEvent> {
  update(event: UserEvent): void {
    console.log(`Security: ${event.type} by user ${event.payload.userId}`);
  }
}

class AuditLogger implements EventObserver<UserEvent> {
  update(event: UserEvent): void {
    console.log(`Audit log: ${event.type} at ${event.payload.timestamp}`);
  }
}

// Create event emitter
const authEvents = new EventEmitter<UserEvent>();

// Register observers
const security = new SecurityMonitor();
const audit = new AuditLogger();

authEvents.subscribe('user.login', security);
authEvents.subscribe('user.login', audit);
authEvents.subscribe('user.logout', audit);

// Emit events
authEvents.emit({
  type: 'user.login',
  payload: {
    userId: 'user-123',
    timestamp: new Date()
  }
});
```

## Key Differences Between the Two Patterns

| Feature     | Subject-Observer                      | EventEmitter                               |
| ----------- | ------------------------------------- | ------------------------------------------ |
| Granularity | All observers notified of all changes | Selective notification based on event type |
| Filtering   | None built-in                         | Filtering by event type                    |
| Payload     | Single data type for all updates      | Event object with type-specific payload    |
| Use Case    | Simple state observation              | Complex event handling systems             |

## When to Use Each Pattern

**Use the Basic Observer Pattern when:**

- You have a single data type being observed
- All observers need to be notified of all changes
- You want a simpler implementation with fewer components

**Use the EventEmitter Pattern when:**

- You need to categorize different types of events
- Observers are only interested in specific event types
- You need more sophisticated event handling logic

## Best Practices

1. **Keep observers lightweight**: The `update` method should be efficient to avoid blocking the notification process.
2. **Avoid circular dependencies**: Be careful about observers triggering changes that cause more notifications.
3. **Handle errors gracefully**: Consider using try/catch blocks when notifying observers to prevent one failed observer from breaking the entire chain.
4. **Unsubscribe when done**: Always unsubscribe observers that are no longer needed to prevent memory leaks.
5. **Consider thread safety**: In multi-threaded environments, protect observer collections from concurrent modifications.
6. **Design event payloads carefully**: Include all necessary information in the event to avoid observers needing to fetch additional data.

## Integration with Other Patterns

The Observer pattern works well with other patterns in the `@synet/patterns` library:

- **ValueObject**: Use observers to track when important value objects change
- **Result**: Return Result objects from subscription methods to provide rich error information
- **Mediator**: Combine with the mediator pattern for more complex communication flows

## Performance Considerations

- For high-frequency events, consider batching notifications
- The EventEmitter pattern may perform better at scale due to selective notifications
- Consider using WeakRef or WeakMap for long-lived subjects with transient observers

## Thread Safety Note

The current implementation is not thread-safe. In multi-threaded environments, additional synchronization would be required when modifying the observer collections.
