import { Result } from "../../../src/patterns/result";
import { UniqueId } from "../../../src/patterns/unique-id";

/**
 * Order ID - A specialized UniqueId for Order entities.
 */
export class OrderId extends UniqueId {
	static create(id: string): Result<OrderId> {
		const baseResult = UniqueId.create(id);

		if (baseResult.isFailure) {
			return baseResult as Result<OrderId>;
		}

		return Result.success(new OrderId(id));
	}
}
