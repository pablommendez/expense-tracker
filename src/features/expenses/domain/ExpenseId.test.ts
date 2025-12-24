/**
 * ExpenseId Value Object - Unit Tests (TDD: RED first)
 */

import { ExpenseId } from './ExpenseId.js';

describe('ExpenseId', () => {
  describe('create', () => {
    it('should create a new ExpenseId with a valid UUID', () => {
      const id = ExpenseId.create();

      expect(id).toBeInstanceOf(ExpenseId);
      expect(id.toString()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('should create unique IDs on each call', () => {
      const id1 = ExpenseId.create();
      const id2 = ExpenseId.create();

      expect(id1.toString()).not.toBe(id2.toString());
    });
  });

  describe('fromString', () => {
    it('should create ExpenseId from valid UUID string', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      const result = ExpenseId.fromString(validUuid);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.toString()).toBe(validUuid);
      }
    });

    it('should return error for empty string', () => {
      const result = ExpenseId.fromString('');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.field).toBe('id');
        expect(result.error.message).toContain('cannot be empty');
      }
    });

    it('should return error for whitespace-only string', () => {
      const result = ExpenseId.fromString('   ');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.field).toBe('id');
      }
    });

    it('should return error for invalid UUID format', () => {
      const result = ExpenseId.fromString('not-a-valid-uuid');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.field).toBe('id');
        expect(result.error.message).toContain('valid UUID');
      }
    });

    it('should return error for partial UUID', () => {
      const result = ExpenseId.fromString('550e8400-e29b-41d4');

      expect(result.isErr()).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true for same UUID value', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id1 = ExpenseId.fromString(uuid);
      const id2 = ExpenseId.fromString(uuid);

      expect(id1.isOk() && id2.isOk()).toBe(true);
      if (id1.isOk() && id2.isOk()) {
        expect(id1.value.equals(id2.value)).toBe(true);
      }
    });

    it('should return false for different UUID values', () => {
      const id1 = ExpenseId.create();
      const id2 = ExpenseId.create();

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the UUID string value', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const result = ExpenseId.fromString(uuid);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.toString()).toBe(uuid);
      }
    });
  });
});
