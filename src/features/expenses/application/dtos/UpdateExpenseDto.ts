import { z } from 'zod';

/**
 * Zod schema for updating an expense (all fields optional)
 */
export const UpdateExpenseDtoSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  currency: z
    .enum(['USD', 'EUR', 'GBP', 'JPY'], {
      errorMap: () => ({ message: 'Currency must be one of: USD, EUR, GBP, JPY' }),
    })
    .optional(),
  category: z
    .enum(
      ['food', 'transport', 'entertainment', 'utilities', 'healthcare', 'other'],
      {
        errorMap: () => ({
          message:
            'Category must be one of: food, transport, entertainment, utilities, healthcare, other',
        }),
      }
    )
    .optional(),
  expenseDate: z
    .string()
    .datetime({ message: 'Expense date must be a valid ISO 8601 date' })
    .optional(),
});

export type UpdateExpenseDto = z.infer<typeof UpdateExpenseDtoSchema>;
