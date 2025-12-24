import { Result, ok, err } from '../../../../shared/result/Result.js';
import {
  ExpenseRepository,
  ListExpensesFilter,
} from '../../infrastructure/ExpenseRepository.js';
import { ListExpensesDto } from '../dtos/ListExpensesDto.js';
import {
  ListExpensesResponseDto,
  ExpenseResponseDto,
} from '../dtos/ExpenseResponseDto.js';
import { ExpenseCategory } from '../../domain/Expense.js';

/**
 * Handler for listing expenses with pagination and filters
 */
export class ListExpensesHandler {
  constructor(private readonly repository: ExpenseRepository) {}

  async executeAsync(
    dto: ListExpensesDto
  ): Promise<Result<ListExpensesResponseDto, Error>> {
    // Build filter
    const filter: ListExpensesFilter = {};

    if (dto.category) {
      filter.category = dto.category as ExpenseCategory;
    }

    if (dto.startDate) {
      filter.startDate = new Date(dto.startDate);
    }

    if (dto.endDate) {
      filter.endDate = new Date(dto.endDate);
    }

    // Execute query
    const listResult = await this.repository.listAsync(
      { page: dto.page, limit: dto.limit },
      filter
    );

    if (listResult.isErr()) {
      return err(listResult.error);
    }

    const result = listResult.value;

    // Map to response DTOs
    const data: ExpenseResponseDto[] = result.data.map((expense) => ({
      id: expense.id.toString(),
      description: expense.description,
      amount: expense.amount.amount,
      currency: expense.amount.currency,
      category: expense.category,
      expenseDate: expense.expenseDate.toISOString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    }));

    return ok({
      data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }
}
