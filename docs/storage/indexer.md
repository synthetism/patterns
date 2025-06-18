# Indexer Pattern

The Indexer pattern provides a common interface for indexing and retrieving entities based on identifiers and aliases. It supports fast lookup by keywords and managing index entries.

## Interface Variants

### Synchronous Indexer

```typescript
export interface IIndexer<T> {
  exists(): boolean;
  create(entry: T): void;
  get(idOrAlias: string): T | null;
  find(keyword: string): T | null;
  delete(idOrAlias: string): boolean;
  list(): T[];
  rebuild(entries: T[]): void;
}
```

### Asynchronous Indexer (Promises)

```typescript
export interface IIndexer<T> {
  exists(): Promise<boolean>;
  create(entry: T): Promise<void>;
  get(idOrAlias: string): Promise<T | null>;
  find(keyword: string): Promise<T | null>;
  delete(idOrAlias: string): Promise<boolean>;
  list(): Promise<T[]>;
  rebuild(entries: T[]): Promise<void>;
}
```

### Asynchronous Indexer with Result Pattern

```typescript
export interface IIndexer<T> {
  exists(): Promise<Result<boolean>>;
  create(entry: T): Promise<Result<void>>;
  get(idOrAlias: string): Promise<Result<T | null>>;
  find(keyword: string): Promise<Result<T | null>>;
  delete(idOrAlias: string): Promise<Result<boolean>>;
  list(): Promise<Result<T[]>>;
  rebuild(entries: T[]): Promise<Result<void>>;
}
```

## Core Operations

- **exists**: Check if the index exists
- **create**: Add or update an index entry
- **get**: Retrieve an entry by ID or alias
- **find**: Search for an entry by keyword
- **delete**: Remove an entry by ID or alias
- **list**: Retrieve all indexed entries
- **rebuild**: Recreate the entire index from provided entries

## Implementation Example: FileIndexer

A simple file-based indexer implementation:

```typescript
import fs from 'node:fs/promises';
import path from 'node:path';
import { IIndexer } from '@synet/patterns/storage/promises';

interface IndexEntry {
  id: string;
  alias: string;
  [key: string]: any;
}

type IndexRecord = Record<string, IndexEntry>;

export class FileIndexer implements IIndexer<IndexEntry> {
  private readonly indexPath: string;
  private indexCache: IndexRecord | null = null;

  constructor(private readonly directory: string) {
    this.indexPath = path.join(directory, 'index.json');
    fs.mkdir(directory, { recursive: true }).catch(err => {
      console.error(`Error creating directory: ${err}`);
    });
  }

  async exists(): Promise<boolean> {
    try {
      await fs.access(this.indexPath);
      return true;
    } catch {
      return false;
    }
  }

  async create(entry: IndexEntry): Promise<void> {
    const index = await this.loadIndex();
    index[entry.alias] = entry;
    await this.saveIndex(index);
  }

  async get(idOrAlias: string): Promise<IndexEntry | null> {
    const index = await this.loadIndex();
  
    // First try as alias
    if (index[idOrAlias]) return index[idOrAlias];
  
    // Then try as ID
    for (const alias in index) {
      if (index[alias].id === idOrAlias) {
        return index[alias];
      }
    }
  
    return null;
  }

  async find(keyword: string): Promise<IndexEntry | null> {
    const index = await this.loadIndex();
    return Object.values(index).find(entry => 
      entry.alias === keyword || entry.id === keyword
    ) || null;
  }

  async delete(idOrAlias: string): Promise<boolean> {
    const index = await this.loadIndex();
  
    // Try as alias first
    if (index[idOrAlias]) {
      delete index[idOrAlias];
      await this.saveIndex(index);
      return true;
    }
  
    // Try as ID
    for (const alias in index) {
      if (index[alias].id === idOrAlias) {
        delete index[alias];
        await this.saveIndex(index);
        return true;
      }
    }
  
    return false;
  }

  async list(): Promise<IndexEntry[]> {
    const index = await this.loadIndex();
    return Object.values(index);
  }

  async rebuild(entries: IndexEntry[]): Promise<void> {
    const newIndex: IndexRecord = {};
  
    for (const entry of entries) {
      if (entry.id && entry.alias) {
        newIndex[entry.alias] = entry;
      }
    }
  
    await this.saveIndex(newIndex);
  }

  private async loadIndex(): Promise<IndexRecord> {
    if (this.indexCache) return this.indexCache;
  
    try {
      const exists = await this.exists();
      if (!exists) return {};
  
      const content = await fs.readFile(this.indexPath, 'utf8');
      const parsed = JSON.parse(content);
  
      // Handle format variations
      if (parsed.entries) {
        this.indexCache = parsed.entries;
      } else {
        this.indexCache = parsed;
      }
  
      return this.indexCache;
    } catch (error) {
      console.error(`Error loading index: ${error}`);
      return {};
    }
  }

  private async saveIndex(index: IndexRecord): Promise<void> {
    const withVersion = {
      entries: index,
      version: "1.0.0"
    };
  
    await fs.writeFile(
      this.indexPath,
      JSON.stringify(withVersion, null, 2)
    );
  
    this.indexCache = index;
  }
}
```

## Usage

```typescript
// Define an index entry type
interface UserIndex {
  id: string;
  alias: string;
  email: string;
  role: string;
}

// Create an indexer instance
const userIndexer = new FileIndexer<UserIndex>('./data/indexes');

// Basic operations
async function example() {
  // Add an entry
  await userIndexer.create({
    id: 'user-123',
    alias: 'johndoe',
    email: 'john@example.com',
    role: 'admin'
  });
  
  // Look up by alias
  const byAlias = await userIndexer.get('johndoe');
  console.log(byAlias);
  
  // Look up by ID
  const byId = await userIndexer.get('user-123');
  console.log(byId);
  
  // List all entries
  const allUsers = await userIndexer.list();
  console.log(allUsers);
  
  // Rebuild the index
  await userIndexer.rebuild([
    {
      id: 'user-123',
      alias: 'johndoe',
      email: 'john@example.com',
      role: 'admin'
    },
    {
      id: 'user-456',
      alias: 'janedoe',
      email: 'jane@example.com',
      role: 'user'
    }
  ]);
}
```

## Benefits

1. **Fast Lookups**: Quick access by ID or alias
2. **Bi-directional Mapping**: Find by ID or alias with same API
3. **Customizable Entries**: Generic typing for different index types
4. **Consistent API**: Same interface regardless of storage mechanism
5. **Rebuild Support**: Complete index reconstruction when needed

The Indexer pattern is particularly useful for systems that need to map between different identifiers, such as DIDs and human-readable aliases, or for creating searchable indexes of content stored in various systems.
