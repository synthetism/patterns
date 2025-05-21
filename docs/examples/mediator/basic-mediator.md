


# Basic Mediator

This sample demonstrates how basic-mediator can be implemented to decouple components in your application.

```typescript

import { Mediator } from "@synet/patterns"

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
```
