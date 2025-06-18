import fs from "node:fs/promises";
import path from "node:path";
import type { IIndexer } from "@synet/patterns/storage/promises";

interface IndexEntry {
  id: string;
  alias: string;
}

type IndexRecord = Record<string, IndexEntry>;

export class FileIndexer implements IIndexer<IndexEntry> {
  private readonly indexPath: string;
  private indexCache: IndexRecord | null = null;

  constructor(private readonly directory: string) {
    this.indexPath = path.join(directory, "index.json");
    fs.mkdir(directory, { recursive: true }).catch((err) => {
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
    return (
      Object.values(index).find(
        (entry) => entry.alias === keyword || entry.id === keyword,
      ) || null
    );
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

      const content = await fs.readFile(this.indexPath, "utf8");
      const parsed = JSON.parse(content);

      // Handle format variations
      if (parsed.entries) {
        this.indexCache = parsed.entries;
      } else {
        this.indexCache = parsed;
      }

      return this.indexCache || {};
    } catch (error) {
      console.error(`Error loading index: ${error}`);
      return {};
    }
  }

  private async saveIndex(index: IndexRecord): Promise<void> {
    const withVersion = {
      entries: index,
      version: "1.0.0",
    };

    await fs.writeFile(this.indexPath, JSON.stringify(withVersion, null, 2));

    this.indexCache = index;
  }
}
