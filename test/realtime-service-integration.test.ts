import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Event } from "../src/patterns/event-emitter";
import { EventEmitter } from "../src/patterns/event-emitter";

// Define DB event types
interface DbEvent extends Event {
	type: string;
	entityName: string;
	eventType: "insert" | "update" | "delete";
	data: any;
	old?: any;
}

// Mock RealtimeChannel to simulate Supabase
class MockRealtimeChannel {
	private eventHandlers: Record<string, ((payload: any) => void)[]> = {};

	on(event: string, filter: any, handler: (payload: any) => void) {
		if (!this.eventHandlers[event]) {
			this.eventHandlers[event] = [];
		}
		this.eventHandlers[event].push(handler);
		return this;
	}

	subscribe() {
		return this;
	}

	// Test helper to simulate Postgres events
	simulatePostgresEvent(
		eventType: "INSERT" | "UPDATE" | "DELETE",
		payload: any,
	) {
		const handlers = this.eventHandlers["postgres_changes"] || [];
		for (const handler of handlers) {
			handler({ eventType, ...payload });
		}
	}
}

// Mock Supabase client
class MockSupabaseClient {
	private channels: MockRealtimeChannel[] = [];

	channel(name: string) {
		const channel = new MockRealtimeChannel();
		this.channels.push(channel);
		return channel;
	}

	removeChannel(channel: MockRealtimeChannel) {
		const index = this.channels.indexOf(channel);
		if (index !== -1) {
			this.channels.splice(index, 1);
		}
	}

	// For testing
	getChannels() {
		return [...this.channels];
	}
}

// Implementation of RealtimeService for Supabase
class SupabaseRealtimeService {
	private eventEmitter = new EventEmitter<DbEvent>();
	private channels: MockRealtimeChannel[] = [];

	constructor(private supabase: MockSupabaseClient) {}

	subscribeToEntity(entityName: string): MockRealtimeChannel {
		const channel = this.supabase
			.channel(`${entityName}-changes`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: entityName,
				},
				(payload) => {
					try {
						if (payload.eventType === "INSERT") {
							const event: DbEvent = {
								type: `${entityName}.insert`,
								entityName,
								eventType: "insert",
								data: payload.new,
							};
							this.eventEmitter.emit(event);
						} else if (payload.eventType === "UPDATE") {
							const event: DbEvent = {
								type: `${entityName}.update`,
								entityName,
								eventType: "update",
								data: payload.new,
								old: payload.old,
							};
							this.eventEmitter.emit(event);
						} else if (payload.eventType === "DELETE") {
							const event: DbEvent = {
								type: `${entityName}.delete`,
								entityName,
								eventType: "delete",
								data: payload.old,
							};
							this.eventEmitter.emit(event);
						}
					} catch (error) {
						console.error("Error handling realtime event:", error);
					}
				},
			)
			.subscribe();

		this.channels.push(channel);
		return channel;
	}

	unsubscribe(channel: MockRealtimeChannel): void {
		this.supabase.removeChannel(channel);
		this.channels = this.channels.filter((c) => c !== channel);
	}

	getEventEmitter(): EventEmitter<DbEvent> {
		return this.eventEmitter;
	}

	cleanup(): void {
		for (const channel of this.channels) {
			this.supabase.removeChannel(channel);
		}
		this.channels = [];
	}
}

// Example observer object for our event handler
class CacheObserver {
	private cache: Map<string, any> = new Map();

	update(event: DbEvent): void {
		if (event.entityName === "user") {
			if (event.eventType === "insert" || event.eventType === "update") {
				this.cache.set(`user:${event.data.id}`, event.data);
			} else if (event.eventType === "delete") {
				this.cache.delete(`user:${event.data.id}`);
			}
		}
	}

	getCache(): Map<string, any> {
		return this.cache;
	}
}

// Example of a service using RealtimeService
class CacheService {
	private channels: MockRealtimeChannel[] = [];
	private cacheObserver = new CacheObserver();

	constructor(private realtimeService: SupabaseRealtimeService) {}

	initialize(): void {
		const channel = this.realtimeService.subscribeToEntity("user");
		this.channels.push(channel);

		const emitter = this.realtimeService.getEventEmitter();

		emitter.subscribe("user.insert", this.cacheObserver);
		emitter.subscribe("user.update", this.cacheObserver);
		emitter.subscribe("user.delete", this.cacheObserver);
	}

	getCache(): Map<string, any> {
		return this.cacheObserver.getCache();
	}

	cleanup(): void {
		for (const channel of this.channels) {
			this.realtimeService.unsubscribe(channel);
		}
		this.channels = [];
	}
}

describe("Supabase RealtimeService Integration", () => {
	let supabase: MockSupabaseClient;
	let realtimeService: SupabaseRealtimeService;
	let cacheService: CacheService;

	beforeEach(() => {
		supabase = new MockSupabaseClient();
		realtimeService = new SupabaseRealtimeService(supabase);
		cacheService = new CacheService(realtimeService);
		cacheService.initialize();
	});

	afterEach(() => {
		cacheService.cleanup();
		realtimeService.cleanup();
	});

	it("should create a Supabase channel when subscribing to entities", () => {
		expect(supabase.getChannels().length).toBe(1);
	});

	it("should update cache when insert events occur", () => {
		// Get the channel to simulate events
		const channel = supabase.getChannels()[0];

		// Simulate insert event
		channel.simulatePostgresEvent("INSERT", {
			new: { id: 1, name: "John", email: "john@example.com" },
		});

		// Check cache was updated
		const cache = cacheService.getCache();
		expect(cache.has("user:1")).toBe(true);
		expect(cache.get("user:1")).toEqual({
			id: 1,
			name: "John",
			email: "john@example.com",
		});
	});

	it("should update cache when update events occur", () => {
		const channel = supabase.getChannels()[0];

		// Simulate update event
		channel.simulatePostgresEvent("UPDATE", {
			old: { id: 1, name: "John", email: "john@example.com" },
			new: { id: 1, name: "John Updated", email: "john@example.com" },
		});

		// Check cache was updated
		const cache = cacheService.getCache();
		expect(cache.has("user:1")).toBe(true);
		expect(cache.get("user:1")).toEqual({
			id: 1,
			name: "John Updated",
			email: "john@example.com",
		});
	});

	it("should remove from cache when delete events occur", () => {
		const channel = supabase.getChannels()[0];

		// First add something to the cache
		channel.simulatePostgresEvent("INSERT", {
			new: { id: 1, name: "John", email: "john@example.com" },
		});

		// Verify it's in the cache
		expect(cacheService.getCache().has("user:1")).toBe(true);

		// Simulate delete event
		channel.simulatePostgresEvent("DELETE", {
			old: { id: 1, name: "John", email: "john@example.com" },
		});

		// Check cache was updated
		expect(cacheService.getCache().has("user:1")).toBe(false);
	});

	it("should handle multiple events for multiple entities", () => {
		// Subscribe to another entity
		const postChannel = realtimeService.subscribeToEntity("post");

		// Set up handlers
		const emitter = realtimeService.getEventEmitter();
		const postObserver = { update: vi.fn() };
		emitter.subscribe("post.insert", postObserver);

		// Get the user channel
		const userChannel = supabase.getChannels()[0];

		// Simulate events for both entities
		userChannel.simulatePostgresEvent("INSERT", {
			new: { id: 1, name: "User 1" },
		});

		postChannel.simulatePostgresEvent("INSERT", {
			new: { id: 1, title: "Post 1" },
		});

		// Check user cache was updated
		expect(cacheService.getCache().has("user:1")).toBe(true);

		// Check post handler was called
		expect(postObserver.update).toHaveBeenCalledTimes(1);
		expect(postObserver.update).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "post.insert",
				entityName: "post",
				eventType: "insert",
				data: { id: 1, title: "Post 1" },
			}),
		);

		// Clean up
		realtimeService.unsubscribe(postChannel);
	});

	it("should remove channels when unsubscribing", () => {
		const channel = supabase.getChannels()[0];
		realtimeService.unsubscribe(channel);

		expect(supabase.getChannels().length).toBe(0);
	});

	it("should clean up all channels", () => {
		realtimeService.subscribeToEntity("post");
		realtimeService.subscribeToEntity("comment");

		expect(supabase.getChannels().length).toBe(3); // user + post + comment

		realtimeService.cleanup();

		expect(supabase.getChannels().length).toBe(0);
	});
});
