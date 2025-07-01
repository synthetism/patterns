import type { CommandMiddleware, CommandHandler, CommandBus, Command} from '@synet/patterns';

/**
 * In-memory implementation of CommandBus
 * Dispatches commands to their appropriate handlers with middleware support
 */
export class InMemoryCommandBus implements CommandBus {
    // Using a type-safe map similar to the Mediator pattern
    private handlers = new Map<string, CommandHandler<Command<unknown>, unknown>>();
    private middlewares: CommandMiddleware[] = [];



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
    async dispatch<TResult>(
        command: Command<TResult>,
    ): Promise<TResult> {
        const handler = this.handlers.get(command.type);

        if (!handler) {
            throw new Error(
                `No handler registered for command type: ${command.type}`,
            );
        }

        // Execute middleware chain
       // Build the middleware chain
        const executeHandler = () => handler.handle(command);
        
        // Apply middlewares in reverse order (last registered runs first in the chain)
        const middlewareChain = this.middlewares.reduceRight(
        (next, middleware) => () => middleware(command, next),
        executeHandler
        );

        return middlewareChain();
    }
}

/**
 * Built-in middleware for logging command execution
 */
export function createLoggingMiddleware(): CommandMiddleware {
    return async <TResult>(
        command: Command<TResult>,
        next: () => Promise<TResult>,
    ): Promise<TResult> => {
        console.debug(`Executing command: ${command.type}`);
        const startTime = performance.now();
        
        try {
            const result = await next();
            const duration = Math.round(performance.now() - startTime);
            console.debug(`Command ${command.type} completed in ${duration}ms`);
            return result;
        } catch (error) {
            console.error(`Command ${command.type} failed:`, error);
            throw error;
        }
    };
}