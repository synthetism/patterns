# Mapper Pattern

The Mapper Pattern provides a consistent way to transform objects between different layers of your application. It's especially valuable for converting between domain models and infrastructure models, ensuring each layer maintains its integrity.

## Key Characteristics

- **Separation of Concerns** - Prevents domain models from being polluted with infrastructure details
- **Bidirectional Mapping** - Converts in both directions (domain ↔ infrastructure)
- **Validation** - Can validate data during transformation
- **Type Safety** - Ensures correct property mapping with TypeScript
- **Domain Protection** - Shields domain logic from external representation concerns

## When to Use Mappers

Use Mappers when:

- Converting between domain entities and database models
- Transforming domain objects to API responses or DTOs
- Processing incoming API requests into domain objects
- Migrating between different data formats or versions
- Preserving a clean domain model independent of external systems

## Basic Usage

```typescript
import { Mapper, Result } from '@synet/patterns';

// Domain Entity
class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly isActive: boolean,
  ) {}
}

// Infrastructure Model (e.g., database schema)
interface UserModel {
  user_id: string;
  full_name: string;
  email_address: string;
  status: number;
}

// Mapper Implementation
class UserMapper implements Mapper<User, UserModel> {
  // Convert from infrastructure to domain
  toDomain(raw: UserModel): Result<User> {
    try {
      const user = new User(
        raw.user_id,
        raw.full_name,
        raw.email_address,
        raw.status === 1
      );
    
      return Result.success(user);
    } catch (error) {
      return Result.fail('Failed to map user model to domain', error);
    }
  }

  // Convert from domain to infrastructure
  toPersistence(domain: User): UserModel {
    return {
      user_id: domain.id,
      full_name: domain.name,
      email_address: domain.email,
      status: domain.isActive ? 1 : 0
    };
   }

    toEntity(model: UserModel): User {
     return {
        id: model.id,
        firstName: model.firstName,
        lastName: model.lastName,
        email: model.email,
      };
    }
}
```

## Advanced Usage with Value Objects

Mappers work especially well with Value Objects, handling the conversion between domain-rich objects and simpler infrastructure representations:

```typescript
import { Mapper, Result, ValueObject } from '@synet/patterns';

// Domain Value Objects
class Email extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  public static create(email: string): Result<Email> {
    if (!email.includes('@')) {
      return Result.fail('Invalid email format');
    }
    return Result.success(new Email({ value: email.toLowerCase() }));
  }

  get value(): string {
    return this.props.value;
  }
}

// Domain Entity with Value Objects
class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: Email,
    public readonly isActive: boolean,
  ) {}
}

// Infrastructure Model
interface UserModel {
  user_id: string;
  full_name: string;
  email_address: string;
  status: number;
}

// Enhanced Mapper using Value Objects
class UserMapper implements Mapper<User, UserModel> {
```
