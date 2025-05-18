/**
 * Base specification pattern implementation.
 * 
 * Specifications encapsulate query logic, making it reusable and composable.
 * They represent a predicate that determines if an object satisfies some criteria.
 */
export abstract class Specification<T> {
  /**
   * Determines if the candidate object satisfies this specification
   */
  abstract isSatisfiedBy(candidate: T): boolean;

  /**
   * Combines this specification with another using AND operator
   */
  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  /**
   * Combines this specification with another using OR operator
   */
  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  /**
   * Negates this specification
   */
  not(): Specification<T> {
    return new NotSpecification(this);
  }
}

/**
 * Specification that combines two specifications with logical AND
 */
class AndSpecification<T> extends Specification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }
}

/**
 * Specification that combines two specifications with logical OR
 */
class OrSpecification<T> extends Specification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }
}

/**
 * Specification that negates another specification
 */
class NotSpecification<T> extends Specification<T> {
  constructor(private specification: Specification<T>) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return !this.specification.isSatisfiedBy(candidate);
  }
}