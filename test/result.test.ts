import { describe, it, expect } from 'vitest';
import { Result } from '../src/patterns/result';

describe('Result Pattern', () => {
    
  describe('Creation and state checking', () => {
    it('should create a success result', () => {
      const result = Result.success(42);
      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBe(42);
    });

    it('should create a failure result with message only', () => {
      const result = Result.fail<number>('Something went wrong');
      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.errorMessage).toBe('Something went wrong');
      expect(() => result.value).toThrow('Cannot get value from a failed result');
    });

    it('should create a failure result with cause', () => {
      const cause = new Error('Root cause');
      const result = Result.fail<string>('Operation failed', cause);
      expect(result.isFailure).toBe(true);
      expect(result.errorMessage).toBe('Operation failed');
      expect(result.errorCause).toBe(cause);
    });

    it('should create a failure result with additional data', () => {
      const cause = new Error('Validation error');
      const data = { field: 'email', input: 'test', expected: 'email format' };
      const result = Result.fail<string>('Validation failed', cause, data);
      
      expect(result.isFailure).toBe(true);
      expect(result.error?.data?.[0]).toBe(data);
    });
  });

  describe('Method chaining', () => {
    it('should call onSuccess for success result', () => {
      let wasCalled = false;
      const value = 'test value';
      
      const result = Result.success(value)
        .onSuccess(v => {
          wasCalled = true;
          expect(v).toBe(value);
        });
      
      expect(wasCalled).toBe(true);
      expect(result.isSuccess).toBe(true); // Chain returns the result
    });

    it('should not call onSuccess for failure result', () => {
      let wasCalled = false;
      
      const result = Result.fail<string>('Error')
        .onSuccess(() => {
          wasCalled = true;
        });
      
      expect(wasCalled).toBe(false);
      expect(result.isFailure).toBe(true);
    });

    it('should call onFailure for failure result', () => {
      let wasCalled = false;
      const errorMessage = 'Something went wrong';
      const cause = new Error('Root cause');
      
      const result = Result.fail<number>(errorMessage, cause)
        .onFailure((msg, err) => {
          wasCalled = true;
          expect(msg).toBe(errorMessage);
          expect(err).toBe(cause);
        });
      
      expect(wasCalled).toBe(true);
      expect(result.isFailure).toBe(true);
    });

    it('should not call onFailure for success result', () => {
      let wasCalled = false;
      
      const result = Result.success(42)
        .onFailure(() => {
          wasCalled = true;
        });
      
      expect(wasCalled).toBe(false);
      expect(result.isSuccess).toBe(true);
    });
  });

  describe('Transformation methods', () => {
    it('should map success result to new value', () => {
      const original = Result.success(5);
      const mapped = original.map(v => v * 2);
      
      expect(mapped.isSuccess).toBe(true);
      expect(mapped.value).toBe(10);
    });

    it('should preserve failure when mapping', () => {
      const original = Result.fail<number>('Failed');
      const mapped = original.map(v => v * 2);
      
      expect(mapped.isFailure).toBe(true);
      expect(mapped.errorMessage).toBe('Failed');
    });

    it('should flatMap success result to another result', () => {
      const original = Result.success(5);
      const flatMapped = original.flatMap(v => Result.success(v * 2));
      
      expect(flatMapped.isSuccess).toBe(true);
      expect(flatMapped.value).toBe(10);
    });

    it('should flatMap success result to failure result', () => {
      const original = Result.success(5);
      const flatMapped = original.flatMap(v => 
        Result.fail<number>(`Can't process ${v}`, new Error('Processing error'))
      );
      
      expect(flatMapped.isFailure).toBe(true);
      expect(flatMapped.errorMessage).toBe("Can't process 5");
    });

    it('should preserve failure when flatMapping', () => {
      const original = Result.fail<number>('Initial failure');
      const flatMapped = original.flatMap(v => Result.success(v * 2));
      
      expect(flatMapped.isFailure).toBe(true);
      expect(flatMapped.errorMessage).toBe('Initial failure');
    });
  });

  describe('Recovery methods', () => {
    it('should recover from failure with default value', () => {
      const failed = Result.fail<number>('Failed operation');
      const recovered = failed.recover(42);
      
      expect(recovered.isSuccess).toBe(true);
      expect(recovered.value).toBe(42);
    });

    it('should not affect success result when recovering', () => {
      const success = Result.success(10);
      const recovered = success.recover(42);
      
      expect(recovered.isSuccess).toBe(true);
      expect(recovered.value).toBe(10); // Original value preserved
    });

    it('should recover from failure with dynamic value', () => {
        const failed = Result.fail<number>(
            'Failed with specific error', 
            new Error('Database connection error'),
            { retryCount: 3 }
        );
        
        const recovered = failed.recoverWith(error => {
            // Access the first element in the data array directly
            const data = error?.data?.[0] as { retryCount: number };
            return data?.retryCount ? data.retryCount * 10 : 0;
        });
        
        expect(recovered.isSuccess).toBe(true);
        expect(recovered.value).toBe(30); // 3 * 10
    });

    it('should not affect success result when recovering with function', () => {
      const success = Result.success(10);
      const recovered = success.recoverWith(() => 42);
      
      expect(recovered.isSuccess).toBe(true);
      expect(recovered.value).toBe(10); // Original value preserved
    });
  });

  describe('ensure method', () => {
    it('should return the result if condition is met', () => {
      const result = Result.success(42)
        .ensure(v => v > 0, 'Value must be positive');
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(42);
    });

    it('should return failure if condition is not met', () => {
      const result = Result.success(0)
        .ensure(v => v > 0, 'Value must be positive');
      
      expect(result.isFailure).toBe(true);
      expect(result.errorMessage).toBe('Value must be positive');
    });

    it('should not check condition for failure results', () => {
      let conditionChecked = false;
      
      const result = Result.fail<number>('Already failed')
        .ensure(() => {
          conditionChecked = true;
          return true;
        }, 'Value must be positive');
      
      expect(result.isFailure).toBe(true);
      expect(result.errorMessage).toBe('Already failed'); // Original error preserved
      expect(conditionChecked).toBe(false); // Condition not checked
    });
  });

  describe('Complex chaining', () => {
    it('should support complex method chaining', () => {
      // Setup a chain of operations
      const result = Result.success(5)
        .map(n => n * 2)                             // 10
        .flatMap(n => Result.success(n.toString()))  // "10"
        .ensure(s => s.length > 0, 'Empty string')   // still "10"
        .map(s => Number.parseInt(s))                       // 10
        .map(n => n + 5);                            // 15
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(15);
    });

    it('should short-circuit on first failure', () => {
      let laterStepExecuted = false;

      const result = Result.success(5)
        .map(n => n * 2)                             // 10
        .flatMap(n => Result.fail<string>('Error at step 2'))
        .ensure(s => s.length > 0, 'Empty string')   
        .map(s => {
          laterStepExecuted = true;
          return Number.parseInt(s);
        });
      
      expect(result.isFailure).toBe(true);
      expect(result.errorMessage).toBe('Error at step 2');
      expect(laterStepExecuted).toBe(false);
    });
  });
});