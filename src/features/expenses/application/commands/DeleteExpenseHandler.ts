import { Result, ok, err } from '../../../../shared/result/Result.js';
import { ValidationError, NotFoundError } from '../../../../shared/errors/index.js';
import { ExpenseRepository } from '../../infrastructure/ExpenseRepository.js';
import { ExpenseId } from '../../domain/ExpenseId.js';

/**
 * Handler for deleting an expense
 */
export class DeleteExpenseHandler {
  constructor(private readonly repository: ExpenseRepository) {}

  async executeAsync(
    id: string
  ): Promise<Result<void, ValidationError | NotFoundError | Error>> {
    // Parse and validate ID
    const idResult = ExpenseId.fromString(id);
    if (idResult.isErr()) {
      return err(idResult.error);
    }

    // Delete the expense
    const deleteResult = await this.repository.deleteAsync(idResult.value);
    if (deleteResult.isErr()) {
      return err(deleteResult.error);
    }

    return ok(undefined);
  }
}
