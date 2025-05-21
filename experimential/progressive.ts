/**
 * A capability that can be progressively disclosed
 */
export interface Progressive<T> {
  /** The basic interface (always available) */
  basic: BasicCapabilities;
  
  /** Request enhanced capabilities (may involve permissions/costs) */
  enhance(): Promise<T>;
  
  /** Check if enhanced capabilities are available */
  canEnhance(): boolean;
  
  /** Return to basic capabilities */
  simplify(): void;
}

/**
 * Implementation example
 */
export class ProgressiveAPI<T extends object> implements Progressive<T> {
  constructor(
    public basic: BasicCapabilities,
    private enhancedFactory: () => Promise<T>,
    private enhancementCheck: () => boolean
  ) {}

  private enhanced: T | null = null;

  async enhance(): Promise<T> {
    if (!this.canEnhance()) {
      throw new Error("Enhanced capabilities not available");
    }
    
    if (!this.enhanced) {
      this.enhanced = await this.enhancedFactory();
    }
    
    return this.enhanced;
  }

  canEnhance(): boolean {
    return this.enhancementCheck();
  }

  simplify(): void {
    this.enhanced = null;
  }
}