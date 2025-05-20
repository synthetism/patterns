import { describe, it, expect } from 'vitest';
import { Guard } from '../src/patterns';

describe('Guard Pattern', () => {
  describe('Common Guards', () => {
    describe('defined', () => {
      it('should pass for defined values', () => {
        const result = Guard.defined('test', 'testValue');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe('test');
      });
      
      it('should fail for null values', () => {
        const result = Guard.defined(null, 'testValue');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('testValue cannot be null or undefined');
      });
      
      it('should fail for undefined values', () => {
        const result = Guard.defined(undefined, 'testValue');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('testValue cannot be null or undefined');
      });
    });
    
    describe('assert', () => {
      it('should pass when condition is true', () => {
        const result = Guard.assert(true, 'Test assertion failed');
        expect(result.isSuccess).toBe(true);
      });
      
      it('should fail when condition is false', () => {
        const result = Guard.assert(false, 'Test assertion failed');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('Test assertion failed');
      });
    });
    
    describe('combine', () => {
      it('should combine multiple successful results', () => {
        const results = [
          Guard.String.nonEmpty('test', 'name'),
          Guard.Number.positive(42, 'age'),
          Guard.Array.nonEmpty([1, 2, 3], 'items')
        ];
        
        const combinedResult = Guard.combine(results);
        expect(combinedResult.isSuccess).toBe(true);
      });
      
      it('should combine multiple failed results', () => {
        const results = [
          Guard.String.nonEmpty('', 'name'),
          Guard.Number.positive(-5, 'price'),
          Guard.Array.nonEmpty([], 'items')
        ];
        
        const combinedResult = Guard.combine(results);
        expect(combinedResult.isFailure).toBe(true);
        expect(combinedResult.errorMessage).toContain('name cannot be empty');
        expect(combinedResult.errorMessage).toContain('price must be positive');
        expect(combinedResult.errorMessage).toContain('items cannot be empty');
      });
      
      it('should pass with an empty array', () => {
        const combinedResult = Guard.combine([]);
        expect(combinedResult.isSuccess).toBe(true);
      });
    });
  });
  
  describe('String Guards', () => {
    describe('nonEmpty', () => {
      it('should pass for non-empty strings', () => {
        const result = Guard.String.nonEmpty('test', 'testString');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe('test');
      });
      
      it('should fail for empty strings', () => {
        const result = Guard.String.nonEmpty('', 'testString');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('testString cannot be empty');
      });
      
      it('should fail for whitespace-only strings', () => {
        const result = Guard.String.nonEmpty('   ', 'testString');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('testString cannot be empty');
      });
    });
    
    describe('pattern', () => {
      it('should pass for strings matching pattern', () => {
        const result = Guard.String.pattern('abc123', /^[a-z0-9]+$/, 'testPattern');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe('abc123');
      });
      
      it('should fail for strings not matching pattern', () => {
        const result = Guard.String.pattern('ABC123!', /^[a-z0-9]+$/, 'testPattern');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('testPattern has an invalid format');
      });
      
      it('should use custom error message when provided', () => {
        const result = Guard.String.pattern(
          'ABC123', 
          /^[a-z0-9]+$/, 
          'testPattern', 
          'Must be lowercase letters and numbers only'
        );
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('Must be lowercase letters and numbers only');
      });
    });
    
    describe('email', () => {
      it('should pass for valid email addresses', () => {
        const validEmails = [
          'test@example.com',
          'user.name+tag@domain.co.uk',
          '123@domain-name.org'
        ];
        
        for (const email of validEmails) {
          const result = Guard.String.email(email, 'email');
          expect(result.isSuccess).toBe(true);
          expect(result.value).toBe(email);
        }
      });
      
      it('should fail for invalid email addresses', () => {
        const invalidEmails = [
          'plainaddress',
          '@missinglocal.com',
          'missingat.domain.com',
          'missing.domain@',
          'two@@symbols.com',
          'spaces in@email.com'
        ];
        
        for (const email of invalidEmails) {
          const result = Guard.String.email(email, 'email');
          expect(result.isFailure).toBe(true);
          expect(result.errorMessage).toBe('email must be a valid email address');
        }
      });
    });
    
    describe('minLength', () => {
      it('should pass for strings with sufficient length', () => {
        const result = Guard.String.minLength('test', 3, 'password');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe('test');
      });
      
      it('should fail for strings that are too short', () => {
        const result = Guard.String.minLength('abc', 4, 'password');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('password must be at least 4 characters long');
      });
    });
    
    describe('maxLength', () => {
      it('should pass for strings within length limit', () => {
        const result = Guard.String.maxLength('test', 5, 'username');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe('test');
      });
      
      it('should fail for strings that are too long', () => {
        const result = Guard.String.maxLength('toolongusername', 10, 'username');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('username must not exceed 10 characters');
      });
    });
    
    describe('length', () => {
      it('should pass for strings within length range', () => {
        const result = Guard.String.length('username', 3, 10, 'username');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe('username');
      });
      
      it('should fail for strings that are too short', () => {
        const result = Guard.String.length('ab', 3, 10, 'username');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('username must be at least 3 characters long');
      });
      
      it('should fail for strings that are too long', () => {
        const result = Guard.String.length('verylongusername', 3, 10, 'username');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('username must not exceed 10 characters');
      });
    });
    
    describe('letters', () => {
      it('should pass for strings containing only letters', () => {
        const result = Guard.String.letters('abcDEF', 'name');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe('abcDEF');
      });
      
      it('should fail for strings containing non-letter characters', () => {
        const result = Guard.String.letters('abc123', 'name');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('name must contain only letters');
      });
    });
    
    describe('alphanumeric', () => {
      it('should pass for strings containing only letters and numbers', () => {
        const result = Guard.String.alphanumeric('abc123', 'username');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe('abc123');
      });
      
      it('should fail for strings containing non-alphanumeric characters', () => {
        const result = Guard.String.alphanumeric('abc_123', 'username');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('username must contain only alphanumeric characters');
      });
    });
  });
  
  describe('Number Guards', () => {
    describe('positive', () => {
      it('should pass for positive numbers', () => {
        const result = Guard.Number.positive(42, 'price');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe(42);
      });
      
      it('should fail for zero', () => {
        const result = Guard.Number.positive(0, 'price');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('price must be positive');
      });
      
      it('should fail for negative numbers', () => {
        const result = Guard.Number.positive(-10, 'price');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('price must be positive');
      });
    });
    
    describe('nonNegative', () => {
      it('should pass for positive numbers', () => {
        const result = Guard.Number.nonNegative(42, 'quantity');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe(42);
      });
      
      it('should pass for zero', () => {
        const result = Guard.Number.nonNegative(0, 'quantity');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe(0);
      });
      
      it('should fail for negative numbers', () => {
        const result = Guard.Number.nonNegative(-5, 'quantity');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('quantity cannot be negative');
      });
    });
    
    describe('range', () => {
      it('should pass for numbers within range', () => {
        const result = Guard.Number.range(25, 18, 60, 'age');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe(25);
      });
      
      it('should pass for numbers at lower boundary', () => {
        const result = Guard.Number.range(18, 18, 60, 'age');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe(18);
      });
      
      it('should pass for numbers at upper boundary', () => {
        const result = Guard.Number.range(60, 18, 60, 'age');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe(60);
      });
      
      it('should fail for numbers below range', () => {
        const result = Guard.Number.range(17, 18, 60, 'age');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('age must be between 18 and 60');
      });
      
      it('should fail for numbers above range', () => {
        const result = Guard.Number.range(61, 18, 60, 'age');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('age must be between 18 and 60');
      });
    });
    
    describe('min', () => {
      it('should pass for numbers above minimum', () => {
        const result = Guard.Number.min(20, 18, 'age');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe(20);
      });
      
      it('should pass for numbers at minimum', () => {
        const result = Guard.Number.min(18, 18, 'age');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe(18);
      });
      
      it('should fail for numbers below minimum', () => {
        const result = Guard.Number.min(17, 18, 'age');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('age must be at least 18');
      });
    });
    
    describe('max', () => {
      it('should pass for numbers below maximum', () => {
        const result = Guard.Number.max(50, 60, 'age');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe(50);
      });
      
      it('should pass for numbers at maximum', () => {
        const result = Guard.Number.max(60, 60, 'age');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe(60);
      });
      
      it('should fail for numbers above maximum', () => {
        const result = Guard.Number.max(61, 60, 'age');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('age must not exceed 60');
      });
    });
    
    describe('integer', () => {
      it('should pass for integer values', () => {
        const result = Guard.Number.integer(42, 'count');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe(42);
      });
      
      it('should fail for floating point values', () => {
        const result = Guard.Number.integer(42.5, 'count');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('count must be an integer');
      });
    });
  });
  
  describe('Array Guards', () => {
    describe('nonEmpty', () => {
      it('should pass for non-empty arrays', () => {
        const result = Guard.Array.nonEmpty([1, 2, 3], 'items');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
      });
      
      it('should fail for empty arrays', () => {
        const result = Guard.Array.nonEmpty([], 'items');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('items cannot be empty');
      });
    });
    
    describe('minLength', () => {
      it('should pass for arrays with sufficient items', () => {
        const result = Guard.Array.minLength([1, 2, 3], 2, 'items');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
      });
      
      it('should fail for arrays with too few items', () => {
        const result = Guard.Array.minLength([1], 2, 'items');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('items must contain at least 2 items');
      });
    });
    
    describe('maxLength', () => {
      it('should pass for arrays within length limit', () => {
        const result = Guard.Array.maxLength([1, 2], 3, 'items');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toEqual([1, 2]);
      });
      
      it('should fail for arrays with too many items', () => {
        const result = Guard.Array.maxLength([1, 2, 3, 4], 3, 'items');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('items must not contain more than 3 items');
      });
    });
    
    describe('includes', () => {
      it('should pass when array includes required item', () => {
        const result = Guard.Array.includes([1, 2, 3], 2, 'items');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
      });
      
      it('should fail when array does not include required item', () => {
        const result = Guard.Array.includes([1, 3, 4], 2, 'items');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('items does not contain the required item');
      });
    });
    
    describe('every', () => {
      it('should pass when all elements satisfy predicate', () => {
        const result = Guard.Array.every(
          [2, 4, 6], 
          (n) => n % 2 === 0, 
          'numbers', 
          'All numbers must be even'
        );
        expect(result.isSuccess).toBe(true);
        expect(result.value).toEqual([2, 4, 6]);
      });
      
      it('should fail when any element does not satisfy predicate', () => {
        const result = Guard.Array.every(
          [2, 3, 6], 
          (n) => n % 2 === 0, 
          'numbers', 
          'All numbers must be even'
        );
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('All numbers must be even');
      });
    });
  });
  
  describe('Object Guards', () => {
    describe('hasProperty', () => {
      it('should pass for objects with specified property', () => {
        const obj = { name: 'test', age: 30 };
        const result = Guard.Object.hasProperty(obj, 'name', 'user');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toEqual(obj);
      });
      
      it('should fail for objects missing specified property', () => {
        const obj = { age: 30 };
        const result = Guard.Object.hasProperty(obj, 'name', 'user');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('user does not have the required property \'name\'');
      });
    });
    
    describe('nonEmpty', () => {
      it('should pass for non-empty objects', () => {
        const obj = { name: 'test' };
        const result = Guard.Object.nonEmpty(obj, 'user');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toEqual(obj);
      });
      
      it('should fail for empty objects', () => {
        const obj = {};
        const result = Guard.Object.nonEmpty(obj, 'user');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('user cannot be empty');
      });
    });
  });
  
  describe('Date Guards', () => {
    describe('inPast', () => {
      it('should pass for dates in the past', () => {
        const pastDate = new Date(2020, 0, 1); // January 1, 2020
        const result = Guard.Date.inPast(pastDate, 'birthdate');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toEqual(pastDate);
      });
      
      it('should fail for current date', () => {
        const now = new Date();
        const result = Guard.Date.inPast(now, 'birthdate');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('birthdate must be in the past');
      });
      
      it('should fail for future dates', () => {
        const futureDate = new Date(2030, 0, 1); // January 1, 2030
        const result = Guard.Date.inPast(futureDate, 'birthdate');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('birthdate must be in the past');
      });
    });
    
    describe('inFuture', () => {
      it('should pass for dates in the future', () => {
        const futureDate = new Date(2030, 0, 1); // January 1, 2030
        const result = Guard.Date.inFuture(futureDate, 'expiryDate');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toEqual(futureDate);
      });
      
      it('should fail for current date', () => {
        const now = new Date();
        const result = Guard.Date.inFuture(now, 'expiryDate');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('expiryDate must be in the future');
      });
      
      it('should fail for past dates', () => {
        const pastDate = new Date(2020, 0, 1); // January 1, 2020
        const result = Guard.Date.inFuture(pastDate, 'expiryDate');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toBe('expiryDate must be in the future');
      });
    });
    
    describe('before', () => {
      it('should pass for dates before threshold', () => {
        const date = new Date(2020, 0, 1); // January 1, 2020
        const threshold = new Date(2021, 0, 1); // January 1, 2021
        const result = Guard.Date.before(date, threshold, 'startDate');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toEqual(date);
      });
      
      it('should fail for dates equal to threshold', () => {
        const date = new Date(2021, 0, 1); // January 1, 2021
        const threshold = new Date(2021, 0, 1); // January 1, 2021
        const result = Guard.Date.before(date, threshold, 'startDate');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toContain('startDate must be before');
      });
      
      it('should fail for dates after threshold', () => {
        const date = new Date(2022, 0, 1); // January 1, 2022
        const threshold = new Date(2021, 0, 1); // January 1, 2021
        const result = Guard.Date.before(date, threshold, 'startDate');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toContain('startDate must be before');
      });
    });
    
    describe('after', () => {
      it('should pass for dates after threshold', () => {
        const date = new Date(2022, 0, 1); // January 1, 2022
        const threshold = new Date(2021, 0, 1); // January 1, 2021
        const result = Guard.Date.after(date, threshold, 'endDate');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toEqual(date);
      });
      
      it('should fail for dates equal to threshold', () => {
        const date = new Date(2021, 0, 1); // January 1, 2021
        const threshold = new Date(2021, 0, 1); // January 1, 2021
        const result = Guard.Date.after(date, threshold, 'endDate');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toContain('endDate must be after');
      });
      
      it('should fail for dates before threshold', () => {
        const date = new Date(2020, 0, 1); // January 1, 2020
        const threshold = new Date(2021, 0, 1); // January 1, 2021
        const result = Guard.Date.after(date, threshold, 'endDate');
        expect(result.isFailure).toBe(true);
        expect(result.errorMessage).toContain('endDate must be after');
      });
    });
  });
});