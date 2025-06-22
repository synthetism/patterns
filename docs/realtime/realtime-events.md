# Reatlime Event-Driven Communication Patterns

### Introduction

Modern software systems are increasingly distributed, with components that need to communicate across process and network boundaries. Traditional request-response patterns create tight coupling between components, making systems brittle and difficult to change. Event-driven architecture addresses this challenge by allowing components to communicate without direct knowledge of each other, through the publishing and consumption of events. However, when the events and observers need to be distributed, architecture becomes complex and hard to maintain. Time and again, I see how well-working locally events become an endless source of bugs when scale asks for separation.

## The Rationale

### The Problem with Coupled Communication

In traditional realtime-event-driven architectures, components directly call each other's APIs, creating tight coupling:

1. **Dependency Chains** - Changes to one component ripple through the system
2. **Synchronous Blocking** - Components must wait for responses, reducing throughput
3. **Scale Limitations** - Adding more consumers requires replication of services
4. **Brittle Failures** - When one component fails, dependent components also fail
5. **Duplication** - Each service needs to implement transport concerns.

Doing event right is complex, but it doesn't have to be with the right patterns and abstractions.

### The Realtime Event-Driven Solution

Event-driven architecture fundamentally changes how components interact:

1. **Components emit events** when something noteworthy happens
2. **Other components subscribe** to events they're interested in
3. **A broker mediates** the flow of events
4. **Add client,** if you want both publish and consume.

This pattern creates loosely coupled systems where:

* Publishers don't know or care who's listening
* Subscribers don't know or care who's publishing
* Components can be added, removed, or modified with minimal impact
* Optional broker can be silent observer or store, process or notify about important events  and can be designed to play a more decisive role in decisions, evolving into an event manager and actor.

### EventBrokerServer

The EventBrokerServer pattern provides a minimal, focused server implementation that:

1. **Centralizes Event Routing** - Creates a single reliable channel for event distribution (required for websocket, and gun)
2. **Enables Observability** - Provides monitoring of all system events, storage and external notifications.
3. **Simplifies Integration** - Offers a consistent interface for all components
4. **Maintains Independence** - Doesn't inject business logic into communication
5. **Separation of concenrs -** Event emitters/ovservers focus on exchanging specific event types, implementic local actions, EventBroker - acts on all events.

Unlike traditional message brokers or full-scale servers, the EventBroker is designed to be lightweight and focused solely on routing or acting on events, not being part of the communication. That creates a distinctive role as an actor on events.

[Event Broker →](./event-broker-server.md)

### EventChannel

The EventChannel pattern creates a clean abstraction for client components that:

1. **Hides Transport Complexity** - Abstracts connection management and protocol details
2. **Provides Type Safety** - Offers strongly-typed events for better developer experience
3. **Unifies Patterns** - Creates consistent publish/subscribe patterns across the system
4. **Enables Testing** - Can be mocked or replaced for testing scenarios

EventChannel sits at the boundary of your domain logic and your communication infrastructure, keeping your core business logic clean and focused. Inject it in any custom or ([see synet/logger→](https://github.com/synthetism/synet-logger)), and turn your console.log into a realtime events emitter, where each action not just logged, but remembered and acted upon.

[Event Channel →](./event-channel.md)

## Benefits

These patterns enable several powerful architectural capabilities:

1. **System Extensibility** - New components can subscribe to existing events without modifying publishers
2. **Improved Resilience** - Components can function independently, tolerating partial system failures
3. **Natural Scalability** - Consumers can scale independently based on their specific needs
4. **Cross-Language Communication** - Components written in different languages can share events
5. **Evolutionary Architecture** - Systems can evolve more freely with reduced coordination overhead
6. **P2P Services Communication** - Services can connect to each other via structured events, providing bi-directional communication and information exchange.

## When to Use These Patterns

These patterns are particularly valuable when:

* Building distributed systems with many independent components
* Implementing microservice architectures
* Creating systems that need to scale different components independently
* Building applications that need to be resilient to partial failures
* Supporting asynchronous workflows and processing
* Enabling real-time features like notifications, dashboards, or monitoring

## More details

[Event Channel →](./event-channel.md)
[Event Broker →](./event-broker-server.md)

## Examples

You can find concrete implementations in 
[Github](https://github.com/synthetism/realtime)  - Up-to date implementations
[@synet/realtime](http://npmjs.com/@synet/realtime) - Up-to date implementations
[synet-logger](https://github.com/synthetism/synet-logger) - Example of use in logger
