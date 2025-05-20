import { Signal } from './signal';

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

