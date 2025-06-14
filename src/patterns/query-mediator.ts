/**
 * Base query interface that all queries must implement
 * @see /docs/query-mediator.md
 */
export interface Query<TResult = unknown> {
  readonly queryId: string;
  readonly cacheKey?: string;
  readonly cacheTtl?: number;
  readonly projection?: string[];
  readonly timeout?: number;
}

/**
 * Interface for a handler that processes a specific query type
 */
export interface QueryHandler<TQuery extends Query<TResult>, TResult> {
  handle(query: TQuery): Promise<TResult>;
}

export interface QueryResult<T> {
  data: T;
  metadata: {
    cached: boolean;
    executionTime: number;
    cacheKey?: string;
    projectedFields?: string[];
    source: 'cache' | 'database' | 'api';
  };
}

export interface QueryCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  invalidate(pattern: string): Promise<void>;
  clear(): Promise<void>;
}

export interface QueryMiddleware {
  execute<TResult>(
    query: Query<TResult>,
    next: () => Promise<TResult>
  ): Promise<TResult>;
}
