/**
 * Test Data Builder for Expense entities
 * Provides convenient defaults for testing
 */

import {
  Expense,
  ExpenseBuilder,
  ExpenseCategory,
  Currency,
} from '../../src/features/expenses/domain/index.js';

export class ExpenseTestBuilder {
  private description = 'Test expense';
  private amount = 100;
  private currency: Currency = 'USD';
  private category: ExpenseCategory = 'other';
  private expenseDate = new Date('2025-12-20T12:00:00Z');

  withDescription(description: string): this {
    this.description = description;
    return this;
  }

  withAmount(amount: number): this {
    this.amount = amount;
    return this;
  }

  withCurrency(currency: Currency): this {
    this.currency = currency;
    return this;
  }

  withCategory(category: ExpenseCategory): this {
    this.category = category;
    return this;
  }

  withExpenseDate(date: Date): this {
    this.expenseDate = date;
    return this;
  }

  /**
   * Convenience method for food expenses
   */
  asFood(): this {
    this.category = 'food';
    this.description = 'Food expense';
    return this;
  }

  /**
   * Convenience method for transport expenses
   */
  asTransport(): this {
    this.category = 'transport';
    this.description = 'Transport expense';
    return this;
  }

  /**
   * Build the expense (throws if invalid - for test convenience)
   */
  build(): Expense {
    const result = new ExpenseBuilder()
      .withDescription(this.description)
      .withAmount(this.amount, this.currency)
      .withCategory(this.category)
      .withExpenseDate(this.expenseDate)
      .build();

    if (result.isErr()) {
      throw new Error(`Failed to build test expense: ${JSON.stringify(result.error)}`);
    }

    return result.value;
  }

  /**
   * Build as Result (for testing validation)
   */
  buildResult() {
    return new ExpenseBuilder()
      .withDescription(this.description)
      .withAmount(this.amount, this.currency)
      .withCategory(this.category)
      .withExpenseDate(this.expenseDate)
      .build();
  }
}

/**
 * Factory function for fluent test data creation
 */
export function anExpense(): ExpenseTestBuilder {
  return new ExpenseTestBuilder();
}
