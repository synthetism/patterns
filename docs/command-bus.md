# Command Bus Pattern

## What is a Command Bus?

A command bus is a pattern that decouples command creation from command execution, providing a centralized way to dispatch commands to their respective handlers. It's particularly valuable in applications following CQRS (Command Query Responsibility Segregation) where commands represent intentions to change state.

## Why Use a Command Bus?

- **Single Responsibility**: Commands represent intentions, handlers execute them
- **Middleware Support**: Add cross-cutting concerns like validation, logging, and authorization
- **Testability**: Easily mock command handlers for testing
- **Scalability**: Can evolve to support distributed processing and message queues
- **Consistent Processing**: All commands follow the same flow, making code more predictable
- **Event Emitting:** Single place to emit events, without polluting high-level use-cases.
- **Decoupling:** Make UseCases slim and testable, glue operations though centralised command bus.

## Command Bus vs. Mediator Pattern

While both patterns decouple senders from receivers, they serve different purposes:

| Command Bus                                            | Mediator Pattern                                                            |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| Focused on processing commands (write operations)      | More general purpose for request/response flows                             |
| Often part of CQRS architecture                        | Works well for various messaging needs                                      |
| Includes middleware support for cross-cutting concerns | Typically simpler with direct handler execution                             |
| Commands represent intentions to change state          | Requests can represent any type of message                                  |
| Usually one handler per command type                   | Can have multiple handlers per message type (with extended implementations) |

**When to use which:**

- Use **Command Bus** when implementing CQRS, focusing on write operations, or when you need middleware support
- Use **Mediator** for general messaging, simpler application designs, or when requests might have multiple handlers

## API Reference

```typescript
// Command Interface
export interface Command<TResult = void> {
    type: string;
}

// Command Handler Interface
export interface CommandHandler<TCommand extends Command<TResult>, TResult> {
    handle(command: TCommand): Promise<TResult> | TResult;
}

// Middleware Function Type
export type CommandMiddleware = <TResult>(
    command: Command<TResult>,
    next: () => Promise<TResult>,
) => Promise<TResult>;

// Command Bus Interface
export interface CommandBus {
    registerHandler<TCommand extends Command<TResult>, TResult>(
        commandType: string,
        handler: CommandHandler<TCommand, TResult>,
    ): void;

    registerMiddleware(middleware: CommandMiddleware): void;

    dispatch<TCommand extends Command<TResult>, TResult>(
        command: TCommand,
    ): Promise<TResult>;
}
```

## Basic Example

```typescript
// 1. Define a command
interface CreateUserCommand extends Command<Result<string>> {
    type: 'CREATE_USER';
    username: string;
    email: string;
}

// 2. Create a handler
class CreateUserHandler implements CommandHandler<CreateUserCommand, Result<string>> {
    constructor(private userRepository: UserRepository) {}
  
    async handle(command: CreateUserCommand): Promise<Result<string>> {
        try {
            // Validate inputs
            if (!command.username || !command.email) {
                return Result.fail('Username and email are required');
            }
        
            // Create user
            const userId = await this.userRepository.createUser({
                username: command.username,
                email: command.email
            });
        
            return Result.success(userId);
        } catch (error) {
            return Result.fail(`Failed to create user: ${error.message}`);
        }
    }
}

// 3. Set up the command bus
const commandBus = new InMemoryCommandBus(logger);

// 4. Add middleware (optional)
commandBus.registerMiddleware(async (command, next) => {
    logger.debug(`Executing command: ${command.type}`);
    const startTime = performance.now();
  
    try {
        const result = await next();
        logger.debug(`Command ${command.type} completed in ${performance.now() - startTime}ms`);
        return result;
    } catch (error) {
        logger.error(`Command ${command.type} failed:`, error);
        throw error;
    }
});

// 5. Register handler
commandBus.registerHandler('CREATE_USER', new CreateUserHandler(userRepository));

// 6. Dispatch a command
const result = await commandBus.dispatch({
    type: 'CREATE_USER',
    username: 'john_doe',
    email: 'john@example.com'
});

if (result.isSuccess) {
    console.log(`User created with ID: ${result.value}`);
} else {
    console.error(`Error: ${result.errorMessage}`);
}
```

## Advanced Usage: Transaction Management

```typescript
// Transaction middleware
const transactionMiddleware: CommandMiddleware = async (command, next) => {
    // Start transaction
    const transaction = await db.beginTransaction();
  
    try {
        // Execute the command
        const result = await next();
    
        // If successful, commit
        await transaction.commit();
        return result;
    } catch (error) {
        // On error, rollback
        await transaction.rollback();
        throw error;
    }
};

// Register the middleware
commandBus.registerMiddleware(transactionMiddleware);
```

## Advanced Usage: Asynchronous Command Processing

The Command Bus pattern can be extended to support asynchronous processing:

```typescript
// Async command dispatcher
async function enqueueCommand<TResult>(command: Command<TResult>): Promise<string> {
    const commandId = uuidv4();
    await messageQueue.send({
        id: commandId,
        payload: command,
        timestamp: new Date()
    });
    return commandId;
}

// Command processing worker
async function processCommands() {
    while (true) {
        const message = await messageQueue.receive();
        if (message) {
            try {
                await commandBus.dispatch(message.payload);
                await messageQueue.acknowledge(message.id);
            } catch (error) {
                await messageQueue.fail(message.id, error.message);
            }
        }
    }
}
```

The Command Bus pattern provides a robust foundation for building scalable applications with clear separation of concerns and consistent command processing.
