import type { IRequest, IRequestHandler } from '../../src/patterns/mediator';
import { Mediator } from '../../src/patterns/mediator';
// 1. Define a simple command with string response
export interface GreetCommand extends IRequest<string> {
  type: 'GREET';
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
  type: 'LOG';
  message: string;
  level: 'info' | 'warn' | 'error';
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
  type: 'FETCH_USER';
  userId: string;
}

// 7. Simple user model
export interface User {
  id: string;
  name: string;
}

// 8. Async handler
export class FetchUserHandler implements IRequestHandler<FetchUserCommand, User> {
  async handle(request: FetchUserCommand): Promise<User> {
    // Simulate API call
    return Promise.resolve({
      id: request.userId,
      name: `User ${request.userId}`
    });
  }
}

/**
 * This sample demonstrates how to use the mediator pattern
 * to decouple components in your application.
 */

/* 
export function basicMediatorExample(): void {
  
   // This is example code - don't actually run this, just for documentation
     
  // 1. Create a mediator
  const mediator = new Mediator();
  
  // 2. Create a logger
  const logger = {
    info: (message: string) => console.log(`INFO: ${message}`),
    warn: (message: string) => console.log(`WARN: ${message}`),
    error: (message: string) => console.log(`ERROR: ${message}`)
  };
  
  // 3. Register handlers
  mediator.registerHandler('GREET', new GreetHandler());
  mediator.registerHandler('LOG', new LogHandler(logger));
  mediator.registerHandler('FETCH_USER', new FetchUserHandler());
  
  // 4. Send requests
  async function runExample() {
    // Synchronous command with return value
    const greeting = await mediator.send<GreetCommand, string>({
      type: 'GREET',
      name: 'John'
    });
    console.log(greeting); // "Hello, John!"
    
    // Void command (no return value)
    await mediator.send<LogCommand, void>({
      type: 'LOG',
      message: 'User logged in',
      level: 'info'
    });
    
    // Async command with Promise return value
    const user = await mediator.send<FetchUserCommand, User>({
      type: 'FETCH_USER',
      userId: '123'
    });
    console.log(user); // { id: '123', name: 'User 123' }
  }
  
  runExample();
  
}

*/