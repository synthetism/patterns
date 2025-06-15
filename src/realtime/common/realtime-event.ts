import type { Event } from "@synet/patterns";

/**
 * A topic is a named channel for events
 * Examples: "users", "notifications", "system.alerts"
 */
export type Topic = string;

/**
 * Extended event interface with additional fields required for realtime communication
 */

export interface RealtimeEvent<T = unknown> extends Event {
  /**
   * Unique identifier for the event
   */
  id: string;

  /**
   * Source system that generated the event
   */
  source: string;

  /**
   * When the event occurred
   */
  timestamp: Date;

  /**
   * Event payload
   */
  data: T;

  /**
   * Additional contextual information
   */
  metadata?: Record<string, unknown>;
}
