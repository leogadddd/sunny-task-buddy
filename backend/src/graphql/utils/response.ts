/**
 * Unified API Response Format
 * All GraphQL resolvers must return this shape for consistency
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

/**
 * Creates a successful response
 */
export function success<T>(message: string, data?: T): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

/**
 * Creates a failed response
 */
export function fail(message: string, errors?: string[]): ApiResponse<never> {
  return {
    success: false,
    message,
    errors,
  };
}
