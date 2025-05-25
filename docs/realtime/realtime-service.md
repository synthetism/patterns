# RealtimeService

The `RealtimeService` pattern provides a unified, high-level API for subscribing to realtime events in your application, regardless of the underlying transport (Supabase, WebSocket, GUN, etc).

**Why?**
I needed a way to consume realtime events in a consistent way, even as the backend changed. This abstraction lets you swap providers without rewriting your business logic.

## Features

- Subscribe to events by topic/entity
- Emits events via a type-safe `EventEmitter`
- Handles channel management and cleanup
- Works with any provider that implements the `RealtimeProvider` interface

## Example: Supabase Integration

```typescript
import { SupabaseRealtimeService } from "./supabase-realtime-service";
import { supabase } from "~/database";

const realtimeService = new SupabaseRealtimeService(supabase);
realtimeService.initializeSubscriptions(["Entry"]);

const emitter = realtimeService.getEventEmitter();
emitter.subscribe("entry.insert", {
  update(event) {
    console.log("Entry inserted:", event.payload);
  }
});
```

## API

- `initializeSubscriptions(entities: string[])`: Subscribe to changes for multiple entities.
- `getEventEmitter()`: Get the event emitter for subscribing to events.
- `cleanup()`: Unsubscribe from all channels.

See [supabase-realtime-service.ts](../../app/app/infrastructure/services/supabase-realtime-service.ts) for a full example.

```
