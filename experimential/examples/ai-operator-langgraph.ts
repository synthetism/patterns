import { BaseAIOperator } from './ai-operator-base';
import type {  AIEvent, AIAction, AIInsight, ActionOutcome } from '../ai-operator';
import type { RunnableInterface } from '@langchain/core/runnables';

/**
 * State for the LangGraph workflow
 */
export interface LangGraphWorkflowState<TEvent extends AIEvent = AIEvent, TState = any, TAction extends AIAction = AIAction> {
  event?: TEvent;
  systemState?: TState;
  insights?: AIInsight[];
  action?: TAction | null;
  history: Array<{
    timestamp: Date;
    type: 'event' | 'action' | 'outcome';
    data: any;
  }>;
  needsHumanInput?: boolean;
}

/**
 * LangGraph-based implementation of the AI Operator pattern
 */
export abstract class LangGraphAIOperator<TEvent extends AIEvent = AIEvent, TState = any, TAction extends AIAction = AIAction> 
  extends BaseAIOperator<TEvent, TState, TAction> {
  
  protected graph: RunnableInterface;
  
  /**
   * Constructor that takes a compiled LangGraph workflow
   */
  constructor(graph: RunnableInterface) {
    super();
    this.graph = graph;
  }
  
  /**
   * Analyze an event using the LangGraph workflow
   */
  async analyzeEvent(event: TEvent): Promise<TAction | null> {
    this.recordEvent(event);
    
    try {
      const result = await this.graph.invoke({
        event,
        history: this.getRecentMemory(20),
        needsHumanInput: false
      } as LangGraphWorkflowState<TEvent, TState, TAction>);
      
      const typedResult = result as LangGraphWorkflowState<TEvent, TState, TAction>;
      
      if (typedResult.action) {
        this.recordAction(typedResult.action);
      }
      
      return typedResult.action || null;
    } catch (error) {
      console.error("Error analyzing event:", error);
      return null;
    }
  }
  
  /**
   * Analyze system state using the LangGraph workflow
   */
  async analyzeState(state: TState): Promise<{
    insights: AIInsight[];
  }> {
    try {
      const result = await this.graph.invoke({
        systemState: state,
        history: this.getRecentMemory(50),
        needsHumanInput: false
      } as LangGraphWorkflowState<TEvent, TState, TAction>);
      
      const typedResult = result as LangGraphWorkflowState<TEvent, TState, TAction>;
      
      return { 
        insights: typedResult.insights || [] 
      };
    } catch (error) {
      console.error("Error analyzing system state:", error);
      return { insights: [] };
    }
  }
}