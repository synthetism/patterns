

import { OrderId } from '../value-objects/orderId';
import { Result } from '../../src/patterns';

export interface IOrderRespository {

    findById(id: OrderId): Result<OrderId>;
}

export class orderRepository implements IOrderRespository {
 
        findById = (id: OrderId): Result<OrderId> => {
            return Result.fail('id not found');
        }
};
