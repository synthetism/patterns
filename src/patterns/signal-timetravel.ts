import { Signal } from './signal';


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