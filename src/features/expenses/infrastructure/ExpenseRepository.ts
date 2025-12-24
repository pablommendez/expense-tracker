import { PrismaClient, Expense as PrismaExpense } from '@prisma/client';
import { Result, ok, err } from '../../../shared/result/Result.js';
import { NotFoundError, ValidationError } from '../../../shared/errors/index.js';
import { Expense, ExpenseCategory } from '../domain/Expense.js';
import { ExpenseId } from '../domain/ExpenseId.js';
import { Money, Currency } from '../domain/Money.js';
import { ExpenseBuilder } from '../domain/ExpenseBuilder.js';

/**
 * Filter options for listing expenses
 */
export interface ListExpensesFilter {
  category?: ExpenseCategory;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Repository for Expense persistence
 * Uses Prisma Client for CRUD operations
 */
export class ExpenseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Save a new expense (CREATE)
   */
  async saveAsync(expense: Expense): Promise<Result<void, Error>> {
    try {
      await this.prisma.expense.create({
        data: {
          id: expense.id.toString(),
          description: expense.description,
          amount: expense.amount.amount,
          currency: expense.amount.currency,
          category: expense.category,
          expenseDate: expense.expenseDate,
          createdAt: expense.createdAt,
          updatedAt: expense.updatedAt,
        },
      });

      return ok(undefined);
    } catch (error) {
      return err(error as Error);
    }
  }

  /**
   * Find expense by ID (READ)
   */
  async findByIdAsync(id: ExpenseId): Promise<Result<Expense, NotFoundError | Error>> {
    try {
      const prismaExpense = await this.prisma.expense.findUnique({
        where: { id: id.toString() },
      });

      if (!prismaExpense) {
        return err(new NotFoundError('Expense', id.toString()));
      }

      const domainResult = this.toDomain(prismaExpense);
      if (domainResult.isErr()) {
        return err(domainResult.error as Error);
      }
      return ok(domainResult.value);
    } catch (error) {
      return err(error as Error);
    }
  }

  /**
   * Update an existing expense (UPDATE)
   */
  async updateAsync(expense: Expense): Promise<Result<void, NotFoundError | Error>> {
    try {
      await this.prisma.expense.update({
        where: { id: expense.id.toString() },
        data: {
          description: expense.description,
          amount: expense.amount.amount,
          currency: expense.amount.currency,
          category: expense.category,
          expenseDate: expense.expenseDate,
          updatedAt: expense.updatedAt,
        },
      });

      return ok(undefined);
    } catch (error) {
      // Prisma throws P2025 for record not found
      if ((error as { code?: string }).code === 'P2025') {
        return err(new NotFoundError('Expense', expense.id.toString()));
      }
      return err(error as Error);
    }
  }

  /**
   * Delete an expense (DELETE)
   */
  async deleteAsync(id: ExpenseId): Promise<Result<void, NotFoundError | Error>> {
    try {
      await this.prisma.expense.delete({
        where: { id: id.toString() },
      });

      return ok(undefined);
    } catch (error) {
      // Prisma throws P2025 for record not found
      if ((error as { code?: string }).code === 'P2025') {
        return err(new NotFoundError('Expense', id.toString()));
      }
      return err(error as Error);
    }
  }

  /**
   * List expenses with pagination and filters
   */
  async listAsync(
    pagination: PaginationOptions,
    filter?: ListExpensesFilter
  ): Promise<Result<PaginatedResult<Expense>, Error>> {
    try {
      const skip = (pagination.page - 1) * pagination.limit;
      const where = this.buildWhereClause(filter);

      const [prismaExpenses, total] = await Promise.all([
        this.prisma.expense.findMany({
          where,
          skip,
          take: pagination.limit,
          orderBy: { expenseDate: 'desc' },
        }),
        this.prisma.expense.count({ where }),
      ]);

      const expenses: Expense[] = [];
      for (const pe of prismaExpenses) {
        const result = this.toDomain(pe);
        if (result.isErr()) {
          return err(result.error as Error);
        }
        expenses.push(result.value);
      }

      return ok({
        data: expenses,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      });
    } catch (error) {
      return err(error as Error);
    }
  }

  /**
   * Build Prisma where clause from filters
   */
  private buildWhereClause(filter?: ListExpensesFilter): Record<string, unknown> {
    if (!filter) {
      return {};
    }

    const where: Record<string, unknown> = {};

    if (filter.category) {
      where.category = filter.category;
    }

    if (filter.startDate || filter.endDate) {
      where.expenseDate = {};
      if (filter.startDate) {
        (where.expenseDate as Record<string, Date>).gte = filter.startDate;
      }
      if (filter.endDate) {
        (where.expenseDate as Record<string, Date>).lte = filter.endDate;
      }
    }

    return where;
  }

  /**
   * Convert Prisma model to Domain entity
   */
  private toDomain(
    prismaExpense: PrismaExpense
  ): Result<Expense, ValidationError[] | NotFoundError | Error> {
    const idResult = ExpenseId.fromString(prismaExpense.id);
    if (idResult.isErr()) {
      return err([idResult.error]);
    }

    const moneyResult = Money.create(
      Number(prismaExpense.amount),
      prismaExpense.currency as Currency
    );
    if (moneyResult.isErr()) {
      return err([moneyResult.error]);
    }

    return new ExpenseBuilder()
      .withId(idResult.value)
      .withDescription(prismaExpense.description)
      .withMoney(moneyResult.value)
      .withCategory(prismaExpense.category as ExpenseCategory)
      .withExpenseDate(prismaExpense.expenseDate)
      .withCreatedAt(prismaExpense.createdAt)
      .withUpdatedAt(prismaExpense.updatedAt)
      .build();
  }
}
