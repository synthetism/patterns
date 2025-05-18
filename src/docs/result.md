# Result Pattern

The Result pattern is a powerful error handling approach that represents the outcome of an operation as either a success (with a value) or failure (with error details). This pattern is an alternative to using exceptions for control flow, making error handling more explicit and predictable.

## Why Use the Result Pattern?

Traditional error handling often relies on throwing and catching exceptions, which can lead to:

- Implicitly bypassing error checks (forgetting `try/catch`)
- No indication in function signatures that they might fail
- Hard-to-trace error stacks
- Unclear code paths when exceptions are thrown

The Result pattern addresses these issues by:

- Making success/failure explicit in function signatures
- Enforcing error handling at compile time (through TypeScript)
- Enabling elegant method chaining for error handling
- Providing rich context about failures
- Separating "happy path" and error handling code

## Basic Usage

### Creating Results

```typescript
import { Result } from '@synet/patterns';

// Creating a success result
const success = Result.success(42);

// Creating a failure result with just a message
const simpleFailure = Result.fail("Something went wrong");

// Creating a failure with a cause
const failureWithCause = Result.fail(
  "Failed to fetch data", 
  new Error("Network timeout")
);

// Creating a failure with additional debug data
const failureWithData = Result.fail(
  "Invalid input", 
  new ValidationError("Format error"),
  { field: "email", value: "invalid@", expected: "valid email" }
);
```

**Checking Result State**

```typescript
const result = someOperation();

if (result.isSuccess) {
  // Handle success case
  const value = result.value;
  console.log(`Operation succeeded with value: ${value}`);
} else {
  // Handle failure case
  console.error(`Operation failed: ${result.errorMessage}`);
  
  if (result.errorCause) {
    console.error(`Caused by: ${result.errorCause.message}`);
  }
}
```

**Method Chaining**

One of the most powerful features of the Result pattern is the ability to chain operations:

```typescript
fetchUserData(userId)
  .map(data => enrichUserData(data))  // Transform success value
  .flatMap(user => getUserPermissions(user))  // Chain to another Result
  .recover(defaultPermissions)  // Provide fallback value on failure
  .onSuccess(permissions => renderUI(permissions))  // Handle success
  .onFailure((msg, cause) => showError(msg, cause));  // Handle failure
```

## API Reference

## Creation Methods

### `Result.success<T>(value: T): Result<T>`

Creates a successful result containing the provided value.

### `Result.fail<T>(message: string, cause?: Error, ...data: unknown[]): Result<T>`

Creates a failure result with an error message, optional cause, and additional debug data.

## Properties

### `isSuccess: boolean`

Whether the result represents a successful operation.

### `isFailure: boolean`

Whether the result represents a failed operation.

### `value: T`

The success value. Throws an error if accessed on a failed result.

### `error: { message: string; cause?: Error; data?: unknown[] } | undefined`

The complete error details if this is a failure, undefined otherwise.

### `errorMessage: string | undefined`

The error message if this is a failure, undefined otherwise.

### `errorCause: Error | undefined`

The underlying error cause if provided, undefined otherwise.

## Methods

### `onSuccess(fn: (value: T) => void): Result<T>`

Executes the callback if this is a successful result, passing the value. Returns this result for method chaining.

### `onFailure(fn: (message: string, cause?: Error, data?: unknown[]) => void): Result<T>`

Executes the callback if this is a failed result, passing error details. Returns this result for method chaining.

### `map<U>(fn: (value: T) => U): Result<U>`

Transforms a successful result's value using the provided function. Returns a new Result with the transformed value, or the original error if failed.

### `flatMap<U>(fn: (value: T) => Result<U>): Result<U>`

Transforms a successful result into another Result using the provided function. Returns the new Result, or the original error if failed.

### `recover(defaultValue: T): Result<T>`

Provides a default value if this is a failed result. Returns a success result with either the original or default value.

### `recoverWith(fn: (error: { message: string; cause?: Error; data?: unknown[] } | undefined) => T): Result<T>`

Dynamically generates a recovery value based on error details if this is a failed result. Returns a success result with either the original value or the recovered value.

### `ensure(condition: (value: T) => boolean, message: string): Result<T>`

Ensures a condition is met on a successful result, or returns a failure. Returns this result if successful and condition is met, otherwise a failure.

## Best Practices

1. **Be consistent** - Use Result for all operations that might fail
2. **Keep it simple** - Prefer [Result.fail(message, cause)] over complex error hierarchies
3. **Add context** - Include relevant data in failure results to aid debugging
4. **Handle early** - Convert exceptions to Results at boundaries (API, I/O, etc.)
5. **Chain thoughtfully** - Use method chaining for linear workflows
6. **Provide fallbacks** - Use `recover] for graceful degradation

By following the Result pattern consistently, your codebase will have more predictable error handling, better developer experience, and fewer unexpected runtime errors.

$whoami
0en
