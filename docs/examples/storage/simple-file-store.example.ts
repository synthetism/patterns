import path from "node:path";
import fs from "node:fs/promises";
export interface ISimpleFileStore extends IStorage<ItemType> {
  /**
   * File-based Verifiable Credential store implementation
   * @param dir Directory to store VC files
   * @param fs File system interface for file operations
   */
  exists(id: string): Promise<boolean>;
  create(id: string, item: ItemType): Promise<void>;
  get(id: string): Promise<ItemType | null>;
  delete(id: string): Promise<boolean>;
  list(): Promise<ItemType[]>;
}

export class FileVCStore implements ISimpleFileStore {
  constructor(
    private readonly dir: string,
  ) {}

  private resolvePath(id: string): string {
    return path.join(this.dir, `${id}.json`);
  }

  async exists(id: string): Promise<boolean> {
    const filePath = this.resolvePath(id);
     try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async create(id: string, item: ItemType): Promise<void> {
    const filePath = this.resolvePath(id);
    await fs.writeFile(filePath, JSON.stringify(item, null, 2), 'utf-8');
  }

  async get(id: string): Promise<ItemType | null> {
    const filePath = this.resolvePath(id);
   
    try {
      await fs.access(filePath);

    } catch {
      return null;
    }

    const raw = await fs.readFile(filePath);
    return JSON.parse(raw.toString());
  }

  async delete(id: string): Promise<boolean> {
    const filePath = this.resolvePath(id);
    try {
      await fs.access(filePath);

    } catch {
      return null;
    }
    await fs.unlink(filePath);
    return true;
  }

  async list(): Promise<ItemType[]> {
    const files = await fs.readdir(this.dir);
    const items: ItemType[] = [];
    for (const file of files) {
      const content = await fs.readFile(path.join(this.dir, file));
      items.push(JSON.parse(content.toString()));
    }
    return items;
  }
}
