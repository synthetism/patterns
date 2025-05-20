
import { Signal } from './signal';
import { EventEmitter } from './event-emitter';
import type {EventObserver} from './event-emitter';

interface FractalEvent {
    type: string;
    payload: {
        step: string;
        isSuccess: boolean;
        timestamp: number;
    };
}
// Create a global event emitter
const fractalEvents = new EventEmitter<FractalEvent>();

// Enhanced Signal with observer integration
class ObservableSignal<T> extends Signal<T> {
  // Override map to emit events
  map<U>(fn: (value: T) => U, label?: string): ObservableSignal<U> {
    const result = super.map(fn, label);
    
    // Emit event for this step
    fractalEvents.emit({
      type: 'fractal:step',
      payload: {
        step: label || 'map',
        isSuccess: result.isSuccess,
        timestamp: Date.now()
      }
    });
    
    return new ObservableSignal<U>(
      result.value,
      result.error,
      result.trace
    );
  }
  
  // Similar overrides for other methods
  // ...
  
  // Subscribe to specific steps in the chain
  static subscribeToStep(step: string, observer: EventObserver<FractalEvent>): void {
    fractalEvents.subscribe('fractal:step', {
      update: (event: FractalEvent) => {
        if (event.payload.step === step) {
          observer.update(event);
        }
      }
    });
  }
}