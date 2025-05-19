# The Mediator Pattern

## What is the Mediator Pattern?

The Mediator pattern provides a central hub that coordinates communication between different components in your application. It promotes loose coupling by preventing objects from referring to each other directly, instead making them communicate through the mediator.

## When to Use the Mediator Pattern

- When you have multiple objects that need to communicate with each other
- When you want to avoid tight coupling between components
- When communication logic is complex and changes frequently
- When you want a central place to manage cross-cutting concerns

## Before: Without Mediator Pattern

Consider a typical e-commerce checkout process:

```typescript
class CheckoutService {
  constructor(
    private paymentProcessor: PaymentProcessor,
    private inventoryService: InventoryService,
    private orderService: OrderService,
    private emailService: EmailService,
    private loggingService: LoggingService
  ) {}

  async processOrder(order: Order): Promise<OrderResult> {
    // Check inventory
    const inventoryResult = await this.inventoryService.checkAvailability(order.items);
    if (!inventoryResult.available) {
      return { success: false, error: 'Items not available' };
    }

    // Process payment
    const paymentResult = await this.paymentProcessor.processPayment(order.payment);
    if (!paymentResult.success) {
      return { success: false, error: 'Payment failed' };
    }

    // Create order
    const newOrder = await this.orderService.createOrder(order);
  
    // Reserve inventory
    await this.inventoryService.reserveItems(order.items);
  
    // Send confirmation email
    await this.emailService.sendOrderConfirmation(
      order.customer.email,
      newOrder.id
    );
  
    // Log success
    this.loggingService.logInfo('Order processed successfully', {
      orderId: newOrder.id
    });

    return { success: true, orderId: newOrder.id };
  }
}
```

### Problems with this approach:

1. **Tight Coupling**: CheckoutService depends directly on many services
2. **Too Many Dependencies**: Constructor injection becomes unwieldy
3. **Change Resistance**: Adding a new step requires modifying CheckoutService
4. **Testing Complexity**: Need to mock multiple dependencies
5. **Orchestration Logic**: CheckoutService knows too much about the whole process

## After: Using the Mediator Pattern

First, let's define our requests and handlers:

```typescript
import { Mediator, IRequest, IRequestHandler } from '@synet/patterns';

// Check Inventory Request
interface CheckInventoryRequest extends IRequest<InventoryResult> {
  type: 'CHECK_INVENTORY';
  items: OrderItem[];
}

class CheckInventoryHandler implements IRequestHandler<CheckInventoryRequest, InventoryResult> {
  constructor(private inventoryService: InventoryService) {}
  
  async handle(request: CheckInventoryRequest): Promise<InventoryResult> {
    return await this.inventoryService.checkAvailability(request.items);
  }
}

// Process Payment Request
interface ProcessPaymentRequest extends IRequest<PaymentResult> {
  type: 'PROCESS_PAYMENT';
  payment: PaymentDetails;
}

class ProcessPaymentHandler implements IRequestHandler<ProcessPaymentRequest, PaymentResult> {
  constructor(private paymentProcessor: PaymentProcessor) {}
  
  async handle(request: ProcessPaymentRequest): Promise<PaymentResult> {
    return await this.paymentProcessor.processPayment(request.payment);
  }
}

// Create Order Request
interface CreateOrderRequest extends IRequest<Order> {
  type: 'CREATE_ORDER';
  order: OrderData;
}

class CreateOrderHandler implements IRequestHandler<CreateOrderRequest, Order> {
  constructor(private orderService: OrderService) {}
  
  async handle(request: CreateOrderRequest): Promise<Order> {
    return await this.orderService.createOrder(request.order);
  }
}

// Reserve Inventory Request
interface ReserveInventoryRequest extends IRequest<void> {
  type: 'RESERVE_INVENTORY';
  items: OrderItem[];
}

class ReserveInventoryHandler implements IRequestHandler<ReserveInventoryRequest, void> {
  constructor(private inventoryService: InventoryService) {}
  
  async handle(request: ReserveInventoryRequest): Promise<void> {
    await this.inventoryService.reserveItems(request.items);
  }
}

// Send Email Request
interface SendEmailRequest extends IRequest<void> {
  type: 'SEND_EMAIL';
  emailType: 'ORDER_CONFIRMATION' | 'SHIPPING_NOTIFICATION';
  recipientEmail: string;
  data: Record<string, unknown>;
}

class SendEmailHandler implements IRequestHandler<SendEmailRequest, void> {
  constructor(private emailService: EmailService) {}
  
  async handle(request: SendEmailRequest): Promise<void> {
    if (request.emailType === 'ORDER_CONFIRMATION') {
      await this.emailService.sendOrderConfirmation(
        request.recipientEmail,
        request.data.orderId as string
      );
    } else if (request.emailType === 'SHIPPING_NOTIFICATION') {
      await this.emailService.sendShippingNotification(
        request.recipientEmail,
        request.data.trackingNumber as string
      );
    }
  }
}

// Log Action Request
interface LogActionRequest extends IRequest<void> {
  type: 'LOG_ACTION';
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: Record<string, unknown>;
}

class LogActionHandler implements IRequestHandler<LogActionRequest, void> {
  constructor(private loggingService: LoggingService) {}
  
  handle(request: LogActionRequest): void {
    switch(request.level) {
      case 'info':
        this.loggingService.logInfo(request.message, request.data);
        break;
      case 'warn':
        this.loggingService.logWarning(request.message, request.data);
        break;
      case 'error':
        this.loggingService.logError(request.message, request.data);
        break;
    }
  }
}
```

Now let's refactor the CheckoutService:

```typescript
class CheckoutService {
  constructor(private mediator: Mediator) {}

  async processOrder(order: Order): Promise<OrderResult> {
    // Check inventory
    const inventoryResult = await this.mediator.send<CheckInventoryRequest, InventoryResult>({
      type: 'CHECK_INVENTORY',
      items: order.items
    });
  
    if (!inventoryResult.available) {
      return { success: false, error: 'Items not available' };
    }

    // Process payment
    const paymentResult = await this.mediator.send<ProcessPaymentRequest, PaymentResult>({
      type: 'PROCESS_PAYMENT',
      payment: order.payment
    });
  
    if (!paymentResult.success) {
      return { success: false, error: 'Payment failed' };
    }

    // Create order
    const newOrder = await this.mediator.send<CreateOrderRequest, Order>({
      type: 'CREATE_ORDER',
      order: order
    });
  
    // Reserve inventory
    await this.mediator.send<ReserveInventoryRequest, void>({
      type: 'RESERVE_INVENTORY',
      items: order.items
    });
  
    // Send confirmation email
    await this.mediator.send<SendEmailRequest, void>({
      type: 'SEND_EMAIL',
      emailType: 'ORDER_CONFIRMATION',
      recipientEmail: order.customer.email,
      data: { orderId: newOrder.id }
    });
  
    // Log success
    await this.mediator.send<LogActionRequest, void>({
      type: 'LOG_ACTION',
      level: 'info',
      message: 'Order processed successfully',
      data: { orderId: newOrder.id }
    });

    return { success: true, orderId: newOrder.id };
  }
}

// Setting up the mediator
function setupMediator(): Mediator {
  const mediator = new Mediator();
  
  // Create services
  const inventoryService = new InventoryService();
  const paymentProcessor = new PaymentProcessor();
  const orderService = new OrderService();
  const emailService = new EmailService();
  const loggingService = new LoggingService();
  
  // Register handlers
  mediator.registerHandler('CHECK_INVENTORY', new CheckInventoryHandler(inventoryService));
  mediator.registerHandler('PROCESS_PAYMENT', new ProcessPaymentHandler(paymentProcessor));
  mediator.registerHandler('CREATE_ORDER', new CreateOrderHandler(orderService));
  mediator.registerHandler('RESERVE_INVENTORY', new ReserveInventoryHandler(inventoryService));
  mediator.registerHandler('SEND_EMAIL', new SendEmailHandler(emailService));
  mediator.registerHandler('LOG_ACTION', new LogActionHandler(loggingService));
  
  return mediator;
}

// Usage
const mediator = setupMediator();
const checkoutService = new CheckoutService(mediator);
```

## Key Benefits of the Mediator Pattern

### 1. Reduced Coupling

**Before:**

```typescript
class Service {
  constructor(
    private serviceA: ServiceA,
    private serviceB: ServiceB,
    private serviceC: ServiceC,
    // More dependencies...
  ) {}
}
```

**After:**

```typescript
class Service {
  constructor(private mediator: Mediator) {}
}
```

### 2. Simplified Component Communication

**Before:**

```typescript
// Component A needs to know about Component B
componentA.doSomething();
componentB.reactToA();
```

**After:**

```typescript
// Components only know about the mediator
mediator.send({ type: 'DO_SOMETHING' });
// Appropriate handler responds automatically
```

### 3. Centralized Control

**Before:** Logic scattered across multiple components.

**After:** Communication flows through a single point, making it easier to debug, log, and monitor.

### 4. Easier Testing

**Before:**

```typescript
// Need to mock multiple dependencies
const service = new Service(
  mockServiceA,
  mockServiceB,
  mockServiceC,
  // More mocks...
);
```

**After:**

```typescript
// Just mock the mediator
const mockMediator = {
  send: vi.fn().mockResolvedValue(expectedResult)
};
const service = new Service(mockMediator);
```

### 5. Extensibility

**Before:** Adding a new step requires changing existing code.

**After:** Simply register a new handler - existing code remains unchanged.

## Common Use Cases

- **Orchestrating complex workflows** - Like our checkout example
- **Communication between UI components** - Managing interactions without direct references
- **Command processing systems** - Where each command has its own handler
- **Event propagation** - Broadcasting events to interested handlers

## Implementation Tips

1. **Keep Handlers Focused** - Each handler should do one thing well
2. **Use Meaningful Request Types** - Clear, descriptive names help with debugging
3. **Consider Request Validation** - Validate requests before processing
4. **Organize by Feature** - Group related requests/handlers together
5. **Consider Middleware** - For cross-cutting concerns like logging or validation

## How Our Mediator Implementation Works

Our Mediator pattern implementation consists of three key parts:

1. **Requests** - Objects that describe what needs to be done

   ```typescript
   interface CreateUserRequest extends IRequest<User> {
     type: 'CREATE_USER';
     email: string;
     name: string;
   }
   ```
2. **Handlers** - Process specific request types

   ```typescript
   class CreateUserHandler implements IRequestHandler<CreateUserRequest, User> {
     async handle(request: CreateUserRequest): Promise<User> {
       // Implementation
     }
   }
   ```
3. **Mediator** - Connects requests to their handlers

   ```typescript
   // Register handler
   mediator.registerHandler('CREATE_USER', new CreateUserHandler());

   // Send request
   const user = await mediator.send<CreateUserRequest, User>({
     type: 'CREATE_USER',
     email: 'user@example.com',
     name: 'John Doe'
   });
   ```

## Summary

The Mediator pattern helps you create loosely-coupled systems by centralizing communication between components. By introducing a mediator object that handles all interactions, you reduce dependencies between components, making your system more maintainable and adaptable to change.

Our implementation provides a simple yet powerful way to implement this pattern in TypeScript applications, with full type safety and support for both synchronous and asynchronous operations.
