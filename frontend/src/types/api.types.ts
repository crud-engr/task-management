/**
 * API Response Types
 */

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status: number
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

/**
 * Request Configuration
 */
export interface RequestConfig {
  headers?: Record<string, string>
  params?: Record<string, unknown>
  timeout?: number
}

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
