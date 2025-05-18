import { Result } from '../../src/patterns';
import { ResultExtensions } from '../../src/extensions/result-extensions';
import { OrderId } from '../value-objects/orderId';
import { Order } from '../value-objects/order';
import { orderRepository } from '../repositories/order-repository';

interface PaymentResult {
    transactionId: string;
    status: string; 
}


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