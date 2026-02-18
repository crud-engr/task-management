import { useContext } from 'react'
import { AuthContext } from './AuthContextState'
import type { AuthContextValue } from './AuthContextState'

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
