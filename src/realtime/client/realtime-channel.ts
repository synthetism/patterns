import type { RealtimeEvent } from "../common/realtime-event.js";

export type EventSelector =
	| string
	| { source: string; type?: string }
	| { source?: string; type: string };

/**
 * Bidirectional communication channel for real-time events
 */
export interface RealtimeChannel<
	TIncoming extends RealtimeEvent = RealtimeEvent,
	TOutgoing extends RealtimeEvent = RealtimeEvent,
> {
	/**
	 * Unique identifier for this channel
	 */
	readonly id: string;

	/**
	 * Connect to the channel
	 */
	connect(): Promise<void>;

	/**
	 * Subscribe to incoming events
	 * @param selector RealtimeEvent selector (type, pattern, etc.)
	 * @param handler Function to handle incoming events
	 */
	on<T extends TIncoming = TIncoming>(
		selector: EventSelector,
		handler: (RealtimeEvent: T) => void,
	): () => void;

	/**
	 * Send an RealtimeEvent to the remote end
	 * @param RealtimeEvent RealtimeEvent to send
	 */
	emit(RealtimeEvent: TOutgoing): Promise<void>;

	/**
	 * Close the channel and release resources
	 */
	close(): Promise<void>;

	/**
	 * Get the channel state
	 */
	getState(): ChannelState;
}

/**
 * State of a realtime channel
 */
export enum ChannelState {
	CONNECTING = "connecting",
	CONNECTED = "connected",
	DISCONNECTING = "disconnecting",
	DISCONNECTED = "disconnected",
	ERROR = "error",
}

/**
 * Options for channel creation
 */
export interface ChannelOptions {
	/**
	 * Authentication token for secure channels
	 */
	authToken?: string;

	/**
	 * Reconnection options
	 */
	reconnect?: {
		enabled: boolean;
		maxAttempts?: number;
		initialDelayMs?: number;
		maxDelayMs?: number;
	};

	/**
	 * RealtimeEvent filtering options
	 */
	filters?: {
		/**
		 * Only subscribe to these RealtimeEvent types
		 */
		includeTypes?: string[];

		/**
		 * Skip these RealtimeEvent types
		 */
		excludeTypes?: string[];
	};
}
