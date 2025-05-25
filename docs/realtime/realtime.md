# Realtime Patterns

### Realtime Service

A consumer-facing abstraction for subscribing to realtime events, regardless of the underlying provider (Supabase, WebSocket, GUN, etc).
See [realtime-service.md](https://github.com/anton-ecom/patterns/tree/main/docs/realtime/realtime-service.md) for details and examples.

### [Realtime Provider &amp; Channel]

Low-level abstractions for implementing realtime transports and channels following Supabase Realtime implementation, but you can plug any service this way and connect it to [Event Emitter](https://github.com/anton-ecom/patterns/tree/main/docs/event-emitter.md) pattern.

See  [realtime-provider-channel.md](https://github.com/anton-ecom/patterns/tree/main/docs/realtime/realtime-provider-channel.md) for short intro and working examples.

---

### Roadmap:

Realtime Server and Realtime Publisher  - Server side implementations of the same pattern. 

## Contributing

I maintain these patterns for my own projects, but PRs and issues are welcome!
If you find a bug or want to suggest an improvement, open an issue or pull request
