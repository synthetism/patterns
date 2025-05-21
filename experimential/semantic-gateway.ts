/**
 * Bridge between semantic concepts and system operations
 */
export interface SemanticGateway<Intent, Context, Action> {
  /** Interpret an intent within a context */
  interpret(intent: Intent, context: Context): Promise<Action[]>;
  
  /** Execute a specific action */
  execute(action: Action): Promise<void>;
  
  /** Explain an action in semantic terms */
  explain(action: Action): string;
  
  /** Suggest possible intents based on context */
  suggest(context: Context): Intent[];
}

/**
 * Intent handler for natural language to system actions
 */
export class NLPGateway<C, A> implements SemanticGateway<string, C, A> {
  constructor(
    private interpreter: (text: string, context: C) => Promise<A[]>,
    private executor: (action: A) => Promise<void>,
    private explainer: (action: A) => string,
    private suggester: (context: C) => string[]
  ) {}

  async interpret(intent: string, context: C): Promise<A[]> {
    return this.interpreter(intent, context);
  }

  async execute(action: A): Promise<void> {
    return this.executor(action);
  }

  explain(action: A): string {
    return this.explainer(action);
  }

  suggest(context: C): string[] {
    return this.suggester(context);
  }
}