/**
 * Expense Entity - Unit Tests (TDD: RED first)
 */

import { Expense, ExpenseCategory } from './Expense.js';
import { ExpenseId } from './ExpenseId.js';
import { Money } from './Money.js';

describe('Expense', () => {
  const validProps = () => {
    const idResult = ExpenseId.fromString('550e8400-e29b-41d4-a716-446655440000');
    const moneyResult = Money.create(100, 'USD');

    if (idResult.isErr() || moneyResult.isErr()) {
      throw new Error('Failed to create test props');
    }

    return {
      id: idResult.value,
      description: 'Lunch at restaurant',
      amount: moneyResult.value,
      category: 'food' as ExpenseCategory,
      expenseDate: new Date('2025-12-20T12:00:00Z'),
      createdAt: new Date('2025-12-20T12:00:00Z'),
      updatedAt: new Date('2025-12-20T12:00:00Z'),
    };
  };

  describe('create', () => {
    it('should create a valid expense with all required fields', () => {
      const props = validProps();

      const result = Expense.create(props);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.id.equals(props.id)).toBe(true);
        expect(result.value.description).toBe(props.description);
        expect(result.value.amount.equals(props.amount)).toBe(true);
        expect(result.value.category).toBe(props.category);
        expect(result.value.expenseDate).toEqual(props.expenseDate);
      }
    });

    it('should return error for empty description', () => {
      const props = validProps();
      props.description = '';

      const result = Expense.create(props);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const descError = result.error.find((e) => e.field === 'description');
        expect(descError).toBeDefined();
        expect(descError?.message).toContain('required');
      }
    });

    it('should return error for whitespace-only description', () => {
      const props = validProps();
      props.description = '   ';

      const result = Expense.create(props);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const descError = result.error.find((e) => e.field === 'description');
        expect(descError).toBeDefined();
      }
    });

    it('should return error for description exceeding 500 characters', () => {
      const props = validProps();
      props.description = 'a'.repeat(501);

      const result = Expense.create(props);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const descError = result.error.find((e) => e.field === 'description');
        expect(descError).toBeDefined();
        expect(descError?.message).toContain('500');
      }
    });

    it('should accept description with exactly 500 characters', () => {
      const props = validProps();
      props.description = 'a'.repeat(500);

      const result = Expense.create(props);

      expect(result.isOk()).toBe(true);
    });

    it('should return error for future expense date', () => {
      const props = validProps();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      props.expenseDate = tomorrow;

      const result = Expense.create(props);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const dateError = result.error.find((e) => e.field === 'expenseDate');
        expect(dateError).toBeDefined();
        expect(dateError?.message).toContain('future');
      }
    });

    it('should accept expense date in the past', () => {
      const props = validProps();
      props.expenseDate = new Date('2020-01-01T00:00:00Z');

      const result = Expense.create(props);

      expect(result.isOk()).toBe(true);
    });

    it('should accept expense date today', () => {
      const props = validProps();
      props.expenseDate = new Date();

      const result = Expense.create(props);

      expect(result.isOk()).toBe(true);
    });

    it('should collect all validation errors', () => {
      const props = validProps();
      props.description = '';
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      props.expenseDate = tomorrow;

      const result = Expense.create(props);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('updateDescription', () => {
    it('should update description with valid value', () => {
      const props = validProps();
      const expenseResult = Expense.create(props);

      expect(expenseResult.isOk()).toBe(true);
      if (expenseResult.isOk()) {
        const updateResult = expenseResult.value.updateDescription('New description');

        expect(updateResult.isOk()).toBe(true);
        if (updateResult.isOk()) {
          expect(updateResult.value.description).toBe('New description');
        }
      }
    });

    it('should return error for empty description', () => {
      const props = validProps();
      const expenseResult = Expense.create(props);

      expect(expenseResult.isOk()).toBe(true);
      if (expenseResult.isOk()) {
        const updateResult = expenseResult.value.updateDescription('');

        expect(updateResult.isErr()).toBe(true);
      }
    });

    it('should update updatedAt timestamp', () => {
      const props = validProps();
      const expenseResult = Expense.create(props);

      expect(expenseResult.isOk()).toBe(true);
      if (expenseResult.isOk()) {
        const originalUpdatedAt = expenseResult.value.updatedAt;
        const updateResult = expenseResult.value.updateDescription('New description');

        expect(updateResult.isOk()).toBe(true);
        if (updateResult.isOk()) {
          expect(updateResult.value.updatedAt.getTime()).toBeGreaterThanOrEqual(
            originalUpdatedAt.getTime()
          );
        }
      }
    });

    it('should preserve createdAt timestamp', () => {
      const props = validProps();
      const expenseResult = Expense.create(props);

      expect(expenseResult.isOk()).toBe(true);
      if (expenseResult.isOk()) {
        const originalCreatedAt = expenseResult.value.createdAt;
        const updateResult = expenseResult.value.updateDescription('New description');

        expect(updateResult.isOk()).toBe(true);
        if (updateResult.isOk()) {
          expect(updateResult.value.createdAt).toEqual(originalCreatedAt);
        }
      }
    });
  });

  describe('updateCategory', () => {
    it('should update category with valid value', () => {
      const props = validProps();
      const expenseResult = Expense.create(props);

      expect(expenseResult.isOk()).toBe(true);
      if (expenseResult.isOk()) {
        const updateResult = expenseResult.value.updateCategory('transport');

        expect(updateResult.isOk()).toBe(true);
        if (updateResult.isOk()) {
          expect(updateResult.value.category).toBe('transport');
        }
      }
    });
  });

  describe('toJSON', () => {
    it('should serialize expense to JSON', () => {
      const props = validProps();
      const expenseResult = Expense.create(props);

      expect(expenseResult.isOk()).toBe(true);
      if (expenseResult.isOk()) {
        const json = expenseResult.value.toJSON();

        expect(json.id).toBe(props.id.toString());
        expect(json.description).toBe(props.description);
        expect(json.amount).toBe(props.amount.amount);
        expect(json.currency).toBe(props.amount.currency);
        expect(json.category).toBe(props.category);
        expect(json.expenseDate).toBe(props.expenseDate.toISOString());
      }
    });
  });
});
