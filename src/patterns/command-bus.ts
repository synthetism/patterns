/**
 * Base command interface that all commands must implement
 * see In-memory implementation of CommandBus
 * @see /docs/command-bus.md
 * @see /docs/examples/command-bus/command-bus.ts
 */
export interface Command<TResult = void> {
  type: string;
}

/**
 * Interface for a handler that processes a specific command type
 */
export interface CommandHandler<TCommand extends Command<TResult>, TResult> {
  handle(command: TCommand): Promise<TResult> | TResult;
}

/**
 * Middleware function type for processing commands
 * Takes a command and a next function to continue the middleware chain
 */
export type CommandMiddleware = <TResult>(
  command: Command<TResult>,
  next: () => Promise<TResult>,
) => Promise<TResult>;

/**
 * Core command bus interface
 */
export interface CommandBus {
  registerHandler<TCommand extends Command<TResult>, TResult>(
    commandType: string,
    handler: CommandHandler<TCommand, TResult>,
  ): void;

  registerMiddleware(middleware: CommandMiddleware): void;

  dispatch<TResult>(command: Command<TResult>): Promise<TResult>;
  
}
