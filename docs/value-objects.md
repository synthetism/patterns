# Value Objects Pattern

Value Objects are immutable objects that represent a concept in your domain through their attributes, with no distinct identity of their own. Two Value Objects with the same properties are considered equal.

## Key Characteristics

- **Immutable** - Once created, cannot be changed
- **Equality by value** - Two objects with identical properties are equal
- **Self-validating** - Ensures all values meet domain rules
- **Concept-focused** - Represents a complete concept, not just data
- **No identity** - Distinguished only by property values

## When to Use Value Objects

Use Value Objects when:

- The concept is defined entirely by its attributes (like Email, Money, Address)
- Equality should be determined by comparing values, not identity
- You need to enforce validation rules on data
- The concept should be immutable to prevent bugs
- You want to encapsulate behavior related to the concept

## Basic Usage

```typescript
import { ValueObject, Result } from '@synet/patterns';

// 1. Define your Value Object class
class Email extends ValueObject<{ address: string }> {
  // Private constructor enforces validation
  private constructor(props: { address: string }) {
    super(props);
  }

  // Factory method for creating instances with validation
  public static create(address: string): Result<Email> {
    if (!address || !address.includes('@')) {
      return Result.fail('Invalid email format');
    }
    return Result.success(new Email({ address: address.toLowerCase() }));
  }

  // Getter for accessing the internal value
  get value(): string {
    return this.props.address;
  }
}

// 2. Create and use the Value Object
const emailResult = Email.create('user@example.com');

emailResult.onSuccess(email => {
  console.log(email.value); // "user@example.com"
  
  // Value objects are immutable - trying to modify them would fail
  // email.props.address = 'new@email.com'; // Error: Cannot assign to read-only property
});
```

## Advanced Features

### Equality Comparison

Value Objects can be compared for equality based on their values:

```typescript
const email1 = Email.create('test@example.com').value;
const email2 = Email.create('test@example.com').value;
const email3 = Email.create('different@example.com').value;

console.log(email1.equals(email2)); // true
console.log(email1.equals(email3)); // false
```

### Composition

Value Objects can be composed of other Value Objects:

```typescript
class Address extends ValueObject<{
  street: Street;
  city: City;
  postalCode: PostalCode;
  country: Country;
}> {
  private constructor(props: {
    street: Street;
    city: City;
    postalCode: PostalCode;
    country: Country;
  }) {
    super(props);
  }

  public static create(props: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  }): Result<Address> {
    // Validate and create each component
    const streetOrError = Street.create(props.street);
    const cityOrError = City.create(props.city);
    const postalCodeOrError = PostalCode.create(props.postalCode);
    const countryOrError = Country.create(props.country);

    // Combine results
    if (streetOrError.isFailure) {
      return Result.fail(streetOrError.errorMessage || 'Invalid street');
    }
  
    // Additional validation for other components...
  
    return Result.success(new Address({
      street: streetOrError.value,
      city: cityOrError.value,
      postalCode: postalCodeOrError.value,
      country: countryOrError.value
    }));
  }

  // Additional methods...
}
```

## Common Value Object Types

- **Email** - Email addresses with validation
- **Money** - Currency amount with currency code
- **DateRange** - Start and end dates with validation
- **Name** - First, middle, last names with formatting
- **Identifier** - UUID, custom ID formats
- **PhoneNumber** - Phone numbers with validation and formatting
- **Address** - Structured address data
- **Measurement** - Value with unit (weight, distance, etc.)

## Integration with Entity Objects

Value Objects are commonly used as properties of Entity objects:

```typescript
class User {
  public readonly id: UniqueID;
  public readonly email: Email;
  public readonly name: Name;
  public readonly address: Address;
  
  private constructor(props: {
    id: UniqueID;
    email: Email;
    name: Name;
    address: Address;
  }) {
    this.id = props.id;
    this.email = props.email;
    this.name = props.name;
    this.address = props.address;
  }
  
  public static create(props: {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  }): Result<User> {
    // Create value objects from primitives
    const emailOrError = Email.create(props.email);
    const nameOrError = Name.create({
      firstName: props.firstName,
      lastName: props.lastName
    });
    const addressOrError = Address.create({
      street: props.street,
      city: props.city,
      postalCode: props.postalCode,
      country: props.country
    });
  
    // Handle validation failures
    if (emailOrError.isFailure) {
      return Result.fail(emailOrError.errorMessage || 'Invalid email');
    }
  
    // Additional error handling...
  
    // Create the entity with value objects
    return Result.success(new User({
      id: new UniqueID(props.id),
      email: emailOrError.value,
      name: nameOrError.value,
      address: addressOrError.value
    }));
  }
}
```

## Benefits

1. **Domain Integrity** - Rules are enforced at creation time
2. **Type Safety** - TypeScript ensures correct usage
3. **Bug Reduction** - Immutability prevents accidental changes
4. **Intention Revealing** - Code clearly expresses domain concepts
5. **Encapsulation** - Implementation details are hidden

## Implementation Details

The base `ValueObject` class provides:

1. **Immutable Properties** - Properties are frozen to prevent modification
2. **Deep Equality** - Comparison of all nested properties
3. **String Representation** - Default `toString()` implementation
4. **Encapsulation** - Protected access to raw property values

## Best Practices

1. **Make constructors private** - Force use of factory methods for validation
2. **Return Results** - Use Result pattern for validation failures
3. **Keep value objects small** - Focus on a single concept
4. **Use composition** - Build complex value objects from simpler ones
5. **Add domain-specific methods** - Include behavior related to the concept
6. **Avoid primitive obsession** - Use value objects instead of primitive types

Value Objects are a powerful pattern for creating a rich, expressive domain model that enforces business rules at the most granular level.
