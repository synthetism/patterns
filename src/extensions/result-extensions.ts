import { Result } from "../patterns/result";

/**
 * Extensions for the Result pattern following the Open/Closed Principle.
 * These add functionality without modifying the core Result class.
 */
export const ResultExtensions = {
  /**
   * Maps error from one Result type to another, preserving error details
   *
   * @example
   * const emailResult = Email.create(input);
   * if (emailResult.isFailure) {
   *   return ResultExtensions.mapError<Email, User>(emailResult);
   * }
   */
  mapError<FromType, ToType>(result: Result<FromType>): Result<ToType> {
    if (result.isSuccess) {
      throw new Error("Cannot map error from a successful result");
    }

    return Result.fail<ToType>(
      result.errorMessage ?? "Unknown error occurred",
      result.errorCause,
    );
  },

  /**
   * Maps a successful result value to a different type
   *
   * @example
   * const userResult = User.create({ name: "John" });
   * const userDtoResult = ResultExtensions.mapSuccess(userResult, user => UserDto.fromUser(user));
   */
  mapSuccess<FromType, ToType>(
    result: Result<FromType>,
    mapper: (value: FromType) => ToType,
  ): Result<ToType> {
    if (result.isFailure) {
      return ResultExtensions.mapError(result);
    }

    try {
      const mappedValue = mapper(result.value);
      return Result.success(mappedValue);
    } catch (error) {
      return Result.fail<ToType>(
        `Error mapping result: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  /**
   * Chains multiple results together, short-circuiting on first failure
   *
   * @example
   * const finalResult = ResultExtensions.chain(
   *   () => validateInput(input),
   *   (validInput) => processInput(validInput),
   *   (processedData) => saveToDatabase(processedData)
   * );
   */
  chain<T1, T2>(result: Result<T1>, fn: (value: T1) => Result<T2>): Result<T2> {
    if (result.isFailure) {
      return ResultExtensions.mapError(result);
    }

    try {
      return fn(result.value);
    } catch (error) {
      return Result.fail<T2>(
        `Error in result chain: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};

/**
 * Additional useful Result transformations and combinations
 */
export const ResultCombinators = {
  /**
   * Returns first success result or combines all error messages
   *
   * @example
   * const result = ResultCombinators.any([
   *   primaryValidator(input),
   *   fallbackValidator(input)
   * ]);
   */
  any<T>(results: Result<T>[]): Result<T> {
    const successes = results.filter((r) => r.isSuccess);
    if (successes.length > 0) {
      return successes[0];
    }

    const errorMessage = results
      .filter((r) => r.isFailure && r.errorMessage)
      .map((r) => r.errorMessage)
      .join("; ");

    return Result.fail<T>(errorMessage || "All operations failed");
  },

  /**
   * Collects all successful results or returns first failure
   *
   * @example
   * const usersResult = ResultCombinators.all(
   *   userIds.map(id => userRepository.getById(id))
   * );
   */
  all<T>(results: Result<T>[]): Result<T[]> {
    const failures = results.filter((r) => r.isFailure);
    if (failures.length > 0) {
      return ResultExtensions.mapError(failures[0]);
    }

    const values = results.map((r) => r.value);
    return Result.success(values);
  },
};
