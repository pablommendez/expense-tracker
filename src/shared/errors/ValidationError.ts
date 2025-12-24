import { DomainError } from './DomainError.js';

/**
 * Represents a validation failure for a specific field
 */
export class ValidationError extends DomainError {
  public readonly field: string;

  constructor(field: string, message: string) {
    super('VALIDATION_ERROR', `${field}: ${message}`);
    this.field = field;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      field: this.field,
    };
  }
}

/**
 * Aggregates multiple validation errors
 */
export class ValidationErrors {
  constructor(public readonly errors: ValidationError[]) {}

  get isEmpty(): boolean {
    return this.errors.length === 0;
  }

  get count(): number {
    return this.errors.length;
  }

  add(error: ValidationError): void {
    this.errors.push(error);
  }

  toJSON(): Record<string, unknown>[] {
    return this.errors.map((e) => e.toJSON());
  }

  static empty(): ValidationErrors {
    return new ValidationErrors([]);
  }
}
