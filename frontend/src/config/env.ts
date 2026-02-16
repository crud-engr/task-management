/**
 * Environment Configuration
 * Loads and validates environment variables
 */

interface EnvConfig {
  apiBaseUrl: string
  apiTimeout: number
}

/**
 * Get environment variable with fallback
 */
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key]
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value || defaultValue || ''
}

/**
 * Environment configuration object
 */
export const env: EnvConfig = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000/api'),
  apiTimeout: Number.parseInt(getEnvVar('VITE_API_TIMEOUT', '10000'), 10),
}
