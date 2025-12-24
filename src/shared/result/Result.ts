/**
 * Result<T> Pattern - Re-export from neverthrow
 *
 * The Result pattern provides explicit error handling without exceptions.
 * Use this for all domain/application boundaries.
 *
 * @example
 * ```typescript
 * function divide(a: number, b: number): Result<number, DivisionError> {
 *   if (b === 0) {
 *     return err(new DivisionError('Cannot divide by zero'));
 *   }
 *   return ok(a / b);
 * }
 *
 * const result = divide(10, 2);
 * if (result.isOk()) {
 *   console.log(result.value); // 5
 * } else {
 *   console.error(result.error.message);
 * }
 * ```
 */
export { Result, ok, err, ResultAsync, okAsync, errAsync } from 'neverthrow';

// Re-export types for convenience
export type { Result as ResultType } from 'neverthrow';
