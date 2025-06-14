import { Result } from "../../../src/patterns/result";
import { UniqueId } from "../../../src/patterns/unique-id";
/**
 * User ID - A specialized UniqueId for User entities.
 *
 * This provides type safety when different entity types need to be distinguished.
 */
export class UserId extends UniqueId {
	static create(id: string): Result<UserId> {
		const baseResult = UniqueId.create(id);

		if (baseResult.isFailure) {
			return baseResult as Result<UserId>;
		}

		return Result.success(new UserId(id));
	}
}
