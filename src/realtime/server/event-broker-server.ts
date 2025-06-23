import type { RealtimeEvent } from "../common/realtime-event";

/**
 * Core interface for EventBrokerServer implementations
 */
export interface EventBrokerServer<
  TEvent extends RealtimeEvent = RealtimeEvent,
> {
  /**
   * Start the event broker
   */
  start(): Promise<void>;

  /**
   * Stop the event broker and clean up resources
   */
  stop(): Promise<void>;

  /**
   * Register an event handler
   * @param type Event type to listen for, or "*" for all events
   * @param handler Function to call when matching events are received
   * @returns Function to call to unregister the handler
   */
  on(type: string, handler: (event: TEvent) => void): () => void;

  /**
   * Get current broker statistics
   */
  getStats(): { messageCount: number; clientCount: number };
}
