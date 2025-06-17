import type { RealtimeEvent, Topic } from "../common/realtime-event";

// Keep the specific event data types for documentation
export interface ClientConnectedEventData {
  clientId: string;
  topic: Topic;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ClientDisconnectedEventData {
  clientId: string;
  topics: Topic[];
  timestamp: Date;
}

export interface MessageReceivedEventData {
  clientId: string;
  message: Record<string, unknown>;
  timestamp: Date;
}

// Simplified server events with a cleaner approach
export type ServerEventType =
  | "client.connected"
  | "client.disconnected"
  | "message.received";

/**
 * Server statistics
 */
export interface RealtimeServerStats {
  connectedClients: number;
  totalTopics: number;
  messagesSent: number;
  messagesReceived: number;
  uptime: number; // milliseconds
  averageLatency?: number; // milliseconds
}

/**
 * Configuration options for RealtimeServer
 */
export interface RealtimeServerOptions<TTransportOptions = unknown> {
  /**
   * Authentication configuration
   */
  auth?: {
    enabled: boolean;
    validateToken?: (token: string) => Promise<boolean>;
    extractClaims?: (token: string) => Promise<Record<string, unknown>>;
  };

  /**
   * Client connection limits
   */
  limits?: {
    maxConnections?: number;
    maxTopicsPerClient?: number;
    messageRateLimit?: number; // messages per second
  };

  /**
   * Transport-specific options
   */
  transportOptions?: TTransportOptions;
}
/**
 * SERVER-SIDE: Broadcast events to connected clients
 */
export interface RealtimeServer {
  /**
   * Start the server
   */
  start(): Promise<void>;

  /**
   * Stop the server
   */
  stop(): Promise<void>;

  /**
   * Broadcast an event to all subscribers of a topic
   * @param topic Target topic
   * @param event Event to broadcast
   */
  broadcast(topic: Topic, event: RealtimeEvent): Promise<void>;

  /**
   * Send event to specific client (optional feature)
   * @param clientId Target client ID
   * @param event Event to send
   */
  sendToClient?(clientId: string, event: RealtimeEvent): Promise<void>;

  /**
   * Get server stats
   */
  getStats(): RealtimeServerStats;

  /**
   * Register event listeners for server events
   */
  on<T extends ServerEventType>(
    event: T,
    handler: (data: unknown) => void,
  ): void;
}
