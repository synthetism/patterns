import type { EventEmitter } from "../../patterns/event-emitter";
import type { RealtimeEvent, Topic } from "../common/realtime-event";
import type { RealtimeChannel } from "./realtime-channel";
/**
 * CLIENT-SIDE: Subscribe to and emit events to remote topics
 */
export interface RealtimeClient {
  /**
   * Subscribe to events from a topic
   * @param topic Topic name (e.g., "users", "notifications")
   * @param handler Function to handle incoming events
   * @returns Unsubscribe function
   */
  subscribe(topic: Topic): RealtimeChannel;

  /**
   * Unsubscribe from a topic
   * @param topic Topic to unsubscribe from
   */
  unsubscribe(topic: Topic): Promise<void>;

  /**
   * Send an event to a topic (for bidirectional communication)
   * @param topic Target topic
   * @param event Event to send
   */
  publish(topic: Topic, event: RealtimeEvent): Promise<void>;

  /**
   * Connect to the realtime server
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the realtime server
   */
  disconnect(): Promise<void>;

  /**
   * Get local event emitter for subscribed events
   */
  getEventEmitter(): EventEmitter<RealtimeEvent>;
}
