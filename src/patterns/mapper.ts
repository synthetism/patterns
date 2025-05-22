import type { Result } from "./result.js";

/**
 * Mapper pattern for transforming between domain and infrastructure models.
 *
 * This pattern helps maintain separation between domain objects with rich business logic
 * and infrastructure models optimized for storage or transmission.
 *
 * @see /docs/mapper.md for detailed documentation and examples
 *
 * @template DomainType - The domain entity, value object, or aggregate root type
 * @template InfrastructureType - The infrastructure model type (DB model, DTO, etc.)
 */
export interface Mapper<DomainType, InfrastructureType> {
	/**
	 * Maps from infrastructure to domain with validation
	 * @returns Result containing either domain object or validation failure
	 */
	toDomain(raw: InfrastructureType): Result<DomainType>;

	/**
	 * Maps from domain entity/value object to infrastructure model
	 */
	toPersistence(domain: DomainType): InfrastructureType;

	/**
	 * Direct mapping from infrastructure to domain without Result wrapper
	 * Use when mapping is guaranteed to succeed or errors are handled differently
	 * @optional
	 */

	toEntity?(raw: InfrastructureType): DomainType;
}
