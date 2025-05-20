// Integration with Result pattern for backward compatibility
import { Signal } from "../patterns/signal";
import type {TraceEntry} from "../patterns/signal";
import type {Result} from "../patterns/result";
import type { Mediator } from "../patterns/mediator";

type SignalMiddleware<T> = (signal: Signal<T>) => Signal<T>;

extend(Signal.prototype, {
  // Apply middleware to signal
  use(middleware: SignalMiddleware<any>): Signal<any> {
    return middleware(this);
  },
  
  // Apply a series of middleware functions
  useAll(middlewares: SignalMiddleware<any>[]): Signal<any> {
    return middlewares.reduce((sig, middleware) => middleware(sig), this);
  }
});

extend(Signal, {
  // Recreate a signal from trace entries
  fromTrace<T>(entries: TraceEntry[], finalValue?: T): Signal<T> {
    let error: Error | undefined;
    
    // Find the last error in the trace
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].error) {
        error = entries[i].error;
        break;
      }
    }
    
    return new Signal<T>(error ? undefined : finalValue, error, entries);
  },
  
  // Replay a specific step from trace
  replayFrom<T>(signal: Signal<T>, stepLabel: string): Signal<T> {
    const entries = signal.traceEntries;
    const stepIndex = entries.findIndex(e => e.layer === stepLabel);
    
    if (stepIndex === -1) {
      return Signal.failure(`Step "${stepLabel}" not found in trace`);
    }
    
    // Recreate signal up to that step
    return Signal.fromTrace<T>(entries.slice(0, stepIndex));
  }
});

extend(Signal, {
  fromResult<T>(result: Result<T>, label?: string): Signal<T> {
    if (result.isSuccess) {
      return Signal.success(result.value, label);
    } else {
      return Signal.failure(result.error, label);
    }
  }
});

// Integration with Mediator pattern
extend(Signal.prototype, {
  async send<TRequest, TResponse>(
    mediator: Mediator, 
    requestFactory: (value: any) => TRequest
  ): Promise<Signal<TResponse>> {
    if (this.isFailure) {
      return new Signal<TResponse>(undefined, this.error, this.traceEntries);
    }
    
    try {
      const request = requestFactory(this.value);
      const response = await mediator.send<TRequest, TResponse>(request);
      
      return new Signal<TResponse>(
        response,
        undefined,
        [...this.traceEntries, {
          layer: 'mediator.send',
          timestamp: Date.now(),
          context: { request: typeof request }
        }]
      );
    } catch (error) {
      return new Signal<TResponse>(
        undefined,
        error instanceof Error ? error : new Error(String(error)),
        [...this.traceEntries, {
          layer: 'mediator.send',
          timestamp: Date.now(),
          error: error instanceof Error ? error : new Error(String(error))
        }]
      );
    }
  }
});