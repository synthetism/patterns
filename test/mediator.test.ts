import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { IRequest, IRequestHandler } from '../src/patterns/mediator';
import { Mediator } from '../src/patterns/mediator';

import type {
   User , FetchUserCommand, GreetCommand, LogCommand
} from '../examples/mediator/basic-mediator';


import { 
   GreetHandler,FetchUserHandler
} from '../examples/mediator/basic-mediator';

// Create a test-specific logger mock implementation
class TestLogHandler implements IRequestHandler<LogCommand, void> {
  private logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
  
  handle(request: LogCommand): void {
    this.logger[request.level](request.message);
  }
  
  // Helper method for testing
  getLoggerMock() {
    return this.logger;
  }
}

describe('Mediator Pattern', () => {
  let mediator: Mediator;
  let logHandler: TestLogHandler;
  
  beforeEach(() => {
    mediator = new Mediator();
    
    // Register handlers
    mediator.registerHandler('GREET', new GreetHandler());
    
    // Use our test-specific implementation
    logHandler = new TestLogHandler();
    mediator.registerHandler('LOG', logHandler);
    
    mediator.registerHandler('FETCH_USER', new FetchUserHandler());
  });
  
  it('should handle synchronous commands with return values', async () => {
    const result = await mediator.send<GreetCommand, string>({
      type: 'GREET',
      name: 'John'
    });
    
    expect(result).toBe('Hello, John!');
  });
  
  it('should handle void commands (no return value)', async () => {
    await mediator.send<LogCommand, void>({
      type: 'LOG',
      message: 'Test message',
      level: 'info'
    });
    
    // Verify the logger was called correctly
    expect(logHandler.getLoggerMock().info).toHaveBeenCalledWith('Test message');
  });
  
  it('should handle async commands that return promises', async () => {
    const user = await mediator.send<FetchUserCommand, User>({
      type: 'FETCH_USER',
      userId: '123'
    });
    
    expect(user).toEqual({
      id: '123',
      name: 'User 123'
    });
  });
  
  it('should throw error when no handler is registered', async () => {
    await expect(
      mediator.send({ type: 'UNKNOWN_COMMAND' })
    ).rejects.toThrow('No handler registered for request type: UNKNOWN_COMMAND');
  });
  
  it('should prevent registering duplicate handlers', () => {
    expect(() => {
      mediator.registerHandler('GREET', new GreetHandler());
    }).toThrow('Handler already registered for request type: GREET');
  });
});