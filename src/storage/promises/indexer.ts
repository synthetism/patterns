/**
 * Interface for a generic indexer
*/

export interface IIndexer<T> {
  exists(): Promise<boolean>;
  create(entry: T): Promise<void>;
  get(idOrAlias: string): Promise<T | null>;
  find(keyword: string): Promise<T | null>;
  delete(idOrAlias: string): Promise<boolean>;
  list(): Promise<T[]>;
  rebuild(entries: T[]): Promise<void>;
}
