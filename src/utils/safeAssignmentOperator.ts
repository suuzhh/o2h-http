/**
 * A tuple type representing [error, result] where either error or result will be null
 */
export type SafeResult<T, E = Error> = [E, null] | [null, T];

/**
 * 实现 proposal-safe-assignment-operator
 * @link https://github.com/arthurfiorette/proposal-safe-assignment-operator
 * 
 * Safe assignment operator that transforms the result of a function into a tuple.
 * If the function throws an error, returns [error, null].
 * If successful, returns [null, result].
 * Works with both synchronous and asynchronous functions.
 * 
 * @example
 * // Synchronous usage
 * const [error, result] = safeAssignment(() => someOperation());
 * 
 * // Asynchronous usage
 * const [error, result] = await safeAssignment(async () => await someAsyncOperation());
 */
export async function safeAssignment<T, E = Error>(
  operation: () => T | Promise<T>
): Promise<SafeResult<T, E>> {
  try {
    const result = await Promise.resolve(operation());
    return [null, result];
  } catch (error) {
    return [error as E, null];
  }
}