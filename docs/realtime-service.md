
# Realtime Service Pattern

## Overview

The RealtimeService pattern provides a consistent abstraction layer for connecting to external real-time data sources. It builds on the EventEmitter pattern to create a standardized interface for subscribing to external events while maintaining type safety.

This pattern decouples your application from specific real-time implementations (like Supabase, Firebase, WebSockets, etc.) while providing a unified way to handle events throughout your application.

## Pattern Structure

```
[External Source] → [RealtimeService<E,C>] → [EventEmitter<E>] → [EventObserver<E>]
```

## Core Components

### RealtimeService Interface

```typescript
/**
 * Generic interface for services that connect to external real-time data sources
 * 
 * @typeParam E - Event type this service will emit (must extend Event)
 * @typeParam C - Connection type this service will return
 */
export interface RealtimeService<E extends Event = Event, C = unknown> {
  /**
   * Subscribe to real-time events for a specific entity
   * @param entityName Name of the entity to subscribe to
   * @returns A connection handle
   */
  subscribeToEntity(entityName: string): C;
  
  /**
   * Unsubscribe from a connection
   * @param connection Connection to unsubscribe from
   */
  unsubscribe(connection: C): void;
  
  /**
   * Get the EventEmitter that broadcasts events
   */
  getEventEmitter(): EventEmitter<E>;
  
  /**
   * Clean up all connections
   */
  cleanup(): void;
}
```

### Implementation Example

```typescript
mport type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import type { DbEvent } from "~/domain/events/db-events";
import { EventEmitter, RealtimeService } from "@synet/patterns";

/**
 * Supabase implementation of RealtimeService
 */
export class SupabaseRealtimeService implements RealtimeService<DbEvent, RealtimeChannel> {
  private eventEmitter: EventEmitter<DbEvent>;
  private channels: RealtimeChannel[] = [];

  constructor(private supabase: SupabaseClient) {
    this.eventEmitter = new EventEmitter<DbEvent>();
  }

  subscribeToEntity(entityName: string): RealtimeChannel {
    const channel = this.supabase
      .channel(`${entityName}-changes`)
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: entityName 
      }, (payload) => {
        try {
          if (payload.eventType === "INSERT") {
            this.eventEmitter.emit(`${entityName}.insert`, {
              entityName,
              eventType: "insert",
              data: payload.new
            });
          } 
          else if (payload.eventType === "UPDATE") {
            ...
          } 
          else if (payload.eventType === "DELETE") {
            this.eventEmitter.emit(`${entityName}.delete`, {
              entityName,
              eventType: "delete",
              data: payload.old
            });
          }
        } catch (error) {
          console.error("Error handling realtime event:", error);
        }
      })
      .subscribe();
  
    this.channels.push(channel);
    return channel;
  }

  unsubscribe(channel: RealtimeChannel): void {
    this.supabase.removeChannel(channel);
    this.channels = this.channels.filter(c => c !== channel);
  }

  getEventEmitter(): EventEmitter<DbEvent> {
    return this.eventEmitter;
  }

  cleanup(): void {
    for (const channel of this.channels) {
      this.supabase.removeChannel(channel);
    }
    this.channels = [];
  }
}
```

### Using the RealtimeService

```typescript

import type { CacheRepository } from "~/domain/interfaces/cache-repository";
import type { DbEvent } from "~/domain/events/db-events";
import type { EventObserver, RealtimeService } from "@synet/patterns";

/**
 * Service that invalidates cache entries when database changes occur
 */
export class CacheInvalidationService implements EventObserver<DbEvent> {
  private channels: unknown[] = [];
  
  constructor(
    private realtimeService: RealtimeService<DbEvent>,
    private cache: CacheRepository
  ) {}
  
  initialize(): void {
    // Subscribe to the entry entity
    this.channels.push(this.realtimeService.subscribeToEntity("entry"));
  
    // Subscribe to relevant events
    const eventEmitter = this.realtimeService.getEventEmitter();
    eventEmitter.subscribe("entry.insert", this);
    eventEmitter.subscribe("entry.update", this);
    eventEmitter.subscribe("entry.delete", this);
  }
  
  // EventObserver implementation
  onEvent(event: DbEvent): void {
    if (isEntryInsertEvent(event) || isEntryUpdateEvent(event)) {
      this.cache.setKey(`entry:${event.data.id}`, event.data);
    }
    else if (isEntryDeleteEvent(event)) {
      this.cache.deleteKey(`entry:${event.data.id}`);
    }
  }
  
  cleanup(): void {
    // Unsubscribe from all channels
    for (const channel of this.channels) {
      this.realtimeService.unsubscribe(channel);
    }
    this.channels = [];
  }
}
```

## Before and After

### Before: Directly Coupled to Supabase

```typescript
class CacheService {
  private channels: RealtimeChannel[] = [];

  constructor(private supabase: SupabaseClient, private cache: Cache) {}

  initialize() {
    // Directly coupled to Supabase
    const channel = this.supabase
      .channel('entries')
      .on('postgres_changes', { event: '*', table: 'entries' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          this.cache.set(`entry:${payload.new.id}`, payload.new);
        } else if (payload.eventType === 'DELETE') {
          this.cache.delete(`entry:${payload.old.id}`);
        }
      })
      .subscribe();

    this.channels.push(channel);
  }

  cleanup() {
    for (const channel of this.channels) {
      this.supabase.removeChannel(channel);
    }
  }
}
```

### After: Using RealtimeService Pattern

```typescript
class CacheService {
  private channels: unknown[] = [];

  constructor(
    // Depends on abstract RealtimeService, not concrete implementation
    private realtimeService: RealtimeService<DbEvent>,
    private cache: Cache
  ) {}

  initialize() {
    // Subscribe to entity through the RealtimeService
    this.channels.push(this.realtimeService.subscribeToEntity("entry"));
  
    // Use typed event handler
    const emitter = this.realtimeService.getEventEmitter();
  
    // Handle insert and update events
    emitter.subscribe("entry.insert", (event) => {
      this.cache.set(`entry:${event.data.id}`, event.data);
    });
  
    emitter.subscribe("entry.update", (event) => {
      this.cache.set(`entry:${event.data.id}`, event.data);
    });
  
    // Handle delete events
    emitter.subscribe("entry.delete", (event) => {
      this.cache.delete(`entry:${event.data.id}`);
    });
  }

  cleanup() {
    // Clean up through the service
    for (const channel of this.channels) {
      this.realtimeService.unsubscribe(channel);
    }
  }
}
```

## Why Use This Pattern?

1. **Abstraction**: Decouples your code from specific real-time implementations
2. **Type Safety**: Enforces proper typing for events across your application
3. **Consistency**: Provides a standard way to handle external events
4. **Testability**: Makes mocking external event sources easier
5. **Simplicity**: Builds on the well-understood EventEmitter pattern

## Key Design Principles

The Realtime Service pattern builds upon the robust EventEmitter pattern to create a higher-level abstraction specifically for external event sources. By layering abstractions this way, we follow the principle that higher-level abstractions should consist of fewer, more focused components.

This approach lets you build modular, maintainable systems where each layer has clear responsibilities:

- EventEmitter: Core pub/sub functionality
- RealtimeService: Adapter for external event sources
- Application Services: Business logic that reacts to events
