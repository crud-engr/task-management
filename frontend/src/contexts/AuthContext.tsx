import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { fetchCurrentUser } from '@/api/users'
import type { CurrentUser } from '@/types/user.types'
import { AuthContext } from './AuthContextState'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(async (): Promise<CurrentUser | null> => {
    const tenantId = localStorage.getItem('tenantId')
    const userId = localStorage.getItem('userId')
    if (!tenantId || !userId) {
      setUser(null)
      setIsLoading(false)
      return null
    }
    try {
      const data = await fetchCurrentUser()
      setUser(data)
      setIsLoading(false)
      return data
    } catch {
      setUser(null)
      setIsLoading(false)
      return null
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const value = {
    user,
    isAdmin: user?.role === 'admin',
    isLoading,
    refetch,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
