import { useAuth } from '@/contexts'

const DEV = import.meta.env.DEV

export function DevLogin() {
  const { user, refetch } = useAuth()

  const handleLogout = () => {
    localStorage.removeItem('tenantId')
    localStorage.removeItem('userId')
    localStorage.removeItem('authToken')
    refetch()
  }

  if (!DEV || !user) return null

  return (
    <div className="w-full max-w-lg mb-6 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-amber-800">
          Logged in as <strong>{user.name}</strong> ({user.role})
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="text-amber-700 underline hover:text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
        >
          Log out
        </button>
      </div>
    </div>
  )
}
