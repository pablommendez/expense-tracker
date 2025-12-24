/**
 * CreateExpenseHandler - Unit Tests (TDD: RED first)
 */

import { jest } from '@jest/globals';
import { CreateExpenseHandler } from './CreateExpenseHandler.js';
import { ExpenseRepository } from '../../infrastructure/ExpenseRepository.js';
import { ok } from '../../../../shared/result/Result.js';
import { CreateExpenseDto } from '../dtos/CreateExpenseDto.js';

// Mock the repository - using any to avoid complex type inference with jest.fn()
/* eslint-disable @typescript-eslint/no-explicit-any */
const createMockRepository = (): ExpenseRepository => {
  const mockSaveAsync = jest.fn() as any;
  mockSaveAsync.mockResolvedValue(ok(undefined));

  return {
    saveAsync: mockSaveAsync,
    findByIdAsync: jest.fn(),
    findAllAsync: jest.fn(),
    deleteAsync: jest.fn(),
    updateAsync: jest.fn(),
  } as unknown as ExpenseRepository;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('CreateExpenseHandler', () => {
  let handler: CreateExpenseHandler;
  let mockRepository: ExpenseRepository;

  beforeEach(() => {
    mockRepository = createMockRepository();
    handler = new CreateExpenseHandler(mockRepository);
  });

  describe('expenseDate defaulting', () => {
    it('should use provided expenseDate when specified', async () => {
      const dto: CreateExpenseDto = {
        description: 'Test expense',
        amount: 100,
        currency: 'USD',
        category: 'food',
        expenseDate: '2025-12-20T12:00:00Z',
      };

      const result = await handler.executeAsync(dto);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.expenseDate).toBe('2025-12-20T12:00:00.000Z');
      }
    });

    it('should default expenseDate to today when not provided', async () => {
      const beforeTest = new Date();

      // Cast to allow optional expenseDate (after schema change)
      const dto = {
        description: 'Test expense',
        amount: 100,
        currency: 'USD',
        category: 'food',
        // expenseDate intentionally omitted
      } as CreateExpenseDto;

      const result = await handler.executeAsync(dto);

      const afterTest = new Date();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const responseDate = new Date(result.value.expenseDate);
        // Check that the date is between before and after test execution
        expect(responseDate.getTime()).toBeGreaterThanOrEqual(beforeTest.getTime() - 1000);
        expect(responseDate.getTime()).toBeLessThanOrEqual(afterTest.getTime() + 1000);
      }
    });

    it('should default expenseDate to today when undefined', async () => {
      const beforeTest = new Date();

      const dto = {
        description: 'Test expense',
        amount: 100,
        currency: 'USD',
        category: 'food',
        expenseDate: undefined,
      } as CreateExpenseDto;

      const result = await handler.executeAsync(dto);

      const afterTest = new Date();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const responseDate = new Date(result.value.expenseDate);
        expect(responseDate.getTime()).toBeGreaterThanOrEqual(beforeTest.getTime() - 1000);
        expect(responseDate.getTime()).toBeLessThanOrEqual(afterTest.getTime() + 1000);
      }
    });
  });

  describe('expense creation', () => {
    it('should save expense to repository', async () => {
      const dto: CreateExpenseDto = {
        description: 'Test expense',
        amount: 100,
        currency: 'USD',
        category: 'food',
        expenseDate: '2025-12-20T12:00:00Z',
      };

      await handler.executeAsync(dto);

      expect(mockRepository.saveAsync).toHaveBeenCalledTimes(1);
    });

    it('should return expense response DTO on success', async () => {
      const dto: CreateExpenseDto = {
        description: 'Grocery shopping',
        amount: 50.25,
        currency: 'EUR',
        category: 'food',
        expenseDate: '2025-12-20T12:00:00Z',
      };

      const result = await handler.executeAsync(dto);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.description).toBe('Grocery shopping');
        expect(result.value.amount).toBe(50.25);
        expect(result.value.currency).toBe('EUR');
        expect(result.value.category).toBe('food');
        expect(result.value.id).toBeDefined();
      }
    });
  });
});
