/*
  Interface for a generic storage system
*/
export interface IStorage<T> {
  exists(): boolean;
  create(data: T): void;
  get(id: string): T | null;
  delete(id: string): boolean;
  list(): T[];
  update?(id: string, data: Partial<T>): void;
}
