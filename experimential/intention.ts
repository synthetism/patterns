/**
 * Explicit intention declaration
 */
export interface Intention<T> {
  /** The value being operated on */
  readonly value: T;
  
  /** The intent description */
  readonly intent: string;
  
  /** Human-readable explanation */
  readonly explanation: string;
  
  /** Expected constraints/invariants */
  readonly constraints: Constraint<T>[];
  
  /** Alternative approaches considered */
  readonly alternatives: string[];
  
  /** Apply a transformation while preserving intentions */
  map<R>(transform: (value: T) => R, newIntent?: string): Intention<R>;
  
  /** Verify all constraints are satisfied */
  verify(): boolean;
  
  /** Generate documentation from this intention */
  document(): string;
}

/**
 * A constraint on a value
 */
export interface Constraint<T> {
  description: string;
  check: (value: T) => boolean;
}

/**
 * Create an explicitly intentioned value
 */
export function withIntention<T>(
  value: T,
  intent: string,
  options: {
    explanation?: string,
    constraints?: Array<Constraint<T>>,
    alternatives?: string[]
  } = {}
): Intention<T> {
  return new IntentionImpl(
    value,
    intent,
    options.explanation || "",
    options.constraints || [],
    options.alternatives || []
  );
}

class IntentionImpl<T> implements Intention<T> {
  constructor(
    readonly value: T,
    readonly intent: string,
    readonly explanation: string,
    readonly constraints: Constraint<T>[],
    readonly alternatives: string[]
  ) {}
  
  map<R>(transform: (value: T) => R, newIntent?: string): Intention<R> {
    return new IntentionImpl(
      transform(this.value),
      newIntent || `${this.intent} → transformed`,
      this.explanation,
      [], // Constraints don't transfer across transformations
      this.alternatives
    );
  }
  
  verify(): boolean {
    return this.constraints.every(c => c.check(this.value));
  }
  
  document(): string {
    return [
      `## ${this.intent}`,
      "",
      this.explanation,
      "",
      "### Constraints",
      ...this.constraints.map(c => `- ${c.description}`),
      "",
      "### Alternatives Considered",
      ...this.alternatives.map(a => `- ${a}`)
    ].join("\n");
  }
}