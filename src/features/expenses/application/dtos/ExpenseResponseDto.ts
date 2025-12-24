/**
 * Response DTO for a single expense
 */
export interface ExpenseResponseDto {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response DTO for paginated expense list
 */
export interface ListExpensesResponseDto {
  data: ExpenseResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
