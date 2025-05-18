import type { Result } from './result';

/**
 * A type-safe mapper for transforming between domain and infrastructure models.
 * 
 * @example
 * class UserMapper implements Mapper<User, UserModel> {
 *   toDomain(raw: UserModel): Result<User> {
 *     const nameOrError = Name.create(raw.firstName, raw.lastName);
 *     const emailOrError = Email.create(raw.email);
 * 
 *     if (nameOrError.isFailure) {
 *       return Result.fail(nameOrError.errorMessage || 'Invalid name');
 *     }
 * 
 *     if (emailOrError.isFailure) {
 *       return Result.fail(emailOrError.errorMessage || 'Invalid email');
 *     }
 * 
 *     return Result.success(User.create({
 *       name: nameOrError.value,
 *       email: emailOrError.value,
 *       id: new UniqueEntityID(raw.id)
 *     }));
 *   }
 * 
 *   toPersistence(domain: User): UserModel {
 *     return {
 *       id: domain.id.toString(),
 *       firstName: domain.name.firstName,
 *       lastName: domain.name.lastName,
 *       email: domain.email.value,
 *     };
 *   }
 * }
 */
export interface Mapper<DomainType, InfrastructureType> {
  /**
   * Maps from infrastructure model to domain entity/value object
   * Returns a Result to handle validation errors
   */
  toDomain(raw: InfrastructureType): Result<DomainType>;
  
  /**
   * Maps from domain entity/value object to infrastructure model
   */
  toPersistence(domain: DomainType): InfrastructureType;
}