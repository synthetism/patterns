import { describe, it, expect, vi } from 'vitest';
import { EventEmitter, EventObserver } from '../src/patterns/event-emitter';
import type { Event } from '../src/patterns';

interface TestPayload { 
    username?: string;
    id?: number   
    message?: string;
}   

interface TestEvent extends Event {
  type: string;
  payload: TestPayload;
}


describe('EventEmitter Pattern', () => {
  it('should notify observers of specific events', () => {
    // Create an event emitter


    const emitter = new EventEmitter<TestEvent>();
    
    // Create mock observers
    const loginObserver = { update: vi.fn() };
    const logoutObserver = { update: vi.fn() };
    
    // Subscribe observers to different event types
    emitter.subscribe('login', loginObserver);
    emitter.subscribe('logout', logoutObserver);
    
    // Emit a login event
    const loginEvent: TestEvent = {
      type: 'login',
      payload: { username: 'john' }
    };
    emitter.emit(loginEvent);
    
    // Verify only login observer was notified
    expect(loginObserver.update).toHaveBeenCalledWith(loginEvent);
    expect(logoutObserver.update).not.toHaveBeenCalled();
    
    // Emit a logout event
    const logoutEvent: TestEvent = {
      type: 'logout',
      payload: { username: 'john' }
    };
    emitter.emit(logoutEvent);
    
    // Verify logout observer was notified
    expect(logoutObserver.update).toHaveBeenCalledWith(logoutEvent);
  });
  
  it('should not notify unsubscribed observers', () => {
    const emitter = new EventEmitter<TestEvent>();
    const observer = { update: vi.fn() };
    
    // Subscribe observer
    emitter.subscribe('message', observer);
    
    // Emit an event to verify subscription works
    emitter.emit({ type: 'message', payload: { username: 'jim' }});
    expect(observer.update).toHaveBeenCalledTimes(1);
    
    // Unsubscribe observer
    emitter.unsubscribe('message', observer);
    
    // Emit another event
    emitter.emit({ type: 'message', payload: { username: 'jack' } });
    
    // Verify observer was not called again
    expect(observer.update).toHaveBeenCalledTimes(1);
  });
  
  it('should allow observers to subscribe to multiple event types', () => {
    const emitter = new EventEmitter<TestEvent>();
    const observer = { update: vi.fn() };
    
    // Subscribe to multiple event types
    emitter.subscribe('create', observer);
    emitter.subscribe('update', observer);
    emitter.subscribe('delete', observer);
    
    // Emit events of different types
    emitter.emit({ type: 'create', payload: { id: 1 } });
    emitter.emit({ type: 'update', payload: { id: 1 } });
    emitter.emit({ type: 'delete', payload: { id: 1 } });
    
    // Observer should be notified for each event
    expect(observer.update).toHaveBeenCalledTimes(3);
  });
  
  it('should allow multiple observers for the same event type', () => {
    const emitter = new EventEmitter<TestEvent>();
    const observer1 = { update: vi.fn() };
    const observer2 = { update: vi.fn() };
    const observer3 = { update: vi.fn() };
    
    // Subscribe multiple observers to same event type
    emitter.subscribe('notification', observer1);
    emitter.subscribe('notification', observer2);
    emitter.subscribe('notification', observer3);
    
    // Emit an event
    const event = { type: 'notification', payload: {message:'Hello!'} };
    emitter.emit(event);
    
    // All observers should be notified
    expect(observer1.update).toHaveBeenCalledWith(event);
    expect(observer2.update).toHaveBeenCalledWith(event);
    expect(observer3.update).toHaveBeenCalledWith(event);
  });
  
  it('should correctly implement hasObservers method', () => {
    const emitter = new EventEmitter<TestEvent>();
    const observer = { update: vi.fn() };
    
    // Initially, no observers
    expect(emitter.hasObservers('test')).toBe(false);
    
    // Add an observer
    emitter.subscribe('test', observer);
    expect(emitter.hasObservers('test')).toBe(true);
    
    // Remove observer
    emitter.unsubscribe('test', observer);
    expect(emitter.hasObservers('test')).toBe(false);
  });
});