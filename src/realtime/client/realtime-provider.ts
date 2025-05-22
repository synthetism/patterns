import type { RealtimeChannel } from "./realtime-channel";
import type { RealtimeEvent } from "../common/realtime-event";

/**
 * Options for configuring a realtime provider
 */
export interface RealtimeProviderOptions<TTransportOptions = unknown> {
	// Common options
	authToken?: string;
	reconnect?: {
		enabled: boolean;
		maxAttempts?: number;
		initialDelayMs?: number;
		maxDelayMs?: number;
	};

	// Transport-specific options
	transportOptions?: TTransportOptions;
}

export interface RealtimeProvider {
	/**
	 * Create a channel for the specified topic
	 * @param topic The topic to create a channel for
	 * @param options Channel configuration options
	 */
	createChannel<
		TIn extends RealtimeEvent = RealtimeEvent,
		TOut extends RealtimeEvent = RealtimeEvent,
	>(
		topic: string,
		options?: RealtimeProviderOptions,
	): RealtimeChannel<TIn, TOut>;

	/***
	 * Remove a channel and stop receiving events
	 * @param channel The channel to remove
	 * @returns Promise that resolves when the channel is removed
	 */
	removeChannel(channel: RealtimeChannel): Promise<void>;

	/**
	 * Get all active channels
	 */
	getChannels(): RealtimeChannel[];

	/**
	 * Close all channels and clean up resources
	 */
	disconnect(): Promise<void>;
}
