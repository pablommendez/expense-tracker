import { Result, ok, err } from '../../../../shared/result/Result.js';
import { ValidationError, NotFoundError } from '../../../../shared/errors/index.js';
import { ExpenseRepository } from '../../infrastructure/ExpenseRepository.js';
import { ExpenseId } from '../../domain/ExpenseId.js';
import { ExpenseResponseDto } from '../dtos/ExpenseResponseDto.js';

/**
 * Handler for getting an expense by ID
 */
export class GetExpenseByIdHandler {
  constructor(private readonly repository: ExpenseRepository) {}

  async executeAsync(
    id: string
  ): Promise<Result<ExpenseResponseDto, ValidationError | NotFoundError | Error>> {
    // Parse and validate ID
    const idResult = ExpenseId.fromString(id);
    if (idResult.isErr()) {
      return err(idResult.error);
    }

    // Find the expense
    const findResult = await this.repository.findByIdAsync(idResult.value);
    if (findResult.isErr()) {
      return err(findResult.error);
    }

    const expense = findResult.value;

    // Return response DTO
    return ok({
      id: expense.id.toString(),
      description: expense.description,
      amount: expense.amount.amount,
      currency: expense.amount.currency,
      category: expense.category,
      expenseDate: expense.expenseDate.toISOString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    });
  }
}
