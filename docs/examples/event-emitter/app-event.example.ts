import type { Event, EventEmitter } from "../../../src/patterns/event-emitter";

// // Define application event types
export interface AppEvent extends Event {
	type: "user.login" | "user.logout" | "error" | "notification";
	payload: any; // Use 'any' for simplicity, but you can define more specific types
}

// Create concrete implementation classes for the example
export class AuthenticationService {
	private eventBus: EventEmitter<AppEvent>;
	private loggedInUser: string | null = null;

	constructor(eventBus: EventEmitter<AppEvent>) {
		this.eventBus = eventBus;
	}

	login(username: string, password: string): boolean {
		// Simplified authentication
		if (password === "password") {
			this.loggedInUser = username;

			// Emit login event
			this.eventBus.emit({
				type: "user.login",
				payload: { username },
			});

			return true;
		}

		// Emit error event
		this.eventBus.emit({
			type: "error",
			payload: { message: "Authentication failed", username },
		});

		return false;
	}

	logout(): void {
		const username = this.loggedInUser;
		this.loggedInUser = null;

		if (username) {
			this.eventBus.emit({
				type: "user.logout",
				payload: { username },
			});
		}
	}

	getCurrentUser(): string | null {
		return this.loggedInUser;
	}
}

export class NotificationService {
	private notifications: string[] = [];

	// Update method for observer pattern
	update(event: AppEvent): void {
		switch (event.type) {
			case "user.login":
				this.addNotification(`User ${event.payload.username} logged in`);
				break;
			case "user.logout":
				this.addNotification(`User ${event.payload.username} logged out`);
				break;
			case "error":
				this.addNotification(`ERROR: ${event.payload.message}`);
				break;
		}
	}

	addNotification(message: string): void {
		this.notifications.push(message);
	}

	getNotifications(): string[] {
		return [...this.notifications];
	}
}

export class AuditLogger {
	private logs: string[] = [];

	update(event: AppEvent): void {
		const timestamp = new Date().toISOString();
		this.logs.push(
			`[${timestamp}] ${event.type}: ${JSON.stringify(event.payload)}`,
		);
	}

	getLogs(): string[] {
		return [...this.logs];
	}
}
