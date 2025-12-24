import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ExpenseController } from './expenseController.js';

// Create Prisma client singleton
const prisma = new PrismaClient();

// Create controller
const controller = new ExpenseController(prisma);

// Create router
export const expenseRoutes = Router();

// Define routes
expenseRoutes.post('/', controller.create);
expenseRoutes.get('/', controller.list);
expenseRoutes.get('/:id', controller.getById);
expenseRoutes.put('/:id', controller.update);
expenseRoutes.delete('/:id', controller.delete);
