/**
 * Base event interface for AI Operator pattern
 */
export interface AIEvent {
  type: string;
  timestamp?: Date;
  [key: string]: any;
}

/**
 * Base action interface for AI Operator pattern
 */
export interface AIAction {
  type: string;
  params: Record<string, any>;
  reason?: string;
  confidence: number;
}

/**
 * Insight provided by an AI analysis
 */
export interface AIInsight {
  type: string;
  description: string;
  confidence: number;
  suggestedAction?: AIAction;
}

/**
 * Outcome of an AI action execution
 */
export interface ActionOutcome {
  success: boolean;
  result?: any;
  error?: string;
}

/**
 * System capabilities that can be provided to an AI operator
 */
export type SystemCapabilities<T> = Record<string, T>;

/**
 * Core interface for AI operators that can observe and enhance system behavior
 */
export interface AIOperator<TEvent extends AIEvent = AIEvent, TState = any, TAction extends AIAction = AIAction> {
  /**
   * Initialize the operator with system capabilities
   */
  initialize<T>(capabilities: SystemCapabilities<T>): Promise<void>;
  
  /**
   * Process a system event and potentially recommend action
   */
  analyzeEvent(event: TEvent): Promise<TAction | null>;
  
  /**
   * Analyze the current system state
   */
  analyzeState(state: TState): Promise<{
    insights: AIInsight[];
  }>;
  
  /**
   * Learn from the outcome of a previous action
   */
  learnFromOutcome(action: TAction, outcome: ActionOutcome): Promise<void>;
  
  /**
   * Cleanup resources used by the operator
   */
  cleanup(): Promise<void>;
}

