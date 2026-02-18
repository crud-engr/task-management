import { createContext } from 'react'
import type { CurrentUser } from '@/types/user.types'

export interface AuthContextValue {
  user: CurrentUser | null
  isAdmin: boolean
  isLoading: boolean
  refetch: () => Promise<CurrentUser | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
