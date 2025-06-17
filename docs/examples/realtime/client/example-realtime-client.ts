/** 
 * Universal Realtime Client implementation and Event Types
 * Works with any RealtimeProvider and RealtimeChannel implementation
 */


import type { 
  RealtimeClient,
  RealtimeProvider,
  RealtimeEvent,
  RealtimeChannel,
  Topic
 } from "@synet/patterns/realtime/client";

import { EventEmitter } from "@synet/patterns";

/** Specific events types that extends RealtimeEvent
 * Typesafety on Handler can't be ensured, so you can use generic RealtimeEvent here and provide specific type on handling
 */
import type {
  ExampleEvent,
  ExampleEventType,
} from "../../domain/events/example-events";

import chalk from "chalk";

export class ExampleRealtimeClient implements RealtimeClient {
  private eventEmitter: EventEmitter<RealtimeEvent>;
  private subscriptions: Map<Topic, () => void> = new Map();
  private channels: Map<Topic, RealtimeChannel> = new Map();

  constructor(private provider: RealtimeProvider) {
    this.eventEmitter = new EventEmitter<RealtimeEvent>();
  }

   /**
   * Initialize channels for multiple topics and clean up existing ones
   */
  async init(topics: Topic[]): Promise<void> {
    console.log(`Initializing channels for topics: ${topics.map(t => chalk.bold(t)).join(', ')}`);
    
    // Clean up existing channels first
    await this.disconnect();

    // Create new channels
    for (const topic of topics) {
      this.subscribe(topic);
    }

    // Connect all channels immidately
    // This can be done later on channel initialization, but here we do it immediately for simplicity
    await this.connect();

  }


  subscribe(topic: Topic): RealtimeChannel {
    // Create channel if not exists

    if (this.channels.has(topic)) {
      const existingChannel = this.channels.get(topic);
      if (existingChannel) return existingChannel;
    }

    const channel = this.provider.createChannel(topic);

    /**
     * Alternative you can pass Event Types for IDE, but that's not strictly necessary and you still need to provide type on Handler
     * const channel = this.provider.createChannel<
     *  ExampleEvent,
     *  ExampleEvent
     *  >(topic);

     */


     console.log(`Creating channel for topic: ${chalk.bold(topic)}`); // Debug log

     this.channels.set(topic, channel as RealtimeChannel);

     /**
      * You have two options to handle the events:
      * 1) Use channel.on("*", (event) => {}) to handle all events with EventEmitter
      * 2) Use channel.on<ExampleEventType>("event.type", (event) => {}) to handle specific event types outside using returned channel
      
      * Here we use the first option to handle all events and forward them to local event emitter
      */

      channel.on("*", (event: ExampleEvent) => {
          console.log(`Received event on ${chalk.bold(topic)} channel with type ${chalk.bold(event.type)}`); // Debug log
            try {
              this.eventEmitter.emit(event);
            } catch (error) {
              console.error(`Error processing event from ${topic}:`, error);
          }
      }); 

    // this.connect(); // Connect immediately if needed, or connection happens later on channel initialization

    const unsubscribe = () => {
      this.unsubscribe(topic);
    };

    this.subscriptions.set(topic, unsubscribe);
    return channel as RealtimeChannel;
 
  }

  async unsubscribe(topic: Topic): Promise<void> {
    const channel = this.channels.get(topic);
    if (channel) {
      await this.provider.removeChannel(channel);
      this.channels.delete(topic);
    }
    this.subscriptions.delete(topic);
  }

  async publish(topic: Topic, event: ExampleEvent): Promise<void> {
    let channel = this.channels.get(topic);
    
    // Create channel if needed for publishing
    if (!channel) {
      channel = this.provider.createChannel(topic) as RealtimeChannel;
      this.channels.set(topic, channel);
      await channel.connect();
    }

    await channel.emit(event);
  }

  async connect(): Promise<void> {
    // Connect all existing channels
    const connectPromises = Array.from(this.channels.values()).map(
      channel => channel.connect()
    );
    await Promise.all(connectPromises);
  }

  async disconnect(): Promise<void> {
    await this.provider.disconnect();
    this.channels.clear();
    this.subscriptions.clear();
  }

  getEventEmitter(): EventEmitter<ExampleEvent> {
    return this.eventEmitter;
  }
}