import { Result, ok, err } from '../../../shared/result/Result.js';
import { ValidationError } from '../../../shared/errors/index.js';

/**
 * Supported currencies (ISO 4217)
 */
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

/**
 * Value Object representing monetary amount with currency
 *
 * Invariants:
 * - Amount must be positive
 * - Amount stored with 2 decimal precision
 * - Currency is required
 */
export class Money {
  private static readonly DECIMAL_PLACES = 2;

  private constructor(
    private readonly _amount: number,
    private readonly _currency: Currency
  ) {}

  get amount(): number {
    return this._amount;
  }

  get currency(): Currency {
    return this._currency;
  }

  /**
   * Create a Money value object
   */
  static create(amount: number, currency: Currency): Result<Money, ValidationError> {
    if (amount <= 0) {
      return err(new ValidationError('amount', 'Amount must be positive'));
    }

    // Round to 2 decimal places to avoid floating point issues
    const roundedAmount =
      Math.round(amount * Math.pow(10, Money.DECIMAL_PLACES)) /
      Math.pow(10, Money.DECIMAL_PLACES);

    return ok(new Money(roundedAmount, currency));
  }

  /**
   * Add two money objects (must be same currency)
   */
  add(other: Money): Result<Money, ValidationError> {
    if (this._currency !== other._currency) {
      return err(
        new ValidationError('currency', 'Cannot add money with different currencies')
      );
    }

    return Money.create(this._amount + other._amount, this._currency);
  }

  /**
   * Check if two Money objects are equal
   */
  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  toString(): string {
    return `${this._amount.toFixed(Money.DECIMAL_PLACES)} ${this._currency}`;
  }
}
