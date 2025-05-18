/**
 * Represents a command to be handled by the mediator
 */
export interface IRequest<TResponse = void> {
  type: string;
}

/**
 * Interface for a handler that processes a specific request type
 */
export interface IRequestHandler<TRequest extends IRequest<TResponse>, TResponse> {
  handle(request: TRequest): Promise<TResponse> | TResponse;
}

/**
 * Core mediator implementation
 * Dispatches requests to appropriate handlers
 */
export class Mediator {
  private handlers: Map<string, IRequestHandler<any, any>> = new Map();

  /**
   * Register a handler for a specific request type
   */
  registerHandler<TRequest extends IRequest<TResponse>, TResponse>(
    requestType: string,
    handler: IRequestHandler<TRequest, TResponse>
  ): void {
    if (this.handlers.has(requestType)) {
      throw new Error(`Handler already registered for request type: ${requestType}`);
    }
    this.handlers.set(requestType, handler);
  }

  /**
   * Send a request to be handled by its registered handler
   * @returns Promise resolving to the handler's response
   */
  async send<TResponse>(request: IRequest<TResponse>): Promise<TResponse> {
    const handler = this.handlers.get(request.type);
    
    if (!handler) {
      throw new Error(`No handler registered for request type: ${request.type}`);
    }
    
    return await Promise.resolve(handler.handle(request));
  }
}