/**
 * Base class for Value Objects
 * 
 * Value Objects are immutable objects that are distinguishable only by the state of their properties.
 * They have no identity and are considered equal when their properties are equal.
 * 
 * @example
 * class Email extends ValueObject<{ address: string }> {
 *   private constructor(props: { address: string }) {
 *     super(props);
 *   }
 *   
 *   public static create(address: string): Result<Email> {
 *     if (!address.includes('@')) {
 *       return Result.fail('Email must contain @ symbol');
 *     }
 *     return Result.success(new Email({ address }));
 *   }
 *   
 *   get value(): string {
 *     return this.props.address;
 *   }
 * }
 */
export abstract class ValueObject<T extends object> {
  /**
   * The properties that define this Value Object.
   * These are protected to prevent direct modification from outside.
   */
  protected readonly props: Readonly<T>;

  /**
   * Creates a new Value Object with the given properties.
   * The properties are frozen to ensure immutability.
   */
  constructor(props: T) {
    this.props = Object.freeze({ ...props });
  }

  /**
   * Checks if this Value Object is equal to another Value Object.
   * Two Value Objects are considered equal if all their properties are equal.
   */
  public equals(vo?: ValueObject<T> | null): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    
    if (!(vo instanceof this.constructor)) {
      return false;
    }
    
    return this.isEqual(this.props, vo.props);
  }

  /**
   * Deep comparison of properties.
   * This handles nested objects and arrays properly.
   */
  private isEqual<U>(obj1: U, obj2: U): boolean {
    if (obj1 === obj2) {
      return true;
    }
    
    if (typeof obj1 !== 'object' || obj1 === null || 
        typeof obj2 !== 'object' || obj2 === null) {
      return obj1 === obj2;
    }
    
    const keys1 = Object.keys(obj1 as object);
    const keys2 = Object.keys(obj2 as object);
    
    if (keys1.length !== keys2.length) {
      return false;
    }
    
    return keys1.every(key => {
      // Type assertion needed because TypeScript doesn't recognize keys1/keys2 are keys of obj1/obj2
      return keys2.includes(key) && this.isEqual(
        (obj1 as Record<string, unknown>)[key], 
        (obj2 as Record<string, unknown>)[key]
      );
    });
  }

  /**
   * Returns a string representation of this Value Object.
   */
  public toString(): string {
    return JSON.stringify(this.props);
  }

  /**
   * Returns a shallow copy of the props.
   * This can be used when you need to access the raw data.
   */
  protected toObject(): T {
    return { ...this.props };
  }
}