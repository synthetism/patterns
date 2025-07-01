import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InMemoryCommandBus } from './examples/command-bus/in-memory-command-bus';
import type {
    Command,
    CommandHandler,    
    CommandMiddleware,
} from '../src/patterns/command-bus';

// Test types
interface TestCommand extends Command<string> {
    type: 'TEST_COMMAND';
    payload: string;
}

interface FailCommand extends Command<string> {
    type: 'FAIL_COMMAND';
    payload: string;
}

// Mock handlers
class TestCommandHandler implements CommandHandler<TestCommand, string> {
    handle(command: TestCommand): Promise<string> {
        return Promise.resolve(`Processed: ${command.payload}`);
    }
}

class SpyCommandHandler implements CommandHandler<TestCommand, string> {
    handleSpy = vi.fn().mockImplementation((command: TestCommand) => {
        return Promise.resolve(`Spy processed: ${command.payload}`);
    });

    handle(command: TestCommand): Promise<string> {
        return this.handleSpy(command);
    }
}

class FailCommandHandler implements CommandHandler<FailCommand, string> {
    handle(command: FailCommand): Promise<string> {
        return Promise.reject(new Error(`Failed to process: ${command.payload}`));
    }
}

describe('Command Bus', () => {
    let commandBus: InMemoryCommandBus;
    let spyHandler: SpyCommandHandler;

    beforeEach(() => {
        commandBus = new InMemoryCommandBus();
        spyHandler = new SpyCommandHandler();
    });

    describe('Basic Functionality', () => {
        it('should register and execute a command handler', async () => {
            // Arrange
            commandBus.registerHandler('TEST_COMMAND', new TestCommandHandler());


            const command : TestCommand = 
            {
                type: 'TEST_COMMAND',
                payload: 'hello',
            }
            // Act
            const result = await commandBus.dispatch<string>(command);

            // Assert
            expect(result).toBe('Processed: hello');
        });

        it('should throw an error when no handler is registered for a command type', async () => {
            // Act & Assert

            const command : TestCommand = 
            {
                type: 'TEST_COMMAND',
                payload: 'hello',
            }

            await expect(
                commandBus.dispatch<string>(command),
            ).rejects.toThrow('No handler registered for command type: TEST_COMMAND');
        });

        it('should propagate errors from command handlers', async () => {
            // Arrange
            commandBus.registerHandler('FAIL_COMMAND', new FailCommandHandler());

            const failCommand: FailCommand = {
                type: 'FAIL_COMMAND',
                payload: 'error data',
            };  

            // Act & Assert
            await expect(
                commandBus.dispatch<string>(failCommand),
            ).rejects.toThrow('Failed to process: error data');
        });

        it('should prevent registering multiple handlers for the same command type', () => {
            // Arrange
            commandBus.registerHandler('TEST_COMMAND', new TestCommandHandler());

            // Act & Assert
            expect(() =>
                commandBus.registerHandler('TEST_COMMAND', new TestCommandHandler()),
            ).toThrow('Handler already registered for command type: TEST_COMMAND');
        });

        it('should call the handler with the correct command', async () => {
            // Arrange
            commandBus.registerHandler('TEST_COMMAND', spyHandler);
            const command: TestCommand = {
                type: 'TEST_COMMAND',
                payload: 'test payload',
            };

            // Act
            await commandBus.dispatch(command);

            // Assert
            expect(spyHandler.handleSpy).toHaveBeenCalledWith(command);
        });
    });

    describe('Middleware Functionality', () => {
        it('should execute middleware in the order they are registered', async () => {
            // Arrange
            commandBus.registerHandler('TEST_COMMAND', new TestCommandHandler());
            
            const executionOrder: string[] = [];
            
            const middleware1: CommandMiddleware = async (command, next) => {
                executionOrder.push('before-1');
                const result = await next();
                executionOrder.push('after-1');
                return result;
            };
            
            const middleware2: CommandMiddleware = async (command, next) => {
                executionOrder.push('before-2');
                const result = await next();
                executionOrder.push('after-2');
                return result;
            };
            
            commandBus.registerMiddleware(middleware1);
            commandBus.registerMiddleware(middleware2);

            const middlewareCCommand: TestCommand = {
                type: 'TEST_COMMAND',
                payload: 'middleware test',
            }

            // Act
            await commandBus.dispatch<string>(middlewareCCommand);

            // Assert
            expect(executionOrder).toEqual([
                'before-1',
                'before-2',
                'after-2',
                'after-1',
            ]);
        });

        it('should allow middleware to modify the result', async () => {
            // Arrange
            commandBus.registerHandler('TEST_COMMAND', new TestCommandHandler());
            
            const modifyResultMiddleware: CommandMiddleware = async (command, next) => {
                const result = await next();
                return `Modified: ${result}`;
            };
            
            commandBus.registerMiddleware(modifyResultMiddleware);

            // Act
            const result = await commandBus.dispatch<TestCommand, string>({
                type: 'TEST_COMMAND',
                payload: 'original',
            });

            // Assert
            expect(result).toBe('Modified: Processed: original');
        });

        it('should allow middleware to short-circuit and not call the handler', async () => {
            // Arrange
            commandBus.registerHandler('TEST_COMMAND', spyHandler);
            
           const shortCircuitMiddleware: CommandMiddleware = async (command, next) => {
            // If we DON'T call next(), the handler never gets called
            return 'Short-circuited';  // ✅ Handler is bypassed
           } 
            
            commandBus.registerMiddleware(shortCircuitMiddleware);

            const command: TestCommand = {
                type: 'TEST_COMMAND',
                payload: 'should not reach handler',
            };
            // Act
            const result = await commandBus.dispatch<string>(command);

            // Assert
            expect(result).toBe('Short-circuited');
            expect(spyHandler.handleSpy).not.toHaveBeenCalled();
        });

        it('should allow middleware to catch and handle errors', async () => {
            // Arrange
            commandBus.registerHandler('FAIL_COMMAND', new FailCommandHandler());
            
            const errorHandlingMiddleware: CommandMiddleware = async (command, next) => {
                try {
                    return await next();
                } catch (error) {
                    return `Caught error: ${error.message}`;
                }
            };
            
            commandBus.registerMiddleware(errorHandlingMiddleware);

            const command: FailCommand = {
                type: 'FAIL_COMMAND',
                payload: 'failing payload',
            };
            // Act
            const result = await commandBus.dispatch<string>(command);

            // Assert
            expect(result).toBe('Caught error: Failed to process: failing payload');
        });

        it('should provide the command to middleware', async () => {
            // Arrange

            commandBus.registerHandler('TEST_COMMAND', new TestCommandHandler());
            
            const inspectCommandMiddleware: CommandMiddleware = async (command, next) => {
                expect(command).toHaveProperty('type', 'TEST_COMMAND');
                expect(command).toHaveProperty('payload', 'inspect me');
                return next();
            };
            
            const inspectSpy = vi.fn(inspectCommandMiddleware);
            commandBus.registerMiddleware(inspectSpy);

            const command: FailCommand = {
                type: 'TEST_COMMAND',
                payload: 'inspect me',
            };

            // Act
            await commandBus.dispatch<string>(command);
        

            // Assert
            expect(inspectSpy).toHaveBeenCalled();
        });
    });

    describe('Advanced Scenarios', () => {
        it('should work with async handlers that return Promises', async () => {
            // Arrange
            class AsyncHandler implements CommandHandler<TestCommand, string> {
                async handle(command: TestCommand): Promise<string> {
                    // Simulate async operation
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve(`Async result: ${command.payload}`);
                        }, 10);
                    });
                }
            }
            
            commandBus.registerHandler('TEST_COMMAND', new AsyncHandler());

            const command: TestCommand = {
                type: 'TEST_COMMAND',
                payload: 'async test',
            };
            // Act
            const result = await commandBus.dispatch<string>(command);

            // Assert
            expect(result).toBe('Async result: async test');
        });

        it('should work with synchronous handlers that return direct values', async () => {
            // Arrange
            class SyncHandler implements CommandHandler<TestCommand, string> {
                handle(command: TestCommand): string {
                    return `Sync result: ${command.payload}`;
                }
            }
            
            commandBus.registerHandler('TEST_COMMAND', new SyncHandler());

            const command: TestCommand = {
                type: 'TEST_COMMAND',
                payload: 'sync test',
            };
            // Act
            const result = await commandBus.dispatch<string>(command);

            // Assert
            expect(result).toBe('Sync result: sync test');
        });

      
    });
});