import { api } from './client'
import type { CurrentUser } from '@/types/user.types'

/**
 * Fetch the current authenticated user (requires x-tenant-id and x-user-id headers).
 */
export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  try {
    const response = await api.get<{ data: CurrentUser }>('/users/me')
    const body = response.data as unknown as { success: boolean; data: CurrentUser }
    if (!body.success || !body.data) return null
    return body.data
  } catch {
    return null
  }
}
