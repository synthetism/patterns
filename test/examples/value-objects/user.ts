import { Result } from "../../../src/patterns/result";
import { ValueObject } from "../../../src/patterns/value-object";
import { ResultExtensions } from "../../../src/extensions/result-extensions";
import { Email } from "./email";
import { UserId } from "./userId";
export class User {
	private constructor(
		public readonly id: UserId,
		public readonly email: Email,
		public readonly name: string,
	) {}

	static create(props: {
		id?: string;
		email: string;
		name: string;
	}): Result<User> {
		// Email validation...

		// ID handling
		let userId: UserId;

		const emailOrError = Email.create(props.email);
		if (emailOrError.isFailure) {
			return ResultExtensions.mapError<Email, User>(emailOrError);

			/**
			 *  Alternatively, you can use direct approach
			 *
			 *  return Result.fail<User>(
			 *    emailOrError.errorMessage || 'Failed to create email'
			 *  );
			 */
		}

		const email = emailOrError.value;

		if (props.id) {
			const idOrError = UserId.create(props.id);
			if (idOrError.isFailure) {
				return ResultExtensions.mapError<UserId, User>(idOrError);

				/**
				 *  Alternatively, you can use direct approach
				 *
				 * return Result.fail<User>(
				 *  idOrError.errorMessage || 'Failed to create user ID'
				 *  );
				 */
			}
			userId = idOrError.value;
		} else {
			userId = new UserId(); // Auto-generate ID
		}

		return Result.success(new User(userId, email, props.name));
	}
}
