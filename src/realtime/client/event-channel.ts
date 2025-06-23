import type { RealtimeEvent } from "../common/realtime-event";
/**
 * Core interface for EventChannel implementations
 */

export interface EventChannel<TEvent extends RealtimeEvent = RealtimeEvent> {
  /**
   * Connect to the event broker
   */
  connect(): Promise<void>;

  /**
   * Subscribe to events
   * @param type Event type to listen for, or "*" for all events
   * @param handler Function to call when matching events are received
   * @returns Function to call to unsubscribe
   */
  on<T extends TEvent = TEvent>(
    type: string,
    handler: (event: T) => void,
  ): () => void;

  /**
   * Publish an event
   * @param event The event to publish
   */
  publish(event: TEvent): Promise<void>;

  /**
   * Close the connection and clean up resources
   */
  close(): Promise<void>;

  /**
   * Get the unique ID of this channel instance
   */
  getId?(): string;
}
