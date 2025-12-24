/**
 * ExpenseRepository - Integration Tests (TDD with Testcontainers)
 */

import { PrismaClient } from '@prisma/client';
import {
  setupTestDatabase,
  cleanupTestDatabase,
  teardownTestDatabase,
} from '../../../../tests/testcontainers.setup.js';
import { ExpenseRepository } from './ExpenseRepository.js';
import { ExpenseBuilder } from '../domain/ExpenseBuilder.js';
import { ExpenseId } from '../domain/ExpenseId.js';

describe('ExpenseRepository', () => {
  let prisma: PrismaClient;
  let repository: ExpenseRepository;

  beforeAll(async () => {
    prisma = await setupTestDatabase();
    repository = new ExpenseRepository(prisma);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  const createTestExpense = () => {
    const result = new ExpenseBuilder()
      .withDescription('Test expense')
      .withAmount(100, 'USD')
      .withCategory('food')
      .withExpenseDate(new Date('2025-12-20T12:00:00Z'))
      .build();

    if (result.isErr()) {
      throw new Error('Failed to create test expense');
    }

    return result.value;
  };

  describe('saveAsync', () => {
    it('should persist expense to database', async () => {
      const expense = createTestExpense();

      const result = await repository.saveAsync(expense);

      expect(result.isOk()).toBe(true);

      // Verify in database
      const saved = await prisma.expense.findUnique({
        where: { id: expense.id.toString() },
      });
      expect(saved).not.toBeNull();
      expect(saved?.description).toBe('Test expense');
      expect(Number(saved?.amount)).toBe(100);
    });
  });

  describe('findByIdAsync', () => {
    it('should return expense by ID', async () => {
      const expense = createTestExpense();
      await repository.saveAsync(expense);

      const result = await repository.findByIdAsync(expense.id);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.id.equals(expense.id)).toBe(true);
        expect(result.value.description).toBe('Test expense');
      }
    });

    it('should return NotFoundError for non-existent ID', async () => {
      const nonExistentId = ExpenseId.create();

      const result = await repository.findByIdAsync(nonExistentId);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.constructor.name).toBe('NotFoundError');
      }
    });
  });

  describe('updateAsync', () => {
    it('should update existing expense', async () => {
      const expense = createTestExpense();
      await repository.saveAsync(expense);

      const updateResult = expense.updateDescription('Updated description');
      expect(updateResult.isOk()).toBe(true);
      if (updateResult.isOk()) {
        const result = await repository.updateAsync(updateResult.value);

        expect(result.isOk()).toBe(true);

        // Verify update
        const findResult = await repository.findByIdAsync(expense.id);
        expect(findResult.isOk()).toBe(true);
        if (findResult.isOk()) {
          expect(findResult.value.description).toBe('Updated description');
        }
      }
    });

    it('should return NotFoundError for non-existent expense', async () => {
      const expense = createTestExpense();

      const result = await repository.updateAsync(expense);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.constructor.name).toBe('NotFoundError');
      }
    });
  });

  describe('deleteAsync', () => {
    it('should delete existing expense', async () => {
      const expense = createTestExpense();
      await repository.saveAsync(expense);

      const result = await repository.deleteAsync(expense.id);

      expect(result.isOk()).toBe(true);

      // Verify deletion
      const findResult = await repository.findByIdAsync(expense.id);
      expect(findResult.isErr()).toBe(true);
    });

    it('should return NotFoundError for non-existent expense', async () => {
      const nonExistentId = ExpenseId.create();

      const result = await repository.deleteAsync(nonExistentId);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.constructor.name).toBe('NotFoundError');
      }
    });
  });

  describe('listAsync', () => {
    it('should return paginated list of expenses', async () => {
      // Create multiple expenses
      for (let i = 0; i < 5; i++) {
        const expenseResult = new ExpenseBuilder()
          .withDescription(`Expense ${i}`)
          .withAmount(100 + i, 'USD')
          .withCategory('food')
          .withExpenseDate(new Date(`2025-12-${20 - i}T12:00:00Z`))
          .build();

        if (expenseResult.isOk()) {
          await repository.saveAsync(expenseResult.value);
        }
      }

      const result = await repository.listAsync({ page: 1, limit: 3 });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.data.length).toBe(3);
        expect(result.value.total).toBe(5);
        expect(result.value.totalPages).toBe(2);
      }
    });

    it('should filter by category', async () => {
      // Create expenses with different categories
      const foodExpense = new ExpenseBuilder()
        .withDescription('Food expense')
        .withAmount(50, 'USD')
        .withCategory('food')
        .withExpenseDate(new Date('2025-12-20T12:00:00Z'))
        .build();

      const transportExpense = new ExpenseBuilder()
        .withDescription('Transport expense')
        .withAmount(30, 'USD')
        .withCategory('transport')
        .withExpenseDate(new Date('2025-12-19T12:00:00Z'))
        .build();

      if (foodExpense.isOk()) await repository.saveAsync(foodExpense.value);
      if (transportExpense.isOk()) await repository.saveAsync(transportExpense.value);

      const result = await repository.listAsync(
        { page: 1, limit: 10 },
        { category: 'food' }
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.data.length).toBe(1);
        expect(result.value.data[0].category).toBe('food');
      }
    });

    it('should filter by date range', async () => {
      // Create expenses with different dates
      const dates = ['2025-12-10', '2025-12-15', '2025-12-20'];
      for (const date of dates) {
        const expense = new ExpenseBuilder()
          .withDescription(`Expense on ${date}`)
          .withAmount(100, 'USD')
          .withCategory('other')
          .withExpenseDate(new Date(`${date}T12:00:00Z`))
          .build();

        if (expense.isOk()) await repository.saveAsync(expense.value);
      }

      const result = await repository.listAsync(
        { page: 1, limit: 10 },
        {
          startDate: new Date('2025-12-13T00:00:00Z'),
          endDate: new Date('2025-12-17T23:59:59Z'),
        }
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.data.length).toBe(1);
      }
    });

    it('should return empty array when no expenses match', async () => {
      const result = await repository.listAsync(
        { page: 1, limit: 10 },
        { category: 'entertainment' }
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.data.length).toBe(0);
        expect(result.value.total).toBe(0);
      }
    });

    it('should order by expense date descending', async () => {
      const dates = ['2025-12-10', '2025-12-20', '2025-12-15'];
      for (const date of dates) {
        const expense = new ExpenseBuilder()
          .withDescription(`Expense on ${date}`)
          .withAmount(100, 'USD')
          .withCategory('other')
          .withExpenseDate(new Date(`${date}T12:00:00Z`))
          .build();

        if (expense.isOk()) await repository.saveAsync(expense.value);
      }

      const result = await repository.listAsync({ page: 1, limit: 10 });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.data[0].expenseDate.getDate()).toBe(20);
        expect(result.value.data[1].expenseDate.getDate()).toBe(15);
        expect(result.value.data[2].expenseDate.getDate()).toBe(10);
      }
    });
  });
});
