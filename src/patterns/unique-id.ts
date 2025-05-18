import { Result } from "./result";
import { v4 as uuidv4, validate as isUuid } from "uuid";
import { ValueObject } from "./value-object";

/**
 * Represents a unique identifier.
 *
 * UniqueId encapsulates the concept of identity and provides type safety for IDs.
 * By default, it uses UUID v4, but can accept custom ID values when provided.
 *
 * @example
 * // Generate a new ID
 * const id = new UniqueId();
 *
 * // Use an existing ID
 * const existingId = UniqueId.create("550e8400-e29b-41d4-a716-446655440000");
 * if (existingId.isSuccess) {
 *   const id = existingId.value;
 *   console.log(id.toString()); // "550e8400-e29b-41d4-a716-446655440000"
 * }
 */
export class UniqueId extends ValueObject<{ value: string }> {
  /**
   * Creates a new UniqueId.
   * If no id is provided, generates a new UUID v4.
   *
   * @param id Optional existing ID value
   */
  constructor(id?: string) {
    super({ value: id || uuidv4() });
  }

  /**
   * Creates a UniqueId with validation.
   *
   * @param id The ID string to validate
   * @returns A Result containing either the UniqueId or an error
   */
  static create(id: string): Result<UniqueId> {
    if (!id) {
      return Result.fail("ID cannot be empty");
    }

    if (!isUuid(id)) {
      return Result.fail("ID must be a valid UUID");
    }

    return Result.success(new UniqueId(id));
  }

  /**
   * Returns the string representation of this ID.
   */
  toString(): string {
    return this.props.value;
  }

  /**
   * Returns the string representation when converted to JSON.
   */
  toJSON(): string {
    return this.toString();
  }

  /**
   * Creates a deep copy of this UniqueId.
   */
  clone(): UniqueId {
    return new UniqueId(this.props.value);
  }
}
