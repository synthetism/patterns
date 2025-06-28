import type { Logger } from '@synet/logger'; // Any logger implementation, but @synet/logger is stable solid.
import type { CommandMiddleware, CommandHandler, CommandBus, Command} from '@synet/patterns';

/**
 * In-memory implementation of CommandBus
 * Dispatches commands to their appropriate handlers with middleware support
 */
export class InMemoryCommandBus implements CommandBus {
    // Using a type-safe map similar to the Mediator pattern
    private handlers = new Map<string, CommandHandler<Command<unknown>, unknown>>();
    private middlewares: CommandMiddleware[] = [];

    constructor(private readonly logger?: Logger) {}

    /**
     * Register a handler for a specific command type
     */
    registerHandler<TCommand extends Command<TResult>, TResult>(
        commandType: string,
        handler: CommandHandler<TCommand, TResult>,
    ): void {
        if (this.handlers.has(commandType)) {
            throw new Error(
                `Handler already registered for command type: ${commandType}`,
            );
        }

        // Type assertion here is necessary but safe since we control both sides
        this.handlers.set(
            commandType,
            handler as CommandHandler<Command<unknown>, unknown>,
        );
    }

    /**
     * Register middleware to be executed in the order they are added
     */
    registerMiddleware(middleware: CommandMiddleware): void {
        this.middlewares.push(middleware);
    }

    /**
     * Dispatch a command through the middleware chain to its handler
     */
    async dispatch<TCommand extends Command<TResult>, TResult>(
        command: TCommand,
    ): Promise<TResult> {
        const handler = this.handlers.get(command.type);

        if (!handler) {
            throw new Error(
                `No handler registered for command type: ${command.type}`,
            );
        }

        // Execute middleware chain
        let index = 0;
        const executeNext = async (): Promise<TResult> => {
            if (index < this.middlewares.length) {
                const middleware = this.middlewares[index++];
                return middleware(command, executeNext);
            }
                // Final step: execute the handler
            this.logger?.debug(`Executing command handler for ${command.type}`);
            
            // Cast is safe because we maintain the type association when registering
            const typedHandler = handler as CommandHandler<TCommand, TResult>;
            return await Promise.resolve(typedHandler.handle(command));
           
        };

        return executeNext();
    }
}

/**
 * Built-in middleware for logging command execution
 */
export function createLoggingMiddleware(logger?: Logger): CommandMiddleware {
    return async <TResult>(
        command: Command<TResult>,
        next: () => Promise<TResult>,
    ): Promise<TResult> => {
        logger?.debug(`Executing command: ${command.type}`);
        const startTime = performance.now();
        
        try {
            const result = await next();
            const duration = Math.round(performance.now() - startTime);
            logger?.debug(`Command ${command.type} completed in ${duration}ms`);
            return result;
        } catch (error) {
            logger?.error(`Command ${command.type} failed:`, error);
            throw error;
        }
    };
}