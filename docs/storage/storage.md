# Storage Pattern

The Storage pattern provides a consistent interface for data persistence across different storage mechanisms. It defines core storage operations with both synchronous and asynchronous variants.

## Interface Variants

### Synchronous Storage

```typescript
export interface IStorage<T> {
  exists(id: string): boolean;
  create(data: T): void;
  get(id: string): T | null;
  delete(id: string): boolean;
  list(): T[];
  update?(id: string, data: Partial<T>): void;
}
```

### Asynchronous Storage (Promises)

```typescript
export interface IStorage<T> {
  exists(id: string): Promise<boolean>;
  create(data: T): Promise<void>;
  get(id: string): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  list(): Promise<T[]>;
  update?(id: string, data: Partial<T>): Promise<void>;
}
```

### Asynchronous Storage with Result Pattern

```typescript
export interface IStorage<T> {
  exists(id: string): Promise<Result<boolean>>;
  create(data: T): Promise<Result<void>>;
  get(id: string): Promise<Result<T>>;
  delete(id: string): Promise<Result<void>>;
  list(): Promise<Result<T[]>>;
  update?(id: string, data: Partial<T>): Promise<Result<T>>;
}
```

## Core Operations

- **exists**: Check if an item with given ID exists
- **create**: Store a new data item
- **get**: Retrieve an item by ID
- **delete**: Remove an item by ID
- **list**: Retrieve all stored items
- **update** (optional): Partially update an existing item

## Implementation Example: FileStore

A simple file-based storage implementation using the asynchronous interface:

```typescript
import fs from 'node:fs/promises';
import path from 'node:path';
import { IStorage } from '@synet/patterns/storage/promises';

export class FileStore<T extends { id: string }> implements IStorage<T> {
  constructor(private readonly directory: string) {
    // Ensure directory exists
    fs.mkdir(directory, { recursive: true }).catch(err => {
      console.error(`Error creating directory: ${err}`);
    });
  }

  private getFilePath(id: string): string {
    return path.join(this.directory, `${id}.json`);
  }

  async exists(id: string): Promise<boolean> {
    try {
      await fs.access(this.getFilePath(id));
      return true;
    } catch {
      return false;
    }
  }

  async create(data: T): Promise<void> {
    const filePath = this.getFilePath(data.id);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async get(id: string): Promise<T | null> {
    const filePath = this.getFilePath(id);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    const filePath = this.getFilePath(id);
    try {
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async list(): Promise<T[]> {
    const files = await fs.readdir(this.directory);
    const items: T[] = [];
  
    for (const file of files) {
      if (path.extname(file) === '.json') {
        try {
          const content = await fs.readFile(path.join(this.directory, file), 'utf8');
          items.push(JSON.parse(content));
        } catch (error) {
          console.error(`Error reading file ${file}: ${error}`);
        }
      }
    }
  
    return items;
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    const existing = await this.get(id);
    if (!existing) {
      throw new Error(`Item with ID ${id} not found`);
    }
  
    const updated = { ...existing, ...data };
    await this.create(updated);
  }
}
```

## Usage

```typescript
// Define a type
interface User {
  id: string;
  name: string;
  email: string;
}

// Create a storage instance
const userStorage = new FileStore<User>('./data/users');

// Basic CRUD operations
async function example() {
  // Create
  await userStorage.create({ 
    id: 'user1', 
    name: 'John Doe', 
    email: 'john@example.com' 
  });
  
  // Read
  const user = await userStorage.get('user1');
  console.log(user);
  
  // Update
  await userStorage.update('user1', { name: 'John Smith' });
  
  // List all
  const allUsers = await userStorage.list();
  console.log(allUsers);
  
  // Delete
  await userStorage.delete('user1');
}
```

## Benefits

1. **Consistent Interface**: Same API across storage mechanisms
2. **Generic Typing**: Type safety for stored items
3. **Flexibility**: Multiple variants for different usage patterns
4. **Extensibility**: Easy to implement for new storage backends

This pattern allows for consistent data access while keeping implementation details hidden, making it easy to switch storage backends without changing consumer code.
