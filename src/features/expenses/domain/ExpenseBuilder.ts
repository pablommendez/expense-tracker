import { Result, err } from '../../../shared/result/Result.js';
import { ValidationError } from '../../../shared/errors/index.js';
import { Expense, ExpenseCategory, ExpenseProps } from './Expense.js';
import { ExpenseId } from './ExpenseId.js';
import { Money, Currency } from './Money.js';

/**
 * Builder for creating Expense entities
 *
 * Provides a fluent API for constructing Expenses with validation.
 * The build() method returns Result<Expense> to handle validation failures.
 *
 * @example
 * ```typescript
 * const result = new ExpenseBuilder()
 *   .withDescription('Lunch at restaurant')
 *   .withAmount(25.50, 'USD')
 *   .withCategory('food')
 *   .withExpenseDate(new Date('2025-12-24'))
 *   .build();
 *
 * if (result.isOk()) {
 *   const expense = result.value;
 * }
 * ```
 */
export class ExpenseBuilder {
  private id?: ExpenseId;
  private description?: string;
  private amount?: Money;
  private category: ExpenseCategory = 'other';
  private expenseDate?: Date;
  private createdAt?: Date;
  private updatedAt?: Date;

  /**
   * Set a specific ID (useful for reconstitution from persistence)
   */
  withId(id: ExpenseId): this {
    this.id = id;
    return this;
  }

  /**
   * Set the expense description
   */
  withDescription(description: string): this {
    this.description = description;
    return this;
  }

  /**
   * Set the amount with currency
   */
  withAmount(value: number, currency: Currency): this {
    const moneyResult = Money.create(value, currency);
    if (moneyResult.isOk()) {
      this.amount = moneyResult.value;
    }
    return this;
  }

  /**
   * Set amount directly (for reconstitution)
   */
  withMoney(money: Money): this {
    this.amount = money;
    return this;
  }

  /**
   * Set the expense category
   */
  withCategory(category: ExpenseCategory): this {
    this.category = category;
    return this;
  }

  /**
   * Set when the expense occurred
   */
  withExpenseDate(date: Date): this {
    this.expenseDate = date;
    return this;
  }

  /**
   * Set created timestamp (default: now)
   */
  withCreatedAt(date: Date): this {
    this.createdAt = date;
    return this;
  }

  /**
   * Set updated timestamp (default: now)
   */
  withUpdatedAt(date: Date): this {
    this.updatedAt = date;
    return this;
  }

  /**
   * Build the Expense, returning Result to handle validation errors
   */
  build(): Result<Expense, ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validate required fields at builder level
    if (!this.description) {
      errors.push(new ValidationError('description', 'Description is required'));
    }

    if (!this.amount) {
      errors.push(new ValidationError('amount', 'Amount is required'));
    }

    if (!this.expenseDate) {
      errors.push(new ValidationError('expenseDate', 'Expense date is required'));
    }

    if (errors.length > 0) {
      return err(errors);
    }

    const now = new Date();
    const props: ExpenseProps = {
      id: this.id ?? ExpenseId.create(),
      description: this.description!,
      amount: this.amount!,
      category: this.category,
      expenseDate: this.expenseDate!,
      createdAt: this.createdAt ?? now,
      updatedAt: this.updatedAt ?? now,
    };

    // Delegate to Expense.create for domain-level validation
    return Expense.create(props);
  }
}
