import { useState, FormEvent } from 'react'
import { useAuth } from '@/contexts'

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? 'h-5 w-5'}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export function LoginPage() {
  const { refetch } = useAuth()
  const [tenantId, setTenantId] = useState('')
  const [userId, setUserId] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const tid = tenantId.trim()
    const uid = userId.trim()
    if (!tid || !uid) return
    setError(null)
    setIsLoggingIn(true)
    try {
      localStorage.setItem('tenantId', tid)
      localStorage.setItem('userId', uid)
      const user = await refetch()
      if (!user) {
        setError('Invalid tenant or user. Please check your credentials.')
        localStorage.removeItem('tenantId')
        localStorage.removeItem('userId')
      }
    } catch {
      setError('Something went wrong. Please try again.')
      localStorage.removeItem('tenantId')
      localStorage.removeItem('userId')
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-surface-100">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-card">
          <header className="text-center mb-8">
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
              Sign in
            </h1>
            <p className="mt-1 text-surface-500 text-sm">
              Enter your tenant and user details
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="block text-sm font-medium text-surface-700 mb-1.5">
                Tenant ID
              </span>
              <input
                type="text"
                value={tenantId}
                onChange={(e) => {
                  setTenantId(e.target.value)
                  setError(null)
                }}
                placeholder="e.g. org-uuid"
                autoComplete="off"
                disabled={isLoggingIn}
                className="
                  w-full rounded-xl border border-surface-200 bg-white px-4 py-3
                  text-surface-900 placeholder:text-surface-400
                  focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                  disabled:opacity-50
                "
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-surface-700 mb-1.5">
                User ID
              </span>
              <input
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value)
                  setError(null)
                }}
                placeholder="user-uuid"
                autoComplete="off"
                disabled={isLoggingIn}
                className="
                  w-full rounded-xl border border-surface-200 bg-white px-4 py-3
                  text-surface-900 placeholder:text-surface-400
                  focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                  disabled:opacity-50
                "
              />
            </label>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!tenantId.trim() || !userId.trim() || isLoggingIn}
              className="
                w-full flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5
                font-semibold text-white hover:bg-accent-hover
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors
              "
            >
              {isLoggingIn ? (
                <>
                  <Spinner />
                  <span>Signing in…</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
