import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ZodError } from 'zod';

import { ExpenseRepository } from '../infrastructure/ExpenseRepository.js';
import { CreateExpenseHandler } from '../application/commands/CreateExpenseHandler.js';
import { UpdateExpenseHandler } from '../application/commands/UpdateExpenseHandler.js';
import { DeleteExpenseHandler } from '../application/commands/DeleteExpenseHandler.js';
import { GetExpenseByIdHandler } from '../application/queries/GetExpenseByIdHandler.js';
import { ListExpensesHandler } from '../application/queries/ListExpensesHandler.js';
import {
  CreateExpenseDtoSchema,
  UpdateExpenseDtoSchema,
  ListExpensesDtoSchema,
} from '../application/dtos/index.js';
import { ValidationError, NotFoundError } from '../../../shared/errors/index.js';

/**
 * Express controller for expense endpoints
 */
export class ExpenseController {
  private readonly repository: ExpenseRepository;
  private readonly createHandler: CreateExpenseHandler;
  private readonly updateHandler: UpdateExpenseHandler;
  private readonly deleteHandler: DeleteExpenseHandler;
  private readonly getByIdHandler: GetExpenseByIdHandler;
  private readonly listHandler: ListExpensesHandler;

  constructor(prisma: PrismaClient) {
    this.repository = new ExpenseRepository(prisma);
    this.createHandler = new CreateExpenseHandler(this.repository);
    this.updateHandler = new UpdateExpenseHandler(this.repository);
    this.deleteHandler = new DeleteExpenseHandler(this.repository);
    this.getByIdHandler = new GetExpenseByIdHandler(this.repository);
    this.listHandler = new ListExpensesHandler(this.repository);
  }

  /**
   * POST /expenses - Create a new expense
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body
      const parseResult = CreateExpenseDtoSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: this.formatZodErrors(parseResult.error),
        });
        return;
      }

      // Execute handler
      const result = await this.createHandler.executeAsync(parseResult.data);

      if (result.isErr()) {
        this.handleError(result.error, res, next);
        return;
      }

      res.status(201).json(result.value);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /expenses/:id - Get expense by ID
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await this.getByIdHandler.executeAsync(id);

      if (result.isErr()) {
        this.handleError(result.error, res, next);
        return;
      }

      res.status(200).json(result.value);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /expenses - List expenses with pagination and filters
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate query parameters
      const parseResult = ListExpensesDtoSchema.safeParse(req.query);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: this.formatZodErrors(parseResult.error),
        });
        return;
      }

      const result = await this.listHandler.executeAsync(parseResult.data);

      if (result.isErr()) {
        this.handleError(result.error, res, next);
        return;
      }

      res.status(200).json(result.value);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /expenses/:id - Update an expense
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Validate request body
      const parseResult = UpdateExpenseDtoSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: this.formatZodErrors(parseResult.error),
        });
        return;
      }

      const result = await this.updateHandler.executeAsync(id, parseResult.data);

      if (result.isErr()) {
        this.handleError(result.error, res, next);
        return;
      }

      res.status(200).json(result.value);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /expenses/:id - Delete an expense
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await this.deleteHandler.executeAsync(id);

      if (result.isErr()) {
        this.handleError(result.error, res, next);
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Format Zod errors for response
   */
  private formatZodErrors(error: ZodError): Array<{ field: string; message: string }> {
    return error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  /**
   * Handle domain/application errors
   */
  private handleError(
    error: ValidationError | ValidationError[] | NotFoundError | Error,
    res: Response,
    next: NextFunction
  ): void {
    if (error instanceof NotFoundError) {
      res.status(404).json({
        error: 'Resource not found',
        details: error.toJSON(),
      });
      return;
    }

    if (error instanceof ValidationError) {
      res.status(400).json({
        error: 'Validation failed',
        details: [error.toJSON()],
      });
      return;
    }

    if (Array.isArray(error) && error[0] instanceof ValidationError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.map((e) => e.toJSON()),
      });
      return;
    }

    // Unexpected error
    next(error);
  }
}
