import type { AIOperator } from '../ai-operator';
import type {  AIEvent, AIAction, AIInsight, ActionOutcome } from '../ai-operator';
/**
 * Memory entry for the AI operator
 */
export interface MemoryEntry {
  timestamp: Date;
  type: 'event' | 'action' | 'outcome';
  data: (AIEvent | AIAction | { action: AIAction; outcome: ActionOutcome });
}

/**
 * System capabilities that can be provided to an AI operator
 */ 
export type SystemCapabilities<T = { name: string; tool: string }> = Record<string, T>;


/**
 * Base implementation of the AI Operator pattern
 */
export abstract class BaseAIOperator<TEvent extends AIEvent = AIEvent, TState = any, TAction extends AIAction = AIAction> 
  implements AIOperator<TEvent, TState, TAction> {
  
  protected capabilities: SystemCapabilities = {};
  protected memory: MemoryEntry[] = [];
  protected memoryLimit: number | 1000;
  
  /**
   * Initialize the operator with system capabilities
   */
  async initialize<T>(capabilities: SystemCapabilities<T>): Promise<void> {
    this.capabilities = capabilities;
    this.memory = [];
  }
  
  /**
   * Process a system event and potentially recommend action
   */
  abstract analyzeEvent(event: TEvent): Promise<TAction | null>;
  
  /**
   * Analyze the current system state
   */
  abstract analyzeState(state: TState): Promise<{
    insights: AIInsight[];
  }>;
  
  /**
   * Learn from the outcome of a previous action
   */
  async learnFromOutcome(action: TAction, outcome: ActionOutcome): Promise<void> {
    this.recordOutcome(action, outcome);
  }
  
  /**
   * Cleanup resources used by the operator
   */
  async cleanup(): Promise<void> {
    // Default implementation just clears memory
    this.memory = [];
  }
  
  /**
   * Record an event in memory
   */
  protected recordEvent(event: TEvent): void {
    this.memory.push({
      timestamp: event.timestamp || new Date(),
      type: 'event',
      data: event
    });
    
    this.trimMemoryIfNeeded();
  }
  
  /**
   * Record an action in memory
   */
  protected recordAction(action: TAction): void {
    this.memory.push({
      timestamp: new Date(),
      type: 'action',
      data: action
    });
    
    this.trimMemoryIfNeeded();
  }
  
  /**
   * Record an outcome in memory
   */
  protected recordOutcome(action: TAction, outcome: ActionOutcome): void {
    this.memory.push({
      timestamp: new Date(),
      type: 'outcome',
      data: { action, outcome }
    });
    
    this.trimMemoryIfNeeded();
  }
  
  /**
   * Trim memory if it exceeds the limit
   */
  protected trimMemoryIfNeeded(): void {
    if (this.memory.length > this.memoryLimit) {
      this.memory = this.memory.slice(-this.memoryLimit);
    }
  }
  
  /**
   * Get recent memory entries
   */
  protected getRecentMemory(count: number, filter?: (entry: MemoryEntry) => boolean): MemoryEntry[] {
    let entries = this.memory;
    
    if (filter) {
      entries = entries.filter(filter);
    }
    
    return entries.slice(-count);
  }
}