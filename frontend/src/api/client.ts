import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { env } from '@/config/env'
import { ApiResponse, ApiError, RequestConfig } from '@/types/api.types'

/**
 * Create and configure Axios instance
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: env.apiTimeout,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    (error: AxiosError) => {
      // Handle common errors
      if (error.response?.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('authToken')
      }
      return Promise.reject(error)
    }
  )

  return client
}

/**
 * API Client instance
 */
export const apiClient = createApiClient()

/**
 * API Client class with typed methods
 */
class ApiClient {
  private client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }

  /**
   * Generic GET request
   */
  async get<T = unknown>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config as AxiosRequestConfig)
      return {
        data: response.data,
        status: response.status,
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Generic POST request
   */
  async post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config as AxiosRequestConfig)
      return {
        data: response.data,
        status: response.status,
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Generic PUT request
   */
  async put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config as AxiosRequestConfig)
      return {
        data: response.data,
        status: response.status,
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Generic PATCH request
   */
  async patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(url, data, config as AxiosRequestConfig)
      return {
        data: response.data,
        status: response.status,
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T = unknown>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config as AxiosRequestConfig)
      return {
        data: response.data,
        status: response.status,
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Handle and format errors
   */
  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>
      return {
        message: axiosError.response?.data?.message || axiosError.message || 'An error occurred',
        status: axiosError.response?.status || 500,
        errors: axiosError.response?.data?.errors,
      }
    }
    return {
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      status: 500,
    }
  }
}

/**
 * Export typed API client instance
 */
export const api = new ApiClient(apiClient)
