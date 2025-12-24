/**
 * ExpenseBuilder - Unit Tests (TDD: RED first)
 */

import { ExpenseBuilder } from './ExpenseBuilder.js';
import { ExpenseId } from './ExpenseId.js';
import { Money } from './Money.js';

describe('ExpenseBuilder', () => {
  describe('build', () => {
    it('should build a valid expense with all required fields', () => {
      const result = new ExpenseBuilder()
        .withDescription('Lunch at restaurant')
        .withAmount(25.5, 'USD')
        .withCategory('food')
        .withExpenseDate(new Date('2025-12-20T12:00:00Z'))
        .build();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.description).toBe('Lunch at restaurant');
        expect(result.value.amount.amount).toBe(25.5);
        expect(result.value.category).toBe('food');
      }
    });

    it('should generate ID if not provided', () => {
      const result = new ExpenseBuilder()
        .withDescription('Test expense')
        .withAmount(100, 'USD')
        .withCategory('other')
        .withExpenseDate(new Date('2025-12-20T12:00:00Z'))
        .build();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.id).toBeDefined();
        expect(result.value.id.toString()).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        );
      }
    });

    it('should use provided ID when specified', () => {
      const idResult = ExpenseId.fromString('550e8400-e29b-41d4-a716-446655440000');
      expect(idResult.isOk()).toBe(true);

      if (idResult.isOk()) {
        const result = new ExpenseBuilder()
          .withId(idResult.value)
          .withDescription('Test expense')
          .withAmount(100, 'USD')
          .withCategory('other')
          .withExpenseDate(new Date('2025-12-20T12:00:00Z'))
          .build();

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value.id.toString()).toBe('550e8400-e29b-41d4-a716-446655440000');
        }
      }
    });

    it('should return error for missing description', () => {
      const result = new ExpenseBuilder()
        .withAmount(100, 'USD')
        .withCategory('other')
        .withExpenseDate(new Date('2025-12-20T12:00:00Z'))
        .build();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const descError = result.error.find((e) => e.field === 'description');
        expect(descError).toBeDefined();
      }
    });

    it('should return error for missing amount', () => {
      const result = new ExpenseBuilder()
        .withDescription('Test expense')
        .withCategory('other')
        .withExpenseDate(new Date('2025-12-20T12:00:00Z'))
        .build();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const amountError = result.error.find((e) => e.field === 'amount');
        expect(amountError).toBeDefined();
      }
    });

    it('should return error for missing expense date', () => {
      const result = new ExpenseBuilder()
        .withDescription('Test expense')
        .withAmount(100, 'USD')
        .withCategory('other')
        .build();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const dateError = result.error.find((e) => e.field === 'expenseDate');
        expect(dateError).toBeDefined();
      }
    });

    it('should collect all missing field errors', () => {
      const result = new ExpenseBuilder().build();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.length).toBeGreaterThanOrEqual(3);
        expect(result.error.some((e) => e.field === 'description')).toBe(true);
        expect(result.error.some((e) => e.field === 'amount')).toBe(true);
        expect(result.error.some((e) => e.field === 'expenseDate')).toBe(true);
      }
    });

    it('should use default category if not specified', () => {
      const result = new ExpenseBuilder()
        .withDescription('Test expense')
        .withAmount(100, 'USD')
        .withExpenseDate(new Date('2025-12-20T12:00:00Z'))
        .build();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.category).toBe('other');
      }
    });

    it('should set createdAt and updatedAt to now if not provided', () => {
      const before = new Date();

      const result = new ExpenseBuilder()
        .withDescription('Test expense')
        .withAmount(100, 'USD')
        .withCategory('food')
        .withExpenseDate(new Date('2025-12-20T12:00:00Z'))
        .build();

      const after = new Date();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(result.value.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
        expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(result.value.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
      }
    });

    it('should use provided timestamps when specified', () => {
      const createdAt = new Date('2025-01-01T00:00:00Z');
      const updatedAt = new Date('2025-06-01T00:00:00Z');

      const result = new ExpenseBuilder()
        .withDescription('Test expense')
        .withAmount(100, 'USD')
        .withCategory('food')
        .withExpenseDate(new Date('2025-12-20T12:00:00Z'))
        .withCreatedAt(createdAt)
        .withUpdatedAt(updatedAt)
        .build();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.createdAt).toEqual(createdAt);
        expect(result.value.updatedAt).toEqual(updatedAt);
      }
    });
  });

  describe('fluent API', () => {
    it('should support method chaining', () => {
      const builder = new ExpenseBuilder();

      const result = builder
        .withDescription('Chained expense')
        .withAmount(50, 'USD')
        .withCategory('transport')
        .withExpenseDate(new Date('2025-12-20T12:00:00Z'));

      expect(result).toBe(builder);
    });
  });

  describe('withMoney', () => {
    it('should accept Money value object directly', () => {
      const moneyResult = Money.create(75.25, 'EUR');
      expect(moneyResult.isOk()).toBe(true);

      if (moneyResult.isOk()) {
        const result = new ExpenseBuilder()
          .withDescription('Euro expense')
          .withMoney(moneyResult.value)
          .withCategory('entertainment')
          .withExpenseDate(new Date('2025-12-20T12:00:00Z'))
          .build();

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value.amount.amount).toBe(75.25);
          expect(result.value.amount.currency).toBe('EUR');
        }
      }
    });
  });
});
