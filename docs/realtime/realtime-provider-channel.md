# RealtimeProvider & RealtimeChannel

These are the low-level abstractions for implementing realtime transports following Supabase implementation. Using Realtime Service, you can plug-in Supabase and your own implementations into one Event Emitter. You will thank yourself later.

## RealtimeProvider

A `RealtimeProvider` is responsible for creating and managing realtime channels.  
It can be implemented for any backend: Supabase, WebSocket, GUN, etc.

**Key methods:**
- `createChannel(topic, options)`: Create a new channel for a topic.
- `removeChannel(channel)`: Remove and clean up a channel.
- `getChannels()`: List all active channels.
- `disconnect()`: Clean up all channels.

## RealtimeChannel

A `RealtimeChannel` represents a bidirectional communication channel for a topic.

**Key methods:**
- `connect()`: Establish the connection.
- `on(selector, handler)`: Subscribe to incoming events.
- `emit(event)`: Send an event.
- `close()`: Close the channel.

## Example: WebSocket Provider

```typescript
const provider = new WebSocketRealtimeProvider("wss://example.com");
const channel = provider.createChannel("chat");

channel.on("message", (event) => {
  console.log("Received:", event);
});

channel.emit({ type: "message", payload: "Hello!" });
```

## Example: GUN Provider

```typescript
const provider = new GunRealtimeProvider("http://localhost:8765");
const channel = provider.createChannel("updates");

channel.on("update", (event) => {
  console.log("GUN update:", event);
});
```

See [websocket-provider.ts](https://github.com/anton-ecom/patterns/blob/main/docs/examples/realtime/websocket-provider.ts) and [gun-provider.ts](https://github.com/anton-ecom/patterns/blob/main/docs/examples/realtime/gun-provider.ts) for real implementations.

```
