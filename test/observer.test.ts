import { describe, it, expect, vi } from 'vitest';
import { Subject, Observer } from '../src/patterns/observer';

describe('Observer Pattern', () => {
  it('should notify all observers when data changes', () => {
    // Create a subject
    const subject = new Subject<string>();
    
    // Create mock observers
    const observer1 = { update: vi.fn() };
    const observer2 = { update: vi.fn() };
    
    // Subscribe observers
    subject.subscribe(observer1);
    subject.subscribe(observer2);
    
    // Notify observers
    subject.notify('Data has changed');
    
    // Verify observers were notified
    expect(observer1.update).toHaveBeenCalledWith('Data has changed');
    expect(observer2.update).toHaveBeenCalledWith('Data has changed');
  });
  
  it('should not notify unsubscribed observers', () => {
    // Create a subject
    const subject = new Subject<string>();
    
    // Create mock observers
    const observer1 = { update: vi.fn() };
    const observer2 = { update: vi.fn() };
    
    // Subscribe observers
    subject.subscribe(observer1);
    subject.subscribe(observer2);
    
    // Unsubscribe observer2
    subject.unsubscribe(observer2);
    
    // Notify observers
    subject.notify('Data has changed');
    
    // Verify only observer1 was notified
    expect(observer1.update).toHaveBeenCalledWith('Data has changed');
    expect(observer2.update).not.toHaveBeenCalled();
  });
  
  it('should not add the same observer multiple times', () => {
    // Create a subject
    const subject = new Subject<string>();
    
    // Create a mock observer
    const observer = { update: vi.fn() };
    
    // Subscribe observer multiple times
    subject.subscribe(observer);
    subject.subscribe(observer);
    subject.subscribe(observer);
    
    // Notify observers
    subject.notify('Data has changed');
    
    // Verify observer was only notified once
    expect(observer.update).toHaveBeenCalledTimes(1);
  });
});