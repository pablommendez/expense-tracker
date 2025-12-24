/**
 * CreateExpenseDto - Unit Tests (TDD: RED first)
 */

import { CreateExpenseDtoSchema } from './CreateExpenseDto.js';

describe('CreateExpenseDtoSchema', () => {
  const validExpenseWithDate = {
    description: 'Test expense',
    amount: 100,
    currency: 'USD',
    category: 'food',
    expenseDate: '2025-12-20T12:00:00Z',
  };

  describe('expenseDate field', () => {
    it('should accept request with valid expenseDate', () => {
      const result = CreateExpenseDtoSchema.safeParse(validExpenseWithDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.expenseDate).toBe('2025-12-20T12:00:00Z');
      }
    });

    it('should accept request without expenseDate', () => {
      const expenseWithoutDate = {
        description: 'Test expense',
        amount: 100,
        currency: 'USD',
        category: 'food',
        // expenseDate intentionally omitted
      };

      const result = CreateExpenseDtoSchema.safeParse(expenseWithoutDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.expenseDate).toBeUndefined();
      }
    });

    it('should reject invalid expenseDate format', () => {
      const expenseWithInvalidDate = {
        ...validExpenseWithDate,
        expenseDate: 'not-a-valid-date',
      };

      const result = CreateExpenseDtoSchema.safeParse(expenseWithInvalidDate);

      expect(result.success).toBe(false);
      if (!result.success) {
        const dateError = result.error.errors.find((e) => e.path.includes('expenseDate'));
        expect(dateError).toBeDefined();
      }
    });
  });

  describe('required fields validation', () => {
    it('should reject missing description', () => {
      const { description: _description, ...withoutDescription } = validExpenseWithDate;

      const result = CreateExpenseDtoSchema.safeParse(withoutDescription);

      expect(result.success).toBe(false);
    });

    it('should reject missing amount', () => {
      const { amount: _amount, ...withoutAmount } = validExpenseWithDate;

      const result = CreateExpenseDtoSchema.safeParse(withoutAmount);

      expect(result.success).toBe(false);
    });

    it('should reject missing currency', () => {
      const { currency: _currency, ...withoutCurrency } = validExpenseWithDate;

      const result = CreateExpenseDtoSchema.safeParse(withoutCurrency);

      expect(result.success).toBe(false);
    });

    it('should reject missing category', () => {
      const { category: _category, ...withoutCategory } = validExpenseWithDate;

      const result = CreateExpenseDtoSchema.safeParse(withoutCategory);

      expect(result.success).toBe(false);
    });
  });
});
