import { Result } from "./result.js";

/**
 * Guard provides type-specific validation methods organized by data type.
 *
 * This design improves discoverability and organization of validation logic.
 *
 * @example
 * function createProduct(name: string, price: number, quantity: number) {
 *   // Validate with type-specific guards
 *   const nameResult = Guard.String.nonEmpty(name, 'name');
 *   const priceResult = Guard.Number.positive(price, 'price');
 *   const quantityResult = Guard.Number.min(quantity, 0, 'quantity');
 *
 *   const validationResult = Guard.combine([nameResult, priceResult, quantityResult]);
 *
 *   if (validationResult.isFailure) {
 *     return Result.fail(validationResult.errorMessage);
 *   }
 *
 *   // Proceed with valid data...
 * }
 */

export class Guard {
  /**
   * Common validation for any type
   */
  static defined<T>(value: T, name: string): Result<T> {
    if (value === null || value === undefined) {
      return Result.fail(`${name} cannot be null or undefined`);
    }
    return Result.success(value);
  }

  /**
   * Validates that a condition is true
   */
  static assert(condition: boolean, message: string): Result<void> {
    if (!condition) {
      return Result.fail(message);
    }
    return Result.success(undefined);
  }

  /**
   * Combines multiple validation results into a single result
   */
  static combine(results: Result<unknown>[]): Result<void> {
    const failures = results.filter((result) => result.isFailure);

    if (failures.length === 0) {
      return Result.success(undefined);
    }

    const errorMessages = failures
      .map((result) => result.errorMessage)
      .filter((message) => !!message)
      .join("; ");

    return Result.fail(errorMessages);
  }

  /**
   * String-specific validations
   */
  static String = {
    /**
     * Validates that a string is not empty
     */
    nonEmpty(value: string, name: string): Result<string> {
      const definedResult = Guard.defined(value, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (value.trim().length === 0) {
        return Result.fail(`${name} cannot be empty`);
      }

      return Result.success(value);
    },

    /**
     * Validates that a string matches a specific pattern
     */
    pattern(
      value: string,
      regex: RegExp,
      name: string,
      message?: string,
    ): Result<string> {
      const definedResult = Guard.defined(value, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (!regex.test(value)) {
        return Result.fail(message || `${name} has an invalid format`);
      }

      return Result.success(value);
    },

    /**
     * Validates that a string is a valid email
     */
    email(value: string, name: string): Result<string> {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return Guard.String.pattern(
        value,
        emailRegex,
        name,
        `${name} must be a valid email address`,
      );
    },

    /**
     * Validates that a string has a minimum length
     */
    minLength(value: string, minLength: number, name: string): Result<string> {
      const definedResult = Guard.defined(value, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (value.length < minLength) {
        return Result.fail(
          `${name} must be at least ${minLength} characters long`,
        );
      }

      return Result.success(value);
    },

    /**
     * Validates that a string doesn't exceed maximum length
     */
    maxLength(value: string, maxLength: number, name: string): Result<string> {
      const definedResult = Guard.defined(value, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (value.length > maxLength) {
        return Result.fail(`${name} must not exceed ${maxLength} characters`);
      }

      return Result.success(value);
    },

    /**
     * Validates that a string's length is within a range
     */
    length(
      value: string,
      minLength: number,
      maxLength: number,
      name: string,
    ): Result<string> {
      const minResult = Guard.String.minLength(value, minLength, name);
      if (minResult.isFailure) {
        return minResult;
      }

      return Guard.String.maxLength(value, maxLength, name);
    },

    /**
     * Validates that a string contains only letters
     */
    letters(value: string, name: string): Result<string> {
      return Guard.String.pattern(
        value,
        /^[a-zA-Z]+$/,
        name,
        `${name} must contain only letters`,
      );
    },

    /**
     * Validates that a string contains only alphanumeric characters
     */
    alphanumeric(value: string, name: string): Result<string> {
      return Guard.String.pattern(
        value,
        /^[a-zA-Z0-9]+$/,
        name,
        `${name} must contain only alphanumeric characters`,
      );
    },
  };

  /**
   * Number-specific validations
   */
  static Number = {
    /**
     * Validates that a number is positive (greater than 0)
     */
    positive(value: number, name: string): Result<number> {
      const definedResult = Guard.defined(value, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (value <= 0) {
        return Result.fail(`${name} must be positive`);
      }

      return Result.success(value);
    },

    /**
     * Validates that a number is non-negative (0 or greater)
     */
    nonNegative(value: number, name: string): Result<number> {
      const definedResult = Guard.defined(value, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (value < 0) {
        return Result.fail(`${name} cannot be negative`);
      }

      return Result.success(value);
    },

    /**
     * Validates that a number is within a range
     */
    range(
      value: number,
      min: number,
      max: number,
      name: string,
    ): Result<number> {
      const definedResult = Guard.defined(value, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (value < min || value > max) {
        return Result.fail(`${name} must be between ${min} and ${max}`);
      }

      return Result.success(value);
    },

    /**
     * Validates that a number is greater than a minimum value
     */
    min(value: number, min: number, name: string): Result<number> {
      const definedResult = Guard.defined(value, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (value < min) {
        return Result.fail(`${name} must be at least ${min}`);
      }

      return Result.success(value);
    },

    /**
     * Validates that a number is less than a maximum value
     */
    max(value: number, max: number, name: string): Result<number> {
      const definedResult = Guard.defined(value, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (value > max) {
        return Result.fail(`${name} must not exceed ${max}`);
      }

      return Result.success(value);
    },

    /**
     * Validates that a number is an integer
     */
    integer(value: number, name: string): Result<number> {
      const definedResult = Guard.defined(value, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (!Number.isInteger(value)) {
        return Result.fail(`${name} must be an integer`);
      }

      return Result.success(value);
    },
  };

  /**
   * Array-specific validations
   */
  static Array = {
    /**
     * Validates that an array is not empty
     */
    nonEmpty<T>(array: T[], name: string): Result<T[]> {
      const definedResult = Guard.defined(array, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (array.length === 0) {
        return Result.fail(`${name} cannot be empty`);
      }

      return Result.success(array);
    },

    /**
     * Validates that an array has a minimum length
     */
    minLength<T>(array: T[], minLength: number, name: string): Result<T[]> {
      const definedResult = Guard.defined(array, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (array.length < minLength) {
        return Result.fail(`${name} must contain at least ${minLength} items`);
      }

      return Result.success(array);
    },

    /**
     * Validates that an array doesn't exceed maximum length
     */
    maxLength<T>(array: T[], maxLength: number, name: string): Result<T[]> {
      const definedResult = Guard.defined(array, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (array.length > maxLength) {
        return Result.fail(
          `${name} must not contain more than ${maxLength} items`,
        );
      }

      return Result.success(array);
    },

    /**
     * Validates that an array contains a specific item
     */
    includes<T>(array: T[], item: T, name: string): Result<T[]> {
      const definedResult = Guard.defined(array, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (!array.includes(item)) {
        return Result.fail(`${name} does not contain the required item`);
      }

      return Result.success(array);
    },

    /**
     * Validates that all items in an array meet a condition
     */
    every<T>(
      array: T[],
      predicate: (item: T) => boolean,
      name: string,
      message: string,
    ): Result<T[]> {
      const definedResult = Guard.defined(array, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (!array.every(predicate)) {
        return Result.fail(message);
      }

      return Result.success(array);
    },
  };

  /**
   * Object-specific validations
   */
  static Object = {
    /**
     * Validates that an object has a specific property
     */
    hasProperty<T extends object, K extends string | number | symbol>(
      obj: T,
      property: K,
      name: string,
    ): Result<T & Record<K, unknown>> {
      const definedResult = Guard.defined(obj, name);
      if (definedResult.isFailure) {
        return definedResult as Result<T & Record<K, unknown>>;
      }

      if (!(property in obj)) {
        return Result.fail(
          `${name} does not have the required property '${String(property)}'`,
        );
      }

      // This cast is safe because we've verified the property exists
      return Result.success(obj as T & Record<K, unknown>);
    },

    /**
     * Validates that an object is not empty
     */
    nonEmpty<T extends object>(obj: T, name: string): Result<T> {
      const definedResult = Guard.defined(obj, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (Object.keys(obj).length === 0) {
        return Result.fail(`${name} cannot be empty`);
      }

      return Result.success(obj);
    },
  };

  /**
   * Date-specific validations
   */
  static Date = {
    /**
     * Validates that a date is in the past
     */
    inPast(date: Date, name: string): Result<Date> {
      const definedResult = Guard.defined(date, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      const now = new Date();
      if (date >= now) {
        return Result.fail(`${name} must be in the past`);
      }

      return Result.success(date);
    },

    /**
     * Validates that a date is in the future
     */
    inFuture(date: Date, name: string): Result<Date> {
      const definedResult = Guard.defined(date, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      const now = new Date();
      if (date <= now) {
        return Result.fail(`${name} must be in the future`);
      }

      return Result.success(date);
    },

    /**
     * Validates that a date is after a specific date
     */
    after(date: Date, threshold: Date, name: string): Result<Date> {
      const definedResult = Guard.defined(date, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (date <= threshold) {
        return Result.fail(`${name} must be after ${threshold.toISOString()}`);
      }

      return Result.success(date);
    },

    /**
     * Validates that a date is before a specific date
     */
    before(date: Date, threshold: Date, name: string): Result<Date> {
      const definedResult = Guard.defined(date, name);
      if (definedResult.isFailure) {
        return definedResult;
      }

      if (date >= threshold) {
        return Result.fail(`${name} must be before ${threshold.toISOString()}`);
      }

      return Result.success(date);
    },
  };
}
