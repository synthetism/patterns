import type { EventEmitter, Event } from "../../patterns/event-emitter";

/**
 * @deprecated This service is deprecated and will be removed in a future version.
 * Please use RealtimeClient instead.
 */
export interface RealtimeService<E extends Event = Event, C = unknown> {
  /**
   * Create a channel for receiving real-time events
   * @param topic The topic to subscribe to
   * @returns A channel instance
   */
  createChannel(topic: string): C | Promise<C>;

  /**
   * Remove a channel and stop receiving events
   * @param channel The channel to remove
   */
  removeChannel(channel: C): void | Promise<void>;

  /**
   * Get the EventEmitter that broadcasts events
   * @returns The event emitter instance
   */
  getEventEmitter(): EventEmitter<E>;

  /**
   * Clean up all channels and resources
   */
  cleanup(): void | Promise<void>;

  /**
   * Initialize subscriptions to multiple topics at once
   * @param topics List of topics to subscribe to
   */
  initializeChannels(topics: string[]): void | Promise<void>;
}
