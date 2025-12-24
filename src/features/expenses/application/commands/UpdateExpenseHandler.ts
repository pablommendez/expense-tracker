import { Result, ok, err } from '../../../../shared/result/Result.js';
import { ValidationError, NotFoundError } from '../../../../shared/errors/index.js';
import { ExpenseRepository } from '../../infrastructure/ExpenseRepository.js';
import { ExpenseId } from '../../domain/ExpenseId.js';
import { Money, Currency } from '../../domain/Money.js';
import { ExpenseCategory } from '../../domain/Expense.js';
import { UpdateExpenseDto } from '../dtos/UpdateExpenseDto.js';
import { ExpenseResponseDto } from '../dtos/ExpenseResponseDto.js';

/**
 * Handler for updating an existing expense
 */
export class UpdateExpenseHandler {
  constructor(private readonly repository: ExpenseRepository) {}

  async executeAsync(
    id: string,
    dto: UpdateExpenseDto
  ): Promise<Result<ExpenseResponseDto, ValidationError | NotFoundError | Error>> {
    // Parse and validate ID
    const idResult = ExpenseId.fromString(id);
    if (idResult.isErr()) {
      return err(idResult.error);
    }

    // Find existing expense
    const findResult = await this.repository.findByIdAsync(idResult.value);
    if (findResult.isErr()) {
      return err(findResult.error);
    }

    let expense = findResult.value;

    // Apply updates
    if (dto.description !== undefined) {
      const updateResult = expense.updateDescription(dto.description);
      if (updateResult.isErr()) {
        return err(updateResult.error);
      }
      expense = updateResult.value;
    }

    if (dto.category !== undefined) {
      const updateResult = expense.updateCategory(dto.category as ExpenseCategory);
      if (updateResult.isErr()) {
        return err(updateResult.error);
      }
      expense = updateResult.value;
    }

    if (dto.amount !== undefined && dto.currency !== undefined) {
      const moneyResult = Money.create(dto.amount, dto.currency as Currency);
      if (moneyResult.isErr()) {
        return err(moneyResult.error);
      }
      const updateResult = expense.updateAmount(moneyResult.value);
      if (updateResult.isErr()) {
        return err(updateResult.error);
      }
      expense = updateResult.value;
    }

    // Persist changes
    const updateResult = await this.repository.updateAsync(expense);
    if (updateResult.isErr()) {
      return err(updateResult.error);
    }

    // Return response DTO
    return ok(this.toResponseDto(expense));
  }

  private toResponseDto(expense: {
    id: { toString(): string };
    description: string;
    amount: { amount: number; currency: string };
    category: string;
    expenseDate: Date;
    createdAt: Date;
    updatedAt: Date;
  }): ExpenseResponseDto {
    return {
      id: expense.id.toString(),
      description: expense.description,
      amount: expense.amount.amount,
      currency: expense.amount.currency,
      category: expense.category,
      expenseDate: expense.expenseDate.toISOString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    };
  }
}
