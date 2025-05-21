import type { AIOperator } from '../ai-operator';
import type {  AIEvent, AIAction, AIInsight } from '../ai-operator';
import { LangGraphAIOperator } from './ai-operator-langgraph';
import type { StateGraph } from '@langchain/langgraph';

/**
 * Options for creating an AI operator
 */
export interface AIOperatorOptions {
  /**
   * Type of operator to create
   */
  type: 'langgraph' | 'openai' | 'custom';
  
  /**
   * API key for the LLM provider
   */
  apiKey?: string;
  
  /**
   * Model name to use
   */
  modelName?: string;
  
  /**
   * Custom graph for LangGraph-based operators
   */
  graph?: any;
  
  /**
   * Memory limit for the operator
   */
  memoryLimit?: number;
  
  /**
   * Logger instance
   */
  logger?: any;
}

/**
 * Create an AI operator using the specified options
 */
export async function createAIOperator<TEvent extends AIEvent = AIEvent, TState = any, TAction extends AIAction = AIAction>(
  options: AIOperatorOptions
): Promise<AIOperator<TEvent, TState, TAction>> {
  switch (options.type) {
    case 'langgraph':
      if (!options.graph) {
        throw new Error('LangGraph workflow is required for langgraph operator type');
      }
      return new GenericLangGraphOperator<TEvent, TState, TAction>(options.graph, options);
      
    case 'openai':
      // Dynamically import OpenAI to avoid hard dependency
      try {
        const { createOpenAIOperator } = await import('./ai-operator-openai');
        return createOpenAIOperator<TEvent, TState, TAction>(options);
      } catch (error) {
        throw new Error('Failed to create OpenAI operator. Make sure @langchain/openai is installed.');
      }
      
    case 'custom':
      throw new Error('Custom operator type requires manual implementation');
      
    default:
      throw new Error(`Unknown operator type: ${(options as any).type}`);
  }
}

/**
 * Generic LangGraph operator implementation
 */
class GenericLangGraphOperator<TEvent extends AIEvent = AIEvent, TState = any, TAction extends AIAction = AIAction> 
  extends LangGraphAIOperator<TEvent, TState, TAction> {
  
  private options: AIOperatorOptions;
  
  constructor(graph: any, options: AIOperatorOptions) {
    super(graph);
    this.options = options;
    
    if (options.memoryLimit) {
      this.memoryLimit = options.memoryLimit;
    }
  }
}