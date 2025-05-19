
# Order Processor example

Here we take full advantage of Value Objects coupled with UniqueId. First we create a unique `orderId` using Value Object OrderId, processing multiple checks and additional logic needed for Order creation, then create Order using Value Object, where we do additional checks that are relevant to the Order only logic, separating concerns.

```javascript

import { Result, ResultExtensions } from '@synet/patterns';
import { OrderId } from '../orderId';
import { Order } from '../order';

interface PaymentResult {
    transactionId: string;
    status: string; 
}
interface IOrderRespository {

    findById(id: OrderId): Result<OrderId>;
}

export class orderRepository implements IOrderRespository {
 
        findById = (id: OrderId): Result<OrderId> => {
            return Result.fail('id not found');
        }
};


export class OrderProcessor {
    constructor(private orderRepository: orderRepository) {}

    validateOrder(id: OrderId): Result<void> {

     return Result.success(undefined);

    }  

    processOrder(orderId: string): Result<Order> {
        
    # Create unique order id 

    const orderIdResult = OrderId.create(orderId);
    if (orderIdResult.isFailure) {
        return ResultExtensions.mapError<OrderId, Order>(orderIdResult);
    }
    
    // Get order from repository
    const orderResult =  this.orderRepository.findById(orderIdResult.value);
    if (orderResult.isFailure) {
        return ResultExtensions.mapError<OrderId, Order>(orderResult);
    }
    
    // Validate order is processable
    const validateResult = this.validateOrder(orderResult.value);
    if (validateResult.isFailure) {
        return ResultExtensions.mapError<void, Order>(validateResult);
    }
    
    // Process payment
    const paymentResult = Result.success({transactionId: '12345', status: 'COMPLETED'});
    // Simulate payment processing});
    if (paymentResult.isFailure) {
        return ResultExtensions.mapError<PaymentResult, Order>(paymentResult);
    }
    
    // Create confirmation
    return Order.create({
        orderId: orderResult.value,
        paymentId: paymentResult.value.transactionId,
        status: 'COMPLETED'
    });
}
}

/* 

export const orderProcessor = new OrderProcessor(new orderRepository());

*/
```