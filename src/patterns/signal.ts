/**
 * Represents a trace entry in the Signal's journey
 */
import crypto from 'node:crypto';
type SignalStatus = 'success' | 'error' | 'pending';


export interface Reflection {
  /** Method name that triggered this reflection */
  method?: string;
  /** Class name that triggered this reflection */
  class?: string;
  /** Message describing the reflection */
  message?: string;

  /** Contextual data related to this reflection */
  context?: Record<string, unknown>;
  /** Timestamp when this reflection was created */
  timestamp: number;
}


export interface TraceEntry {
  /** Layer or function name */
  layer: string;
  /** Timestamp when this entry was created */
  timestamp: number;
  /** Optional reflections about this layer */
  status?: SignalStatus;

  reflections?: Array<Reflection>;
  /** Error that occurred at this step, if any */
  error?: Error;
}

/**
 * Signal is a self-aware data container that tracks its journey through layers
 */
export class Signal<T> {
  private readonly _value?: T;
  private readonly _error?: Error;
  private readonly _trace: TraceEntry[] = [];
  private readonly _metadata: Record<string, unknown> = {};
  private readonly _id: string;
  private static extensions: Record<string, (...args: any[]) => any> = {};
  
  constructor(
    value?: T, 
    error?: Error,
    trace: TraceEntry[] = [],
    metadata: Record<string, unknown> = {}

  ) {
    this._value = value;
    this._error = error;
    this._trace = [...trace];
    this._metadata = metadata;
    this._id = typeof metadata.id === 'string' ? metadata.id : crypto.randomUUID();
    
   
  }
  
  
  // Core properties and methods
  get isSuccess(): boolean { return this._error === undefined; }
  get isFailure(): boolean { return !this.isSuccess; }
  get value(): T | undefined { return this._value; }
  get error(): Error | undefined { return this._error; }
  get traceEntries(): ReadonlyArray<TraceEntry> { return [...this._trace]; }
  
  static open<U>(layer?: string): Signal<U> {
      return new Signal<U>(
      undefined, // Cast to U to support both same type and explicit transformations
      undefined,
      [{
        layer: layer || 'Signal Open',
        timestamp: Date.now(),
        status: undefined
      }]
  );
  }

  // Static methods
  static success<U>(value: U, layer?: string): Signal<U> {
    return new Signal<U>(value, undefined, [], { layer });
  }
  
  static failure<U>(error: Error | string, layer?: string): Signal<U> {
    const err = typeof error === 'string' ? new Error(error) : error;
    return new Signal<U>(undefined, err, [], { layer });
  }
  
  // Alias for backward compatibility
  static fail<U>(error: Error | string, layer?: string): Signal<U> {
    return Signal.failure(error, layer);
  }

  	/**
	 * Executes the given callback if this is a success result
	 * @param fn Function to execute with the success value
	 * @returns This result, for method chaining
	 */
	public onSuccess(fn: (value: T) => void): Signal<T> {
		if (this.isSuccess && this._value) {
			fn(this._value);
		}
		return this;
	}

    /**
     * Executes the given callback if this is a failure result
     * @param fn Function to execute with the error details
     * @returns This result, for method chaining
     */
    public onFailure(
      fn: ( cause?: Error) => void,
    ): Signal<T> {
      if (this.isFailure && this._error) {
        fn(this._error);
      }
      return this;
    }
    
  /**
   * Create a new signal with a potentially different value type while preserving the trace history
   * @param original The original signal whose trace will be copied
   * @param transformer Optional function to transform the value
   */
  static extend<T, U = T>(
    original: Signal<T>, 
    transformer?: (value: T | undefined) => U
  ): Signal<U> {
    const value = transformer 
      ? transformer(original._value)
      : original._value as unknown as U;
      
    return new Signal<U>(
      value,
      original._error,
      [...original._trace]
    );
}


  
/**
 * Add a reflection to the most recent layer
 */
reflect(message: string, caller?: any, context?: Record<string, unknown>): Signal<T> {
  const methodData = caller ? this._getMethodName(caller) : undefined;
  
  
  // Add reflection to the last trace entry
  const lastEntry = this._trace[this._trace.length - 1];
  const reflections = lastEntry.reflections || [];
  
  // Create a new trace array with the updated last entry
  const newTrace = [...this._trace.slice(0, -1), {
    ...lastEntry,
    reflections: [...reflections, {
      method: methodData?.methodName,
      class: methodData?.className,
      message,
      context,
      timestamp: Date.now()
    }]
  }];
  
  console.debug("New Trace", this._trace);
  
  return new Signal<T>(this._value, this._error, newTrace);
}
 

  /**
   * Add a new layer to the trace
   */
 layer<U = T>(name: string, context?: Record<string, unknown>): Signal<U> {
  return new Signal<U>(
    this._value as unknown as U, // Cast to U to support both same type and explicit transformations
    this._error,
    [...this._trace, {
      layer: name,
      timestamp: Date.now(),
      reflections: context ? [{
        message: 'Layer created',
        context,
        timestamp: Date.now()
      }] : undefined
    }]
  );
}
  
  /**
   * Transform this signal into a failure signal
   */
  fail(error: Error | string, layer?: string): Signal<never> {
    const err = typeof error === 'string' ? new Error(error) : error;
    
    return new Signal<never>(
      undefined,
      err,
      [...this._trace, {
        layer: layer || 'failure',
        timestamp: Date.now(),
        error: err,
        reflections: [{
          message: 'Signal converted to failure',
          timestamp: Date.now()
        }]
      }]
    );
  }

success<U = T>(value: U): Signal<U> {
  if (this._trace.length === 0) {
    // Create a default trace entry if none exists
    return new Signal<U>(value, undefined, [{
      layer: 'default',
      timestamp: Date.now(),
      status: 'success',
      reflections: []
    }]);
  }
  
  // Preserve the entire trace array
  const newTrace = this._trace.map((entry, index) => {
    // Only update the status of the last trace entry
    if (index === this._trace.length - 1) {
      return {
        ...entry,
        status: 'success' as const
      };
    }
    return entry;
  });
  
  return new Signal<U>(value, undefined, newTrace);
}
  
  // Alias for consistency
  failure(error: Error | string, layer?: string): Signal<never> {
    return this.fail(error, layer);
  }
  
  /**
   * Map the value if successful
   */
  map<U>(fn: (value: T) => U, layer?: string): Signal<U> {
    if (this.isFailure) {
      return new Signal<U>(undefined, this._error, this._trace);
    }
    
    try {
      const result = fn(this._value as T);
      return new Signal<U>(
        result,
        undefined,
        [...this._trace, {
          layer: layer || 'map',
          timestamp: Date.now(),
          reflections: [{
            message: 'Value transformed',
            timestamp: Date.now()
          }]
        }]
      );
    } catch (error) {
      return new Signal<U>(
        undefined,
        error instanceof Error ? error : new Error(String(error)),
        [...this._trace, {
          layer: layer || 'map',
          timestamp: Date.now(),
          error: error instanceof Error ? error : new Error(String(error))
        }]
      );
    }
  }
  
  /**
   * Apply a function that returns a Signal, flattening the result
   * Preserves the parent-child relationship for tracing
   */
  flatMap<U>(fn: (value: T) => Signal<U>, componentName?: string): Signal<U> {
    if (this.isFailure || this._value === undefined) {
      // If this signal is a failure, propagate the failure
      return new Signal<U>(
        undefined,
        this._error,
        [...this._trace]
      );
    }
    
    try {
      // Apply the function which returns a new signal
      const nextSignal = fn(this._value);
      
      // Create a new trace array with all previous entries plus a layer for this operation
      const newTrace = [
        ...this._trace,
        {
          layer: componentName || 'flatMap',
          timestamp: Date.now(),
          status: nextSignal.isSuccess ? 'success' as const : 'error' as const,
          error: nextSignal._error,
          reflections: [{
            message: `Applied operation ${componentName || 'flatMap'}`,
            timestamp: Date.now()
          }]
        }
      ];
      
      // Return a new signal with the next value and combined trace
      return new Signal<U>(
        nextSignal._value,
        nextSignal._error,
        newTrace
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      return new Signal<U>(
        undefined,
        err,
        [...this._trace, {
          layer: componentName || 'flatMap',
          timestamp: Date.now(),
          status: 'error' as const,
          error: err,
          reflections: [{
            message: `Operation failed: ${err.message}`,
            timestamp: Date.now()
          }]
        }]
      );
    }
}

  /**
   * Format trace for logging
   */
  trace(): string {
    let result = '';
    
    for (const entry of this._trace) {
      const time = new Date(entry.timestamp).toISOString();
      const status = entry.error ? 'ERROR' : 'OK';
      
      result += `[${time}] ${entry.layer} (${status})\n`;
      
      if (entry.error) {
        result += `  Error: ${entry.error.message}\n`;
      }
      
      if (entry.reflections && entry.reflections.length > 0) {
        for (const ref of entry.reflections) {
          const refTime = new Date(ref.timestamp).toISOString();
          const method = ref.method ? `${ref.method}: ` : '';
          result += `  [${refTime}] ${method}${ref.message || ''}\n`;
          
          if (ref.context) {
            result += `    Context: ${JSON.stringify(ref.context)}\n`;
          }
        }
      }
    }
    
    return result;
  }

traceData(): Array<{
  layer: string;
  timestamp: string;
  status: 'success' | 'error';
  error?: string;
  reflections?: Array<{
    message: string;
    method?: string;
    class?: string;
    timestamp: string;
    context?: Record<string, unknown>
  }>;
}> {

  // Return all trace entries, not just the first one
  return this._trace.map(entry => ({
    layer: entry.layer,
    timestamp: new Date(entry.timestamp).toISOString(),
    status: entry.error ? 'error' : 'success',
    error: entry.error?.message,
    reflections: entry.reflections?.filter(r => r.message !== undefined)
      .map(r => ({
        message: r.message || '',
        method: r.method,
        class: r.class,
        timestamp: new Date(r.timestamp).toISOString(),
        context: r.context as Record<string, unknown> | undefined
      }))
  }));
}
  
  // Helper methods
 /**
 * Helper method to extract the calling method name from the stack trace
 */
private _getMethodName(obj: any): {methodName?:string, className?:string} | undefined {
  if (!obj) return undefined;
  
  // Try to find the calling method name from stack trace
  try {
    const stack = new Error().stack || '';
  
    if(!stack) return undefined;


    const matches = /at \w+\.(\w+)/.exec(stack.split('\n')[3]);

     if (matches) {
      const methodName = matches[1];  // This will be undefined for standalone functions
      const className = matches[0].split(' ')[1].split('.')[0] 
      
      return { className, methodName };
    }

     if (obj.constructor?.name) {
      return {methodName:`${obj.constructor.name}`};
    }
  } catch (error) {
    // Silently fail - method name detection is non-critical
    console.debug('Error detecting method name:', error);
  }
  
  // Last resort: just use the object's constructor name
  return obj.constructor ? {methodName:obj.constructor.name} : {methodName:"unknown"};

  }


  public ensure(condition: (value: T) => boolean, message: string): Signal<T> {
    if (!this.isSuccess || this._value === undefined) {
      return this;
    }
    return condition(this._value) ? this : Signal.fail(message);
  }

   // Add metadata setter/getter
  withMeta(key: string, value: unknown): Signal<T> {
    const newMetadata = { ...this._metadata, [key]: value };
    return new Signal<T>(this._value, this._error, this._trace, newMetadata);
  }
  
  // Get metadata
  meta(key: string): unknown {
    return this._metadata[key];
  }

  resolve(): T {
    if (this.isFailure) {
      throw this._error;
    }
    return this._value as T;
  }

  static plugin<T>(name: string, fn: (...args: any[]) => any): void {
    Signal.extensions[name] = fn;
  }

  // Access extensions through "with" namespace
  get with(): Record<string, (...args: any[]) => any> {
    const signal = this;
    return new Proxy({}, {
      get(_target, prop: string) {
        if (typeof prop === 'string' && Signal.extensions[prop]) {
          return (...args: any[]) => Signal.extensions[prop](signal, ...args);
        }
        throw new Error(`Extension "${String(prop)}" is not registered`);
      }
    });
  }

  /**
  * Create a static helper for tracing the call chain through layers
  */
  static chain<U>(value: U, initialLayer: string): Signal<U> {
    return Signal.success(value, initialLayer);
  }

   /**
     * Record when execution flow takes a specific branch
     */
    branch(branchName: string, condition: string): Signal<T> {
      return new Signal<T>(
        this._value,
        this._error,
        [...this._trace, {
          layer: 'branch',
          timestamp: Date.now(),
          status: this.isSuccess ? 'success' : 'error',
          reflections: [{
            message: `Branch condition: ${condition}`,
            timestamp: Date.now()
          }]
        }]
      );
  }
    
}