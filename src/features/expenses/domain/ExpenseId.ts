import { randomUUID } from 'crypto';
import { Result, ok, err } from '../../../shared/result/Result.js';
import { ValidationError } from '../../../shared/errors/index.js';

/**
 * Value Object representing an Expense identifier
 * Encapsulates UUID validation and generation
 */
export class ExpenseId {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  private constructor(private readonly value: string) {}

  /**
   * Creates a new ExpenseId with a random UUID
   */
  static create(): ExpenseId {
    return new ExpenseId(randomUUID());
  }

  /**
   * Creates an ExpenseId from an existing string value
   * Returns Result to handle invalid UUIDs
   */
  static fromString(value: string): Result<ExpenseId, ValidationError> {
    if (!value || value.trim() === '') {
      return err(new ValidationError('id', 'Expense ID cannot be empty'));
    }

    if (!ExpenseId.UUID_REGEX.test(value)) {
      return err(new ValidationError('id', 'Expense ID must be a valid UUID'));
    }

    return ok(new ExpenseId(value));
  }

  toString(): string {
    return this.value;
  }

  equals(other: ExpenseId): boolean {
    return this.value === other.value;
  }
}
