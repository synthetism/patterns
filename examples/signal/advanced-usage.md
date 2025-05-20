# Advanced usage

```typescript
async getConfig(): Promise<Signal<GatewayConfig | null>> {
  try {
    // Mark the beginning of this transaction
    let signal = Signal.transaction('GetConfig')
      .reflect('Starting config retrieval', { layer: 'UseCase' });
      
    // Get config from repository
    signal = await signal.measureTime(
      async () => this.gatewayFileRepository.getConfig(),
      'Repository.getConfig'
    );
    
    // Record the decision path taken
    if (signal.isSuccess && signal.value) {
      return signal
        .branch('ConfigExists', 'config !== null')
        .reflect("Usecase checked, config exists", { 
          layer: "Usecase", 
          method: "getConfig" 
        })
        .insight('configStatus', 'valid')
        .endTransaction('GetConfig');
    } 
    
    return signal
      .branch('ConfigMissing', 'config === null')
      .fail(
        new VError("Gateway not initialized"),
        "GatewayUseCases.getConfig"
      )
      .insight('configStatus', 'missing')
      .endTransaction('GetConfig', 'rolledBack');

  } catch (error) {
    this.logger?.error("[⊚] Error checking gateway initialization:", error);
    return Signal.fail(
      error instanceof Error ? error : new VError(String(error)),
      "GatewayUseCases.getConfig"
    )
    .reflect('Exception occurred during config retrieval')
    .insight('errorType', error instanceof VError ? 'VError' : typeof error);
  }
}
```