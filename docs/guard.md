# Guard Pattern

The Guard Pattern is a defensive programming technique that validates inputs and preconditions early in execution. It helps prevent invalid states and makes code more robust by centralizing validation logic.

## Key Characteristics

- **Early Validation** - Checks inputs before business logic executes
- **Type-Specific Validation** - Organized by data type for better discoverability
- **Consistent Error Handling** - Standardized validation reporting
- **Self-Documenting** - Makes preconditions explicit and clear
- **Result Integration** - Works with the Result pattern for functional error handling

## When to Use Guards

Use Guards when:

- Validating method inputs to prevent invalid operations
- Enforcing business rules that apply consistently across the domain
- Ensuring required preconditions are met before proceeding
- Implementing domain validation that needs to be reusable
- Implementing complex validation chains for form inputs

## Why

**Before**
Unmaintanable validation

```typescript
class Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  
  constructor(id: string, name: string, price: number, stock: number) {
    // Validation mixed with assignment
    if (!id || id.trim() === '') {
      throw new Error("Product ID cannot be empty");
    }
    this.id = id;
    
    if (!name || name.trim() === '') {
      throw new Error("Product name cannot be empty");
    }
    this.name = name;
    
    if (price <= 0) {
      throw new Error("Price must be positive");
    }
    this.price = price;
    
    if (stock < 0) {
      throw new Error("Stock cannot be negative");
    }
    this.stock = stock;
  }
  
  // Methods...
}

// Usage with error handling
try {
  const product = new Product("123", "", 10, 5);
} catch (error) {
  console.error("Failed to create product:", error.message);
}
```

**After**
Clean, maintainable validation with Guards

```typescript
class Product {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
    public readonly stock: number
  ) {}
  
  static create(id: string, name: string, price: number, stock: number): Result<Product> {
    // Clear validation with standardized error messages
    const validations = [
      Guard.String.nonEmpty(id, 'id'),
      Guard.String.nonEmpty(name, 'name'),
      Guard.Number.positive(price, 'price'),
      Guard.Number.nonNegative(stock, 'stock')
    ];
    
    const guardResult = Guard.combine(validations);
    if (guardResult.isFailure) {
      return Result.fail(guardResult.errorMessage);
    }
    
    return Result.success(new Product(id, name, price, stock));
  }
  
  // Methods...
}

// Usage with Result handling
const productResult = Product.create("123", "", 10, 5);
if (productResult.isSuccess) {
  const product = productResult.value;
  // Use product...
} else {
  console.error("Failed to create product:", productResult.errorMessage);
}
```



## Basic Usage

```typescript
import { Guard, Result } from '@synet/patterns';

function createProduct(name: string, price: number, quantity: number): Result<Product> {
  // Validate input parameters using type-specific guards
  const nameResult = Guard.String.nonEmpty(name, 'name');
  const priceResult = Guard.Number.positive(price, 'price');
  const quantityResult = Guard.Number.nonNegative(quantity, 'quantity');
  
  // Combine all validations into a single result
  const guardResult = Guard.combine([nameResult, priceResult, quantityResult]);
  
  // Stop processing if validation fails
  if (guardResult.isFailure) {
    return Result.fail(guardResult.errorMessage);
  }
  
  // Proceed with validated inputs
  return Result.success(new Product(nameResult.value, priceResult.value, quantityResult.value));
}
```

## Available Guards

### Common Guards

```typescript
// Check defined values (not null or undefined)
Guard.defined(value, 'fieldName');

// Assert a custom condition
Guard.assert(price > cost, 'Price must be greater than cost');

// Combine multiple guard results
Guard.combine([result1, result2, result3]);
```

### String Guards

```typescript
// Check non-empty string
Guard.String.nonEmpty(title, 'title');

// Validate string against regex pattern
Guard.String.pattern(code, /^[A-Z]{2}\d{3}$/, 'code');

// Validate email format
Guard.String.email(email, 'email');

// Check string length constraints
Guard.String.minLength(password, 8, 'password');
Guard.String.maxLength(username, 50, 'username');
Guard.String.length(nickname, 3, 20, 'nickname');

// Content-specific validations
Guard.String.letters(name, 'name');
Guard.String.alphanumeric(username, 'username');
```

### Number Guards

```typescript
// Value constraints
Guard.Number.positive(price, 'price');
Guard.Number.nonNegative(quantity, 'quantity');
Guard.Number.range(age, 18, 65, 'age');
Guard.Number.min(height, 100, 'height');
Guard.Number.max(discount, 0.5, 'discount');

// Type constraints
Guard.Number.integer(count, 'count');
```

### Array Guards

```typescript
// Check array is not empty
Guard.Array.nonEmpty(items, 'items');

// Check array length
Guard.Array.minLength(selectedOptions, 2, 'selectedOptions');
Guard.Array.maxLength(tags, 5, 'tags');

// Check array contains specific value
Guard.Array.includes(roles, 'admin', 'roles');

// Check all array elements satisfy a condition
Guard.Array.every(prices, price => price > 0, 'prices', 'All prices must be positive');
```

### Object Guards

```typescript
// Check object has specific property
Guard.Object.hasProperty(user, 'email', 'user');

// Check object is not empty
Guard.Object.nonEmpty(config, 'config');
```

### Date Guards

```typescript
// Time-based validations
Guard.Date.inPast(birthDate, 'birthDate');
Guard.Date.inFuture(expiryDate, 'expiryDate');
Guard.Date.before(startDate, endDate, 'startDate');
Guard.Date.after(endDate, startDate, 'endDate');
```

## Integration with Value Objects

Guards work particularly well with Value Objects:

```typescript
class Email extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }
  
  public static create(email: string): Result<Email> {
    // Use Guard for validation
    const guardResult = Guard.String.email(email, 'email');
  
    if (guardResult.isFailure) {
      return Result.fail(guardResult.errorMessage);
    }
  
    return Result.success(new Email({ value: email.toLowerCase() }));
  }
  
  get value(): string {
    return this.props.value;
  }
}
```

## Complex Validation Example

```typescript
function registerUser(
  email: string, 
  password: string, 
  age: number,
  roles: string[]
): Result<User> {
  // Collect all validations
  const validations = [
    Guard.String.email(email, 'email'),
  
    // Password with multiple validations
    Guard.String.minLength(password, 8, 'password'),
    Guard.String.pattern(
      password, 
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'password',
      'Password must contain uppercase, lowercase and number'
    ),
  
    // Age must be reasonable
    Guard.Number.range(age, 18, 120, 'age'),
  
    // Must have at least one role
    Guard.Array.nonEmpty(roles, 'roles')
  ];
  
  // Combine all validations
  const guardResult = Guard.combine(validations);
  
  if (guardResult.isFailure) {
    return Result.fail(guardResult.errorMessage);
  }
  
  // Create user with validated values
  return User.create({
    email,
    password,
    age,
    roles
  });
}
```

## Benefits

1. **Improved Readability** - Clear validation intent
2. **Reduced Duplication** - Common validations defined once
3. **Consistent Error Messages** - Standard formatting
4. **Early Validation** - Fail fast before entering business logic
5. **Better Testing** - Validation logic separated from business logic
6. **Discoverable API** - Type-organized methods guide developers to right validation
7. **Result Integration** - Works seamlessly with functional error handling

## Best Practices

1. **Validate Early** - Apply guards at the entry points of your functions
2. **Use Descriptive Names** - Include the field name in guard calls
3. **Combine Related Validations** - Use Guard.combine for related validations
4. **Avoid Guard Duplication** - Define domain-specific guards for complex rules
5. **Return Validated Values** - Use the returned values to ensure they've passed validation

The Guard pattern is a simple but powerful technique that ensures your code only operates on valid data, preventing bugs and providing better error reporting.
