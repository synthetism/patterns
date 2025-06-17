import type { Result } from '../../patterns/result';
/**
 * Interface for a generic indexer
*/

export interface IIndexer<T> {
  exists(): Promise<Result<boolean>>;
  create(entry: T): Promise<Result<void>>;
  get(idOrAlias: string): Promise<Result<T | null>>;
  find(keyword: string): Promise<Result<T | null>>;
  delete(idOrAlias: string): Promise<Result<boolean>>;
  list(): Promise<Result<T[]>>;
  rebuild(entries: T[]): Promise<Result<void>>;
}
