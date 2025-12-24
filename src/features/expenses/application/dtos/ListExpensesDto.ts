import { z } from 'zod';

/**
 * Zod schema for list expenses query parameters
 */
export const ListExpensesDtoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z
    .enum(['food', 'transport', 'entertainment', 'utilities', 'healthcare', 'other'])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type ListExpensesDto = z.infer<typeof ListExpensesDtoSchema>;
