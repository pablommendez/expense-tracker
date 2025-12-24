import { z } from 'zod';

/**
 * Zod schema for creating an expense
 */
export const CreateExpenseDtoSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be at most 500 characters'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY'], {
    errorMap: () => ({ message: 'Currency must be one of: USD, EUR, GBP, JPY' }),
  }),
  category: z.enum(
    ['food', 'transport', 'entertainment', 'utilities', 'healthcare', 'other'],
    {
      errorMap: () => ({
        message:
          'Category must be one of: food, transport, entertainment, utilities, healthcare, other',
      }),
    }
  ),
  expenseDate: z
    .string()
    .datetime({ message: 'Expense date must be a valid ISO 8601 date' }),
});

export type CreateExpenseDto = z.infer<typeof CreateExpenseDtoSchema>;
