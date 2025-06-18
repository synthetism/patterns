import type { Result } from "../../patterns/result";
/**
 * Asynchronous Storage with Result wrapper
 * @template T - The data type being stored
 * @template R - A result wrapper type that must be constructible with success/failure values
 */
export interface IStorage<T> {
  exists(id: string): Promise<Result<boolean>>;
  create(data: T): Promise<Result<void>>;
  get(id: string): Promise<Result<T>>;
  delete(id: string): Promise<Result<void>>;
  list(): Promise<Result<T[]>>;
  update?(id: string, data: Partial<T>): Promise<Result<T>>;
}
