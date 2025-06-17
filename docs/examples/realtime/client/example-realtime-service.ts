/** 
 * Universal Realtime Service implementation Example
 * Works with any RealtimeProvider and RealtimeChannel implementation
 */


import type { RealtimeService, RealtimeChannel, RealtimeProvider } from "@synet/patterns/realtime/client";
import { EventEmitter } from "@synet/patterns";
import type {
  ExampleEvent,
  ExampleEventType,
} from "../../domain/events/example-events";
import crypto from "node:crypto";

export class GatewayRealtimeService
  implements RealtimeService<ExampleEvent, RealtimeChannel>
{
  private eventEmitter: EventEmitter<ExampleEvent>;
  private activeChannels: Map<string, RealtimeChannel> = new Map();

  constructor(private gatewayClient: RealtimeProvider) {
    this.eventEmitter = new EventEmitter<ExampleEvent>();
  }

  getEventEmitter(): EventEmitter<ExampleEvent> {
    return this.eventEmitter;
  }

  /**
   * Initialize subscriptions to multiple entities at once
   */
  initializeChannels(entities: string[]): void {
    this.cleanup();

    // Set up subscriptions for each entity
    for (const entity of entities) {
      this.createChannel(entity);
    }
  }

  /**
   * Subscribe to a specific entity's events
   * @param entityName The name of the entity (used as the channel topic)
   */
  createChannel(entityName: string): RealtimeChannel {
    // Check if already subscribed
    if (this.activeChannels.has(entityName)) {
      const existingChannel = this.activeChannels.get(entityName);
      if (existingChannel) return existingChannel;
    }

    // Create the channel (connection happens in background)
    const channel = this.gatewayClient.createChannel<
      ExampleEvent,
      ExampleEvent
    >(entityName);

    // Store the channel
    this.activeChannels.set(entityName, channel as RealtimeChannel);

    // Set up event listener - this will capture events once connection is established
    channel.on("*", (event) => {
      try {
        this.eventEmitter.emit(event);
      } catch (error) {
        console.error(`Error processing event from ${entityName}:`, error);
      }
    });

    return channel as RealtimeChannel;
  }

  /**
   * Unsubscribe from a specific channel
   */

  removeChannel(channel: RealtimeChannel): void {
    // Delegate to the provider
    this.gatewayClient.removeChannel(channel).catch((error) => {
      console.error("Error removing channel:", error);
    });

    // Remove from active channels
    for (const [topic, activeChannel] of this.activeChannels.entries()) {
      if (activeChannel.id === channel.id) {
        this.activeChannels.delete(topic);
        break;
      }
    }
  }

  /**
   * Clean up all channels
   */
  cleanup(): void {
    // Close all channels
    for (const channel of this.activeChannels.values()) {
      channel.close().catch((error) => {
        console.error("Error closing channel:", error);
      });

      this.gatewayClient.removeChannel(channel).catch((error) => {
        console.error("Error removing channel:", error);
      });
    }

    this.activeChannels.clear();
    this.gatewayClient.disconnect().catch((error) => {
      console.error("Error disconnecting provider:", error);
    });
  }

  /**
   * Broadcast an event to a specific topic
   */
  async broadcast(
    topic: string,
    eventType: ExampleEventType,
    data: unknown,
  ): Promise<void> {
    // Get or create the channel
    let channel = this.activeChannels.get(topic);
    if (!channel) {
      channel = this.createChannel(topic);
    }

    // Wait for connection to be established
    // if (channel.getState() !== ChannelState.CONNECTED) {
    console.log(`Waiting for channel ${topic} to connect...`);
    await channel.connect();

    // Create and emit event
    const event: ExampleEvent = {
      id: crypto.randomUUID(),
      source: "client",
      type: eventType,
      timestamp: new Date(),
      data,
    };

    await channel.emit(event);
  }
}
