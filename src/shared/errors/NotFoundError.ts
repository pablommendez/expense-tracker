import { DomainError } from './DomainError.js';

/**
 * Represents a resource not found error
 */
export class NotFoundError extends DomainError {
  public readonly resourceType: string;
  public readonly resourceId: string;

  constructor(resourceType: string, resourceId: string) {
    super('NOT_FOUND', `${resourceType} with id '${resourceId}' not found`);
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      resourceType: this.resourceType,
      resourceId: this.resourceId,
    };
  }
}
