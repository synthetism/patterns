/**
 * Propagatable execution context
 */
export interface PropagatedContext<T = Record<string, any>> {
  /** Unique ID for this context chain */
  readonly traceId: string;
  
  /** Current span in the context chain */
  readonly spanId: string;
  
  /** Context data */
  readonly data: Readonly<T>;
  
  /** Create a child context with additional data */
  child(spanName: string, additionalData?: Partial<T>): PropagatedContext<T>;
  
  /** Create a serialized form for cross-boundary propagation */
  serialize(): string;
  
  /** Track an event in this context */
  addEvent(name: string, data?: any): void;
  
  /** Complete this context span */
  end(status?: 'success' | 'error' | 'cancelled'): void;
}

/**
 * Context-aware function wrapper
 */
export function withContext<T, A extends any[], R>(
  fn: (ctx: PropagatedContext<T>, ...args: A) => Promise<R>
): (ctx: PropagatedContext<T>, ...args: A) => Promise<R> {
  return async (ctx: PropagatedContext<T>, ...args: A) => {
    try {
      const result = await fn(ctx, ...args);
      ctx.end('success');
      return result;
    } catch (error) {
      ctx.addEvent('error', { message: error.message });
      ctx.end('error');
      throw error;
    }
  };
}

/**
 * Create a root context
 */
export function createContext<T>(
  name: string, 
  initialData: T
): PropagatedContext<T> {
  return new ContextImpl(
    crypto.randomUUID(),
    crypto.randomUUID().slice(0, 8),
    name,
    initialData
  );
}

/**
 * Parse a serialized context
 */
export function parseContext<T>(serialized: string): PropagatedContext<T> {
  // Implementation
  return {} as PropagatedContext<T>; // Placeholder
}

class ContextImpl<T> implements PropagatedContext<T> {
  readonly traceId: string;
  readonly spanId: string;
  readonly data: Readonly<T>;
  private readonly startTime: number;
  private readonly events: Array<{name: string, timestamp: number, data?: any}> = [];
  private endTime?: number;
  
  constructor(
    traceId: string,
    spanId: string,
    private name: string,
    data: T
  ) {
    this.traceId = traceId;
    this.spanId = spanId;
    this.data = Object.freeze({...data});
    this.startTime = performance.now();
  }
  
  child(spanName: string, additionalData?: Partial<T>): PropagatedContext<T> {
    const mergedData = {
      ...this.data as object,
      ...additionalData as object
    } as T;
    
    const childContext = new ContextImpl<T>(
      this.traceId,
      crypto.randomUUID().slice(0, 8),
      spanName,
      mergedData
    );
    
    return childContext;
  }
  
  serialize(): string {
    return JSON.stringify({
      traceId: this.traceId,
      spanId: this.spanId,
      name: this.name,
      data: this.data
    });
  }
  
  addEvent(name: string, data?: any): void {
    this.events.push({
      name,
      timestamp: performance.now(),
      data
    });
  }
  
  end(status: 'success' | 'error' | 'cancelled' = 'success'): void {
    if (!this.endTime) {
      this.endTime = performance.now();
      this.addEvent('end', { status });
    }
  }
}