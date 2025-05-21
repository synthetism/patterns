import type { EventEmitter, Event } from "./event-emitter"

/**
 * Generic RealtimeService interface
 * 
 * @typeParam E - The event type this service will emit
 * @typeParam C - The connection type this service will return (e.g., RealtimeChannel)
 */
export interface RealtimeService<E extends Event = Event, C = unknown> {
  /**
   * Subscribe to real-time events for a specific entity
   */
  subscribeToEntity(entityName: string): C;
  
  /**
   * Unsubscribe from a connection
   */
  unsubscribe(connection: C): void;
  
  /**
   * Get the EventEmitter that broadcasts events
   */
  getEventEmitter(): EventEmitter<E>;
  
  /**
   * Clean up all connections
   */
  cleanup(): void;
}