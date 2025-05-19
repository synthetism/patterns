/**
 * Represents a request to be handled by the mediator
 *
 * Docymentation:
 * @see /docs/mediator.md for detailed documentation and examples
 *
 * Examples:
 * @see /examples/mediator.ts for usage examples
 */
export interface IRequest<TResponse = void> {
	type: string;
}

/**
 * Interface for a handler that processes a specific request type
 */
export interface IRequestHandler<
	TRequest extends IRequest<TResponse>,
	TResponse,
> {
	handle(request: TRequest): Promise<TResponse> | TResponse;
}

/**
 * Core mediator implementation
 * Dispatches requests to appropriate handlers
 */
export class Mediator {
	// Using a more type-safe approach with a type map
	private handlers = new Map<
		string,
		IRequestHandler<IRequest<unknown>, unknown>
	>();

	/**
	 * Register a handler for a specific request type
	 */
	registerHandler<TRequest extends IRequest<TResponse>, TResponse>(
		requestType: string,
		handler: IRequestHandler<TRequest, TResponse>,
	): void {
		if (this.handlers.has(requestType)) {
			throw new Error(
				`Handler already registered for request type: ${requestType}`,
			);
		}

		// Type assertion here is necessary but safe since we control both sides
		this.handlers.set(
			requestType,
			handler as IRequestHandler<IRequest<unknown>, unknown>,
		);
	}

	/**
	 * Send a request to be handled by its registered handler
	 * @returns Promise resolving to the handler's response
	 */
	async send<TRequest extends IRequest<TResponse>, TResponse>(
		request: TRequest,
	): Promise<TResponse> {
		const handler = this.handlers.get(request.type);

		if (!handler) {
			throw new Error(
				`No handler registered for request type: ${request.type}`,
			);
		}

		// Cast is safe because we maintain the type association when registering
		const typedHandler = handler as IRequestHandler<TRequest, TResponse>;

		return await Promise.resolve(typedHandler.handle(request));
	}
}
