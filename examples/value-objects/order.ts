import { Result, ValueObject } from '../../src/patterns';
import { Guard } from '../../src/patterns/guard';
import { ResultExtensions } from '../../src/extensions/result-extensions';
import type { OrderId } from './orderId';

/**
 * Represents a confirmation of a completed order.
 * This is immutable and validates all inputs during creation.
 */
export class Order extends ValueObject<{
  orderId: OrderId;
  paymentId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  completedAt: Date;
}> {
  private constructor(props: {
    orderId: OrderId;
    paymentId: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    completedAt: Date;
  }) {
    super(props);
  }

  /**
   * Creates a new OrderConfirmation value object with validation.
   */
  public static create(props: {
    orderId: OrderId;
    paymentId: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    completedAt?: Date;
  }): Result<Order> {
    
    // Validate all inputs using Guard pattern
    
    const paymentIdResult = Guard.String.nonEmpty(props.paymentId, 'paymentId');
    
    // Status must be one of the allowed values (already enforced by TypeScript)
    const statusResult = Guard.defined(props.status, 'status');
    
    // Combine validations
    const guardResult = Guard.combine([ paymentIdResult, statusResult]);
    if (guardResult.isFailure) {
       return ResultExtensions.mapError<void, Order>(guardResult);
    }
    
    // Default completedAt to current time if not provided
    const completedAt = props.completedAt || new Date();
    
    return Result.success(new Order({
        orderId: props.orderId,
        paymentId: props.paymentId,
        status: props.status,
        completedAt
      }));
    
  }
  
  /**
   * Get the order ID
   */
  get orderId(): OrderId {
    return this.props.orderId;
  }
  
  /**
   * Get the payment ID
   */
  get paymentId(): string {
    return this.props.paymentId;
  }
  
  /**
   * Get the status
   */
  get status(): 'PENDING' | 'COMPLETED' | 'FAILED' {
    return this.props.status;
  }
  
  /**
   * Get the completion timestamp
   */
  get completedAt(): Date {
    return this.props.completedAt;
  }
  
  /**
   * Check if the order is completed
   */
  isCompleted(): boolean {
    return this.status === 'COMPLETED';
  }
  
  /**
   * Check if the order has failed
   */
  isFailed(): boolean {
    return this.status === 'FAILED';
  }
  
  /**
   * Check if the order is still pending
   */
  isPending(): boolean {
    return this.status === 'PENDING';
  }
  
  /**
   * Format as a human-readable confirmation message
   */
  toConfirmationMessage(): string {
    return `Order ${this.orderId} is ${this.status.toLowerCase()}. ` +
      `Payment ID: ${this.paymentId}. ` +
      `Date: ${this.completedAt.toLocaleString()}`;
  }
}