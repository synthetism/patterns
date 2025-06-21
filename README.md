# @synet/patterns

```bash

███████╗██╗   ██╗███╗   ██╗███████╗████████╗                  
██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝╚══██╔══╝                  
███████╗ ╚████╔╝ ██╔██╗ ██║█████╗     ██║                     
╚════██║  ╚██╔╝  ██║╚██╗██║██╔══╝     ██║                     
███████║   ██║   ██║ ╚████║███████╗   ██║                     
╚══════╝   ╚═╝   ╚═╝  ╚═══╝╚══════╝   ╚═╝                     
                                                              
    ██████╗  █████╗ ████████╗████████╗███████╗██████╗ ███╗   ██╗███████╗
    ██╔══██╗██╔══██╗╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗████╗  ██║██╔════╝
    ██████╔╝███████║   ██║      ██║   █████╗  ██████╔╝██╔██╗ ██║███████╗
    ██╔═══╝ ██╔══██║   ██║      ██║   ██╔══╝  ██╔══██╗██║╚██╗██║╚════██║
    ██║     ██║  ██║   ██║      ██║   ███████╗██║  ██║██║ ╚████║███████║
    ╚═╝     ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝
                                                              
version: v.2.1.3   
description: There's patterns in everything and everyone.
```

# Patterns

Welcome! 👋

I’m 0en, and this is my set of software patterns. Battle-tested, refined, and unified across hundreds of my past projects and Synet Network protocol.

> Music is just a series of altered patterns.
> The musician creates the pattern and makes us anticipate a resolution...
> then holds back.
> Makes you wait for it.
> There's patterns in everything and everyone.

## Installation

```bash
npm install @synet/patterns
```

**Why?**

We all use patterns. I used them everywhere: in products, libraries, and experiments. But over time, I realized that patterns, when reused and evolved in isolation, become incompatible. This leads to inconsistencies, cognitive load, and subtle(and heisen)bugs. I found myself importing the same pattern from different libraries, each with its own quirks, instead of using a single, consistent, and well-tested interface.

- Predictable code from peers and AI
- Ultimate reusability
- Less boilerplate
- Less naming decisions
- Less cognitive load
- No type battles
- Reusable tests

**So I built Patterns.**

Over over 20 years in big-tech and enterprise work, I've collected and successfully used many patterns. This library unites all my best patterns and libraries under one set of stable, maintained, and carefully crafted patterns. I use these patterns myself, included in production and I maintain them with great care. Library keep updating, so make sure to pop-in for more fresh stuff.

**Use them if you want to live**

They’re highly stable, consistent, and designed to make your codebase better. Typesafety will save you couple of hundreds years (or kill you).

**Better AI Workflow**

Especially useful, when exposed to AI code assistant. It quickly learns the patterns and offer you working consistent solutions out of the box, as well as for all in your team. No more pattern hell.

---

## Base Patterns

Each pattern has its own documentation and examples in [Docs](https://github.com/synthetism/patterns/blob/main/docs/)

- **Result** Represent the outcome of operations that might fail, with a simple, type-safe API [read](https://github.com/synthetism/patterns/blob/main/docs/result.md)
- **Value Object** Immutable objects defined by their property values, not identity [read](https://github.com/synthetism/patterns/blob/main/docs/value-object.md)
- **Mapper** Transform between domain and infrastructure models, keeping your domain logic clean [read](https://github.com/synthetism/patterns/blob/main/docs/mapper.md)
- **Guard** Type-safe validation helpers for strings, numbers, arrays, objects, and dates [read](https://github.com/synthetism/patterns/blob/main/docs/guard.md)
- **UniqueId** Type-safe, immutable unique identifiers (UUID v4 by default) [read](https://github.com/synthetism/patterns/blob/main/docs/unique-id.md)
- **Mediator** Decouple request/response logic with a central dispatcher [read](https://github.com/synthetism/patterns/blob/main/docs/mediator.md)
- **Specification** Encapsulate and compose business rules and queries [TBD]
- **Observer & EventEmitter** Event-driven architecture, decoupling components with observer/subject and event emitter patterns  [Observer](https://github.com/synthetism/patterns/blob/main/docs/observer.md) | [EventEmitter](https://github.com/synthetism/patterns/blob/main/docs/event-emitter.md)
- **Command Bus** - Advanced version of Mediator made for commands. Powered by intuitive middlewares, logging and integrated EventEmitter. It's a gift. [read](https://github.com/synthetism/patterns/blob/main/docs/command-bus.md)
- **API Response** - Standardized structure for REST API responses with consistent error handling and typed data payloads [read](https://github.com/synthetism/patterns/blob/main/docs/api-response.md)
- **Storage** - Abstract data persistence layer with synchronous and asynchronous variants for seamless storage implementation swapping [read](https://github.com/synthetism/patterns/blob/main/docs/storage/storage.md)
- **Indexer** - Fast bi-directional mapping system for lookups by multiple identifiers and efficient content indexing  [read](https://github.com/synthetism/patterns/blob/main/docs/storage/indexer.md)

## Realtime Communication Patterns

Unified abstractions for realtime communication (Supabase, WebSocket, NATS, GUN etc). [read](https://github.com/synthetism/patterns/blob/main/docs/realtime/realtime.md). You can plug in any transport in minutes, create adapters and switch between transports without changing events structure.

#### Client Side

- **Realtime Client** (https://github.com/synthetism/patterns/blob/main/docs/realtime/realtime-client.md) - Connect any provider, custom (websocket,nats gun) or databases like Supabase/Neon. [read](https://github.com/synthetism/patterns/blob/main/docs/realtime/realtime-client.md)  


- **Realtime Provider &amp; Channel** - Consumer patterns for implementing provider and channel for client consumption with examples, similar to what Supabase has done in supabase-js to enable Realtime events. [read](https://github.com/synthetism/patterns/blob/main/docs/realtime/realtime-provider-channel.md)

- **EventChannel** - A client-side abstraction for publishing and subscribing to events in a distributed system. [read](https://github.com/synthetism/patterns/blob/main/docs/realtime/realtime-events.md)

You can find Nats and Websocket, and Gun provider,channel and client  implementations are in the [examples](https://github.com/synthetism/patterns/blob/main/docs/examples/realtime/client)

#### Server Side

- **Realtime Server**  is the implemenation of server-side events broadcasting, sharing RealtimeEvent type and methodology. [read](https://github.com/synthetism/patterns/blob/main/docs/realtime/realtime-server.md)

- **EventBroker** - A lightweight event broker server that monitors and facilitates pub/sub messaging between distributed components  [read](https://github.com/synthetism/patterns/blob/main/docs/realtime/realtime-events.md) 

You can find NATS, Websocket and GUN server example implementations in the [examples](https://github.com/synthetism/patterns/blob/main/docs/examples/realtime/server) or [implementations](https://github.com/synthetism/realtime)


### Implementations

You can find ready-to-use server/client implementations library [Github](https://github.com/synthetism/realtime)
and [npm package](http://npmjs.com/@synet/realtime)

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

## Synthetic Mind Dream

### :: PART1: WELCOME

There’s a sound in the air.
But you’re not sure if it’s a siren — or a song.

Something’s coming. You feel it.
Faster than you can process.
Tools on tools.
Agents that do your job, your art, your words — better than you?
You wake up and five more frameworks exist.
You scroll, and the news is either salvation or collapse.
You don’t even finish reading anymore.
It’s too much. Too fast. Too **fragmented**.

You try to keep up.
But the world’s already five steps ahead.
Your job? Your role? Your sense of self?
It’s not just unclear — it’s been **outsourced**.

We were promised _superpowers_.
But what we got was **anxiety**.
An explosion of possibility so large, it turned to paralysis.

We live inside a contradiction.

One part of you wants to believe — in progress, in AI, in the dream.
Another part clenches — feels the unease deep in your chest.
You see the demos, the language models, the smiling CEOs.
And you wonder:
Who is this all **for**?

A new doom is forming.
Call it techno-feudalism. Call it class war.
Call it the oldest story in the world — but rewritten by machines.

It’s no longer about data. It’s about **everything**.
Control. Value. Meaning. Future.
Democracy feels brittle.
Labour? Automated.
Truth? Prompted.

Everyone you know is pretending to be fine.
But they’re scrolling in panic.
Some build startups.
Some build coping mechanisms.

You?

You landed here.

And maybe —
you don’t want another pitch.
Maybe you don’t want a “solution.”
Maybe you just want to feel like someone else sees it.

We do.

You’re not crazy.
You’re not behind.
You’re not late.
You're perfect. Complete. Genius.
a god in exile.

And you know what...
You’re right on time.

And the dream?

It’s already begun.
Empty your mind.
Open the door.

[read](https://synthetism.ai/lib/synthetic-mind-dream)

$ whoami
0en
