import { Result } from "../../../src/patterns/result";
import { ValueObject } from "../../../src/patterns/value-object";

/**
 * Product ID with a specific format: PRD-XXXXXX
 */
export class ProductId extends ValueObject<{ value: string }> {
	private static readonly FORMAT = /^PRD-\d{6}$/;

	private constructor(id: string) {
		super({ value: id });
	}

	static create(id: string): Result<ProductId> {
		if (!id) {
			return Result.fail("Product ID cannot be empty");
		}

		if (!ProductId.FORMAT.test(id)) {
			return Result.fail(
				"Product ID must be in format PRD-XXXXXX where X is a digit",
			);
		}

		return Result.success(new ProductId(id));
	}

	static createNew(): ProductId {
		const number = Math.floor(Math.random() * 1000000)
			.toString()
			.padStart(6, "0");
		return new ProductId(`PRD-${number}`);
	}

	toString(): string {
		return this.props.value;
	}
}
