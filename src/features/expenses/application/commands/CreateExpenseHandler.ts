import { Result, ok, err } from '../../../../shared/result/Result.js';
import { ValidationError } from '../../../../shared/errors/index.js';
import { ExpenseBuilder } from '../../domain/ExpenseBuilder.js';
import { ExpenseRepository } from '../../infrastructure/ExpenseRepository.js';
import { CreateExpenseDto } from '../dtos/CreateExpenseDto.js';
import { ExpenseResponseDto } from '../dtos/ExpenseResponseDto.js';
import { Currency } from '../../domain/Money.js';
import { ExpenseCategory } from '../../domain/Expense.js';

/**
 * Handler for creating a new expense
 */
export class CreateExpenseHandler {
  constructor(private readonly repository: ExpenseRepository) {}

  async executeAsync(
    dto: CreateExpenseDto
  ): Promise<Result<ExpenseResponseDto, ValidationError[] | Error>> {
    // Build the expense entity
    const expenseResult = new ExpenseBuilder()
      .withDescription(dto.description)
      .withAmount(dto.amount, dto.currency as Currency)
      .withCategory(dto.category as ExpenseCategory)
      .withExpenseDate(new Date(dto.expenseDate))
      .build();

    if (expenseResult.isErr()) {
      return err(expenseResult.error);
    }

    const expense = expenseResult.value;

    // Persist the expense
    const saveResult = await this.repository.saveAsync(expense);

    if (saveResult.isErr()) {
      return err(saveResult.error);
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
