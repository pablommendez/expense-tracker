import { Result, ok, err } from '../../../shared/result/Result.js';
import { ValidationError } from '../../../shared/errors/index.js';
import { ExpenseId } from './ExpenseId.js';
import { Money } from './Money.js';

/**
 * Expense category - business classification
 */
export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'utilities'
  | 'healthcare'
  | 'other';

/**
 * Properties required to construct an Expense
 */
export interface ExpenseProps {
  id: ExpenseId;
  description: string;
  amount: Money;
  category: ExpenseCategory;
  expenseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Expense Entity - Domain object with business invariants
 *
 * Invariants enforced:
 * - Description is required and non-empty (max 500 chars)
 * - Amount must be positive (enforced by Money value object)
 * - Expense date cannot be in the future
 * - Category must be one of predefined values
 */
export class Expense {
  private static readonly MAX_DESCRIPTION_LENGTH = 500;

  private constructor(private readonly props: ExpenseProps) {}

  // Getters - read-only access
  get id(): ExpenseId {
    return this.props.id;
  }

  get description(): string {
    return this.props.description;
  }

  get amount(): Money {
    return this.props.amount;
  }

  get category(): ExpenseCategory {
    return this.props.category;
  }

  get expenseDate(): Date {
    return this.props.expenseDate;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Factory method to create a new Expense
   * Returns Result to enforce invariants at construction
   */
  static create(props: ExpenseProps): Result<Expense, ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validate description
    if (!props.description || props.description.trim().length === 0) {
      errors.push(new ValidationError('description', 'Description is required'));
    } else if (props.description.length > Expense.MAX_DESCRIPTION_LENGTH) {
      errors.push(
        new ValidationError(
          'description',
          `Description must be at most ${Expense.MAX_DESCRIPTION_LENGTH} characters`
        )
      );
    }

    // Validate expense date (cannot be in future)
    const now = new Date();
    if (props.expenseDate > now) {
      errors.push(
        new ValidationError('expenseDate', 'Expense date cannot be in the future')
      );
    }

    // Return errors if any validation failed
    if (errors.length > 0) {
      return err(errors);
    }

    return ok(new Expense(props));
  }

  /**
   * Update description
   */
  updateDescription(newDescription: string): Result<Expense, ValidationError> {
    if (!newDescription || newDescription.trim().length === 0) {
      return err(new ValidationError('description', 'Description is required'));
    }

    if (newDescription.length > Expense.MAX_DESCRIPTION_LENGTH) {
      return err(
        new ValidationError(
          'description',
          `Description must be at most ${Expense.MAX_DESCRIPTION_LENGTH} characters`
        )
      );
    }

    return ok(
      new Expense({
        ...this.props,
        description: newDescription.trim(),
        updatedAt: new Date(),
      })
    );
  }

  /**
   * Update category
   */
  updateCategory(newCategory: ExpenseCategory): Result<Expense, ValidationError> {
    return ok(
      new Expense({
        ...this.props,
        category: newCategory,
        updatedAt: new Date(),
      })
    );
  }

  /**
   * Update amount
   */
  updateAmount(newAmount: Money): Result<Expense, ValidationError> {
    return ok(
      new Expense({
        ...this.props,
        amount: newAmount,
        updatedAt: new Date(),
      })
    );
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id.toString(),
      description: this.props.description,
      amount: this.props.amount.amount,
      currency: this.props.amount.currency,
      category: this.props.category,
      expenseDate: this.props.expenseDate.toISOString(),
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
