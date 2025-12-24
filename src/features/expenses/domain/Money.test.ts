/**
 * Money Value Object - Unit Tests (TDD: RED first)
 */

import { Money, Currency } from './Money.js';

describe('Money', () => {
  describe('create', () => {
    it('should create Money with positive amount and valid currency', () => {
      const result = Money.create(100.5, 'USD');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.amount).toBe(100.5);
        expect(result.value.currency).toBe('USD');
      }
    });

    it('should round to 2 decimal places', () => {
      const result = Money.create(100.555, 'USD');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.amount).toBe(100.56);
      }
    });

    it('should handle small amounts correctly', () => {
      const result = Money.create(0.01, 'USD');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.amount).toBe(0.01);
      }
    });

    it('should return error for zero amount', () => {
      const result = Money.create(0, 'USD');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.field).toBe('amount');
        expect(result.error.message).toContain('positive');
      }
    });

    it('should return error for negative amount', () => {
      const result = Money.create(-50, 'USD');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.field).toBe('amount');
        expect(result.error.message).toContain('positive');
      }
    });

    it('should handle large amounts', () => {
      const result = Money.create(999999999.99, 'USD');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.amount).toBe(999999999.99);
      }
    });
  });

  describe('add', () => {
    it('should add two Money objects with same currency', () => {
      const money1Result = Money.create(100, 'USD');
      const money2Result = Money.create(50.5, 'USD');

      expect(money1Result.isOk() && money2Result.isOk()).toBe(true);
      if (money1Result.isOk() && money2Result.isOk()) {
        const sumResult = money1Result.value.add(money2Result.value);

        expect(sumResult.isOk()).toBe(true);
        if (sumResult.isOk()) {
          expect(sumResult.value.amount).toBe(150.5);
          expect(sumResult.value.currency).toBe('USD');
        }
      }
    });

    it('should return error when adding different currencies', () => {
      const usdResult = Money.create(100, 'USD');
      const eurResult = Money.create(50, 'EUR');

      expect(usdResult.isOk() && eurResult.isOk()).toBe(true);
      if (usdResult.isOk() && eurResult.isOk()) {
        const sumResult = usdResult.value.add(eurResult.value);

        expect(sumResult.isErr()).toBe(true);
        if (sumResult.isErr()) {
          expect(sumResult.error.field).toBe('currency');
          expect(sumResult.error.message).toContain('different currencies');
        }
      }
    });
  });

  describe('equals', () => {
    it('should return true for same amount and currency', () => {
      const money1Result = Money.create(100, 'USD');
      const money2Result = Money.create(100, 'USD');

      expect(money1Result.isOk() && money2Result.isOk()).toBe(true);
      if (money1Result.isOk() && money2Result.isOk()) {
        expect(money1Result.value.equals(money2Result.value)).toBe(true);
      }
    });

    it('should return false for different amounts', () => {
      const money1Result = Money.create(100, 'USD');
      const money2Result = Money.create(50, 'USD');

      expect(money1Result.isOk() && money2Result.isOk()).toBe(true);
      if (money1Result.isOk() && money2Result.isOk()) {
        expect(money1Result.value.equals(money2Result.value)).toBe(false);
      }
    });

    it('should return false for different currencies', () => {
      const money1Result = Money.create(100, 'USD');
      const money2Result = Money.create(100, 'EUR');

      expect(money1Result.isOk() && money2Result.isOk()).toBe(true);
      if (money1Result.isOk() && money2Result.isOk()) {
        expect(money1Result.value.equals(money2Result.value)).toBe(false);
      }
    });
  });

  describe('toString', () => {
    it('should format money as string with currency', () => {
      const result = Money.create(100.5, 'USD');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.toString()).toBe('100.50 USD');
      }
    });

    it('should format with 2 decimal places', () => {
      const result = Money.create(100, 'USD');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.toString()).toBe('100.00 USD');
      }
    });
  });
});
