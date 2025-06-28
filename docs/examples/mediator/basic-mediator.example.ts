/**
 * Basic Mediator Example
 * This sample demonstrates how basic-mediator can be implemented to decouple components in your application.
 */

import type { IRequest, IRequestHandler } from "../../../src/patterns/mediator";

// 1. Define a simple command with string response
export interface GreetCommand extends IRequest<string> {
	type: "GREET";
	name: string;
}

// 2. Create handler for the command
export class GreetHandler implements IRequestHandler<GreetCommand, string> {
	handle(request: GreetCommand): string {
		return `Hello, ${request.name}!`;
	}
}

// 3. Define a command with no return value (void)
export interface LogCommand extends IRequest<void> {
	type: "LOG";
	message: string;
	level: "info" | "warn" | "error";
}

// 4. Interface for logger (for example purposes)
export interface Logger {
	info(message: string): void;
	warn(message: string): void;
	error(message: string): void;
}

// 5. Handler that performs an action but returns nothing
export class LogHandler implements IRequestHandler<LogCommand, void> {
	constructor(private logger: Logger) {}

	handle(request: LogCommand): void {
		this.logger[request.level](request.message);
	}
}

// 6. Async command that returns a Promise
export interface FetchUserCommand extends IRequest<User> {
	type: "FETCH_USER";
	userId: string;
}

// 7. Simple user model
export interface User {
	id: string;
	name: string;
}

// 8. Async handler
export class FetchUserHandler
	implements IRequestHandler<FetchUserCommand, User>
{
	async handle(request: FetchUserCommand): Promise<User> {
		// Simulate API call
		return Promise.resolve({
			id: request.userId,
			name: `User ${request.userId}`,
		});
	}
}
