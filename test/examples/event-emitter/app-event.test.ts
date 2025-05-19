import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from '../../../src/patterns/event-emitter';
import type { AppEvent } from './app-event';
import { AuthenticationService, NotificationService, AuditLogger } from './app-event';


describe('App Event Example', () => {
  let eventBus: EventEmitter<AppEvent>;
  let authService: AuthenticationService;
  let notificationService: NotificationService;
  let auditLogger: AuditLogger;
  
  beforeEach(() => {
    // Setup the event system
    eventBus = new EventEmitter<AppEvent>();
    authService = new AuthenticationService(eventBus);
    notificationService = new NotificationService();
    auditLogger = new AuditLogger();
    
    // Subscribe services to events
    eventBus.subscribe('user.login', notificationService);
    eventBus.subscribe('user.logout', notificationService);
    eventBus.subscribe('error', notificationService);
    
    // Audit logger logs everything
    eventBus.subscribe('user.login', auditLogger);
    eventBus.subscribe('user.logout', auditLogger);
    eventBus.subscribe('error', auditLogger);
    eventBus.subscribe('notification', auditLogger);
  });
  
  it('should notify services when user logs in successfully', () => {
    // Perform login
    const result = authService.login('john', 'password');
    
    // Verify login was successful
    expect(result).toBe(true);
    expect(authService.getCurrentUser()).toBe('john');
    
    // Verify notification service received event
    expect(notificationService.getNotifications()).toContain('User john logged in');
    
    // Verify audit logger received event
    expect(auditLogger.getLogs().length).toBe(1);
    expect(auditLogger.getLogs()[0]).toContain('user.login');
    expect(auditLogger.getLogs()[0]).toContain('john');
  });
  
  it('should notify services when login fails', () => {
    // Attempt login with wrong password
    const result = authService.login('john', 'wrong-password');
    
    // Verify login failed
    expect(result).toBe(false);
    expect(authService.getCurrentUser()).toBeNull();
    
    // Verify notification service received error event
    expect(notificationService.getNotifications()).toContain('ERROR: Authentication failed');
    
    // Verify audit logger received error event
    expect(auditLogger.getLogs().length).toBe(1);
    expect(auditLogger.getLogs()[0]).toContain('error');
  });
  
  it('should notify services when user logs out', () => {
    // Setup: login first
    authService.login('john', 'password');
    
    // Clear notifications and logs for clarity
    notificationService.getNotifications();
    auditLogger.getLogs();
    
    // Perform logout
    authService.logout();
    
    // Verify user is logged out
    expect(authService.getCurrentUser()).toBeNull();
    
    // Verify notification service received event
    expect(notificationService.getNotifications()).toContain('User john logged out');
    
  
    const events =  auditLogger.getLogs();


    // Verify audit logger received event
    expect(auditLogger.getLogs().length).toBe(2);
    expect(auditLogger.getLogs()[1]).toContain('user.logout');
  });
  
  it('should not emit logout event when no user is logged in', () => {
    // Attempt to logout when no one is logged in
    authService.logout();
    
    // Verify no notifications or logs were created
    expect(notificationService.getNotifications().length).toBe(0);
    expect(auditLogger.getLogs().length).toBe(0);
  });
  
  it('should allow services to unsubscribe from events', () => {
    // Unsubscribe notification service from login events
    eventBus.unsubscribe('user.login', notificationService);
    
    // Perform login
    authService.login('john', 'password');
    
    // Verify notification service did not receive login event
    expect(notificationService.getNotifications().length).toBe(0);
    
    // But audit logger still received it
    expect(auditLogger.getLogs().length).toBe(1);
  });
  
  it('should support custom notifications', () => {
    // Emit a custom notification directly
    eventBus.emit({
      type: 'notification',
      payload: { message: 'System maintenance in 5 minutes' }
    });

    // Audit logger should have received it (since it subscribes to all events)
    expect(auditLogger.getLogs().length).toBe(1);    
    expect(auditLogger.getLogs()[0]).toContain('notification');
  });
});