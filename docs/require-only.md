# RequireOnly

A TypeScript utility type that makes specific properties required while keeping others optional. Perfect for creating flexible APIs where certain fields are essential but others can be omitted.

## Type Definition

```typescript
export type RequireOnly<T, K extends keyof T> = Required<Pick<T, K>> & Partial<T>
```

## How It Works

`RequireOnly<T, K>` takes a type `T` and a union of property keys `K`, then:
1. Makes the specified properties `K` **required** 
2. Makes all other properties **optional**

This is the opposite of TypeScript's built-in `Partial` utility - instead of making everything optional, you choose what stays required.

## Basic Usage

```typescript
interface User {
  id: string
  name: string
  email: string
  age: number
  avatar?: string
}

// Only id and email are required, everything else becomes optional
type CreateUserRequest = RequireOnly<User, 'id' | 'email'>

// Valid usage
const newUser: CreateUserRequest = {
  id: "user-123",
  email: "user@example.com"
  // name, age, avatar are all optional now
}

const fullUser: CreateUserRequest = {
  id: "user-456", 
  email: "full@example.com",
  name: "John Doe",
  age: 30
  // Still valid - optional fields can be included
}
```

## Real-World Examples

### API Request Types

```typescript
interface BlogPost {
  id: string
  title: string
  content: string
  authorId: string
  publishedAt: Date
  tags: string[]
  viewCount: number
}

// For creating posts - only require essential fields
type CreatePostRequest = RequireOnly<BlogPost, 'title' | 'content' | 'authorId'>

// For updating posts - only require ID
type UpdatePostRequest = RequireOnly<BlogPost, 'id'>

const createPost: CreatePostRequest = {
  title: "My Post",
  content: "Post content",
  authorId: "author-123"
  // id, publishedAt, tags, viewCount are optional
}

const updatePost: UpdatePostRequest = {
  id: "post-456",
  title: "Updated title" // Only title is being updated
}
```

### Database Models

```typescript
interface DatabaseUser {
  id: string
  username: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

// For user registration - password and email required
type UserRegistration = RequireOnly<DatabaseUser, 'username' | 'email' | 'passwordHash'>

// For importing existing users - all fields except timestamps required
type ImportUser = RequireOnly<DatabaseUser, 'id' | 'username' | 'email' | 'passwordHash'>

const registration: UserRegistration = {
  username: "johndoe",
  email: "john@example.com", 
  passwordHash: "hashed_password"
  // id, timestamps generated automatically
}
```

### Key Management (Real Example from Synet)

```typescript
interface IKey {
  kid: string
  kms: string
  type: TKeyType
  publicKeyHex: string
  privateKeyHex?: string
  meta?: KeyMetadata | null
}

// For importing keys - only essential fields required
type MinimalImportableKey = RequireOnly<IKey, 'privateKeyHex' | 'type' | 'kms'>

const importKey: MinimalImportableKey = {
  privateKeyHex: "0x123...",
  type: "Ed25519",
  kms: "local"
  // kid, publicKeyHex can be generated
  // meta is optional
}
```

## Advanced Patterns

### Multiple Requirement Levels

```typescript
interface ProductData {
  id: string
  name: string
  description: string
  price: number
  category: string
  inStock: boolean
  tags: string[]
}

// Different requirement levels for different operations
type CreateProduct = RequireOnly<ProductData, 'name' | 'price' | 'category'>
type UpdateProduct = RequireOnly<ProductData, 'id'>
type SearchProduct = RequireOnly<ProductData, 'name' | 'category'>

// Usage in functions
function createProduct(data: CreateProduct): ProductData {
  return {
    id: generateId(),
    inStock: true,
    tags: [],
    description: "",
    ...data
  }
}

function updateProduct(data: UpdateProduct): Promise<ProductData> {
  // Only ID required, everything else optional
  return database.update(data.id, data)
}
```

### Form State Management

```typescript
interface FormFields {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  zipCode: string
}

// Step 1: Basic info required
type Step1Form = RequireOnly<FormFields, 'firstName' | 'lastName' | 'email'>

// Step 2: Contact info required  
type Step2Form = RequireOnly<FormFields, 'firstName' | 'lastName' | 'email' | 'phone'>

// Final submission: All fields required
type CompleteForm = Required<FormFields>

const step1: Step1Form = {
  firstName: "John",
  lastName: "Doe", 
  email: "john@example.com"
  // Other fields optional
}
```

## Comparison with Other Utilities

### vs `Partial<T>`

```typescript
type PartialUser = Partial<User>     // All fields optional
type RequiredUser = RequireOnly<User, 'id' | 'email'> // Only id & email required
```

### vs `Required<T>`

```typescript
type FullyRequired = Required<User>  // All fields required
type SelectivelyRequired = RequireOnly<User, 'id'> // Only id required
```

### vs `Pick<T, K>`

```typescript
type PickedUser = Pick<User, 'id' | 'email'>        // Only id & email, both required
type RequiredUser = RequireOnly<User, 'id' | 'email'> // id & email required, others optional
```

## When to Use

✅ **Good for:**
- API request/response types
- Form validation schemas
- Database insert/update operations
- Configuration objects
- Import/export interfaces
- Gradual data collection

❌ **Avoid when:**
- All fields should be required (use `Required<T>`)
- All fields should be optional (use `Partial<T>`)
- You need only specific fields (use `Pick<T, K>`)
- The type is already properly designed

## Best Practices

### 1. Name Clearly
```typescript
// Good - clear intent
type CreateUserRequest = RequireOnly<User, 'email' | 'username'>
type ImportableKey = RequireOnly<IKey, 'privateKeyHex' | 'type'>

// Bad - unclear intent  
type UserType = RequireOnly<User, 'email'>
```

### 2. Document Required Fields
```typescript
/**
 * User creation request
 * Required: email, username (for account creation)
 * Optional: All other fields (can be filled later)
 */
type CreateUserRequest = RequireOnly<User, 'email' | 'username'>
```

### 3. Use with Validation
```typescript
function validateCreateUser(data: CreateUserRequest): boolean {
  // TypeScript ensures email & username exist
  return isValidEmail(data.email) && data.username.length > 3
}
```

### 4. Combine with Guards
```typescript
import { Guard } from '@synet/patterns'

function processImportableKey(key: MinimalImportableKey) {
  Guard.againstNullOrUndefined(key.privateKeyHex, 'privateKeyHex')
  Guard.againstNullOrUndefined(key.type, 'type')
  Guard.againstNullOrUndefined(key.kms, 'kms')
  
  // Process key...
}
```

## Related Patterns

- **[Guard](./guard.md)** - Validate the required fields
- **[Result](./result.md)** - Handle validation failures
- **[Value Object](./value-object.md)** - Encapsulate the processed data
- **[Mapper](./mapper.md)** - Transform between different requirement levels


