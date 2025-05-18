import { Result } from '../../../src/patterns';
import { ResultExtensions } from '../../../src/extensions/result-extensions';
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
    // Validate order ID
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

export const orderProcessor = new OrderProcessor(new orderRepository());