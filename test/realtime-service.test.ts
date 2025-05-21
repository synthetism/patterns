import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Event } from "../src/patterns/event-emitter";
import { EventEmitter } from "../src/patterns/event-emitter";

// Define test event types
interface TestEvent extends Event {
	type: string;
	entityName: string;
	eventType: string;
	data: unknown;
}

// Mock implementation of RealtimeService for testing
class MockRealtimeService {
	private eventEmitter = new EventEmitter<TestEvent>();
	private connections: string[] = [];
	private connectionCounter = 0;

	subscribeToEntity(entityName: string): string {
		const connection = `connection-${entityName}-${this.connectionCounter++}`;
		this.connections.push(connection);
		return connection;
	}

	unsubscribe(connection: string): void {
		const index = this.connections.indexOf(connection);
		if (index !== -1) {
			this.connections.splice(index, 1);
		}
	}

	getEventEmitter(): EventEmitter<TestEvent> {
		return this.eventEmitter;
	}

	cleanup(): void {
		this.connections = [];
		// Reset event emitter
		this.eventEmitter = new EventEmitter<TestEvent>();
	}

	// Helper method for tests to emit events
	simulateEvent(entity: string, action: string, data: unknown): void {
		const eventType = `${entity}.${action}`;
		const event: TestEvent = {
			type: eventType,
			entityName: entity,
			eventType: action,
			data,
		};

		this.eventEmitter.emit(event);
	}

	// Helper to get active connections for verification
	getActiveConnections(): string[] {
		return [...this.connections];
	}
}

// Test suite for RealtimeService pattern
describe("RealtimeService Pattern", () => {
	let realtimeService: MockRealtimeService;

	beforeEach(() => {
		realtimeService = new MockRealtimeService();
	});

	afterEach(() => {
		realtimeService.cleanup();
	});

	it("should create connections when subscribing to entities", () => {
		const connection1 = realtimeService.subscribeToEntity("user");
		const connection2 = realtimeService.subscribeToEntity("post");

		const connections = realtimeService.getActiveConnections();

		expect(connections).toHaveLength(2);
		expect(connections).toContain(connection1);
		expect(connections).toContain(connection2);
	});

	it("should remove connections when unsubscribing", () => {
		const connection = realtimeService.subscribeToEntity("user");

		expect(realtimeService.getActiveConnections()).toHaveLength(1);

		realtimeService.unsubscribe(connection);

		expect(realtimeService.getActiveConnections()).toHaveLength(0);
	});

	it("should clean up all connections", () => {
		realtimeService.subscribeToEntity("user");
		realtimeService.subscribeToEntity("post");
		realtimeService.subscribeToEntity("comment");

		expect(realtimeService.getActiveConnections()).toHaveLength(3);

		realtimeService.cleanup();

		expect(realtimeService.getActiveConnections()).toHaveLength(0);
	});

	it("should emit events through the EventEmitter", () => {
		const eventEmitter = realtimeService.getEventEmitter();
		const handler = { update: vi.fn() };

		eventEmitter.subscribe("user.create", handler);

		// Simulate an event
		realtimeService.simulateEvent("user", "create", { id: 1, name: "John" });

		expect(handler.update).toHaveBeenCalledTimes(1);
		expect(handler.update).toHaveBeenCalledWith({
			type: "user.create",
			entityName: "user",
			eventType: "create",
			data: { id: 1, name: "John" },
		});
	});

	it("should handle multiple subscribers for the same event", () => {
		const eventEmitter = realtimeService.getEventEmitter();
		const handler1 = { update: vi.fn() };
		const handler2 = { update: vi.fn() };

		eventEmitter.subscribe("post.update", handler1);
		eventEmitter.subscribe("post.update", handler2);

		// Simulate an event
		realtimeService.simulateEvent("post", "update", {
			id: 2,
			title: "Updated Post",
		});

		expect(handler1.update).toHaveBeenCalledTimes(1);
		expect(handler2.update).toHaveBeenCalledTimes(1);
	});

	it("should only notify relevant subscribers", () => {
		const eventEmitter = realtimeService.getEventEmitter();
		const createHandler = { update: vi.fn() };
		const updateHandler = { update: vi.fn() };
		const deleteHandler = { update: vi.fn() };

		eventEmitter.subscribe("user.create", createHandler);
		eventEmitter.subscribe("user.update", updateHandler);
		eventEmitter.subscribe("user.delete", deleteHandler);

		// Simulate a create event
		realtimeService.simulateEvent("user", "create", { id: 3, name: "Alice" });

		expect(createHandler.update).toHaveBeenCalledTimes(1);
		expect(updateHandler.update).not.toHaveBeenCalled();
		expect(deleteHandler.update).not.toHaveBeenCalled();
	});

	it("should handle observer objects properly", () => {
		const eventEmitter = realtimeService.getEventEmitter();

		const observer = { update: vi.fn() };

		eventEmitter.subscribe("comment.create", observer);

		// Simulate an event
		realtimeService.simulateEvent("comment", "create", {
			id: 4,
			text: "Nice post!",
		});

		expect(observer.update).toHaveBeenCalledTimes(1);
		expect(observer.update).toHaveBeenCalledWith({
			type: "comment.create",
			entityName: "comment",
			eventType: "create",
			data: { id: 4, text: "Nice post!" },
		});
	});

	it("should allow unsubscribing event handlers", () => {
		const eventEmitter = realtimeService.getEventEmitter();
		const handler = { update: vi.fn() };

		eventEmitter.subscribe("notification.create", handler);

		// Simulate first event
		realtimeService.simulateEvent("notification", "create", {
			id: 5,
			message: "New message",
		});
		expect(handler.update).toHaveBeenCalledTimes(1);

		// Unsubscribe
		eventEmitter.unsubscribe("notification.create", handler);

		// Simulate second event
		realtimeService.simulateEvent("notification", "create", {
			id: 6,
			message: "Another message",
		});

		// Handler should not have been called again
		expect(handler.update).toHaveBeenCalledTimes(1);
	});

	it("should maintain independent event streams for different entities", () => {
		const eventEmitter = realtimeService.getEventEmitter();
		const userHandler = { update: vi.fn() };
		const postHandler = { update: vi.fn() };

		eventEmitter.subscribe("user.update", userHandler);
		eventEmitter.subscribe("post.update", postHandler);

		// Simulate user event
		realtimeService.simulateEvent("user", "update", {
			id: 7,
			name: "Updated User",
		});

		expect(userHandler.update).toHaveBeenCalledTimes(1);
		expect(postHandler.update).not.toHaveBeenCalled();

		// Simulate post event
		realtimeService.simulateEvent("post", "update", {
			id: 8,
			title: "Updated Title",
		});

		expect(userHandler.update).toHaveBeenCalledTimes(1);
		expect(postHandler.update).toHaveBeenCalledTimes(1);
	});
});
