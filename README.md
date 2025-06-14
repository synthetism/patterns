# @synet/patterns

# Patterns

Welcome! 👋

I’m 0en, and this is my collection of software patterns. Battle-tested, refined, and unified across hundreds of my projects and Synet network protocol.

> Music is just a series of altered patterns.
> The musician creates the pattern and makes us anticipate a resolution...
> then holds back.
> Makes you wait for it.
> There's patterns in everything and everyone.

**Why?**

We all use patterns. I used them everywhere: in products, libraries, and experiments. But over time, I realized that patterns, when reused and evolved in isolation, become incompatible. This leads to inconsistencies, cognitive load, and subtle(and heisen)bugs. I found myself importing the same pattern from different libraries, each with its own quirks, instead of using a single, consistent, and well-tested interface.

**So I built Patterns.**

This library unites all my products and libraries under one set of stable, maintained, and carefully crafted patterns.
I use these patterns myself, and I maintain them with care.
**Use them!** They’re highly stable, consistent, and designed to make your codebase better.

---

## Base Patterns

Each pattern has its own documentation and examples in [Docs](https://github.com/anton-ecom/patterns/blob/main/docs/)

- **Result** Represent the outcome of operations that might fail, with a simple, type-safe API [Read more](https://github.com/anton-ecom/patterns/blob/main/docs/result.md)
- **Value Object** Immutable objects defined by their property values, not identity [Read more](https://github.com/anton-ecom/patterns/blob/main/docs/value-object.md)
- **Mapper** Transform between domain and infrastructure models, keeping your domain logic clean [Read more](https://github.com/anton-ecom/patterns/blob/main/docs/mapper.md)
- **Guard** Type-safe validation helpers for strings, numbers, arrays, objects, and dates [Read more](https://github.com/anton-ecom/patterns/blob/main/docs/guard.md)
- **UniqueId** Type-safe, immutable unique identifiers (UUID v4 by default) [Read more](https://github.com/anton-ecom/patterns/blob/main/docs/unique-id.md)
- **Mediator** Decouple request/response logic with a central dispatcher [Read more](https://github.com/anton-ecom/patterns/blob/main/docs/mediator.md)
- **Specification** Encapsulate and compose business rules and queries [TBD]
- **Observer & EventEmitter** Event-driven architecture, decoupling components with observer/subject and event emitter patterns  [Read more](https://github.com/anton-ecom/patterns/blob/main/docs/observer.md) | [EventEmitter](https://github.com/anton-ecom/patterns/blob/main/docs/event-emitter.md)
- **Command Bus** - Advanced version of Mediator made for commands. Powered by intuitive middlewares, logging and integrated EventEmitter. It's a gift. [Read more](https://github.com/anton-ecom/patterns/blob/main/docs/command-bus.md)

## Realtime Patterns

Unified abstractions for realtime communication (Supabase, WebSocket, GUN, etc). [read more](https://github.com/anton-ecom/patterns/blob/main/docs/realtime/realtime.md)

#### Client Side

[Realtime Service](https://github.com/anton-ecom/patterns/blob/main/docs/realtime/realtime-service.md) - Consumer pattern [Realtime Provider &amp; Channel](https://github.com/anton-ecom/patterns/blob/main/docs/realtime/realtime-provider-channel.md) - Patterns for implementing provider and channel for client consumption with examples.

---


## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run coverage

# Build the package
npm run build
```

## Contributing

I maintain these patterns for my own projects, but PRs and issues are welcome!
If you find a bug or want to suggest an improvement or new pattenr, open an issue or pull request.
