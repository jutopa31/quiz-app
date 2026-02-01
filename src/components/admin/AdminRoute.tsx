import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useAdmin } from '../../hooks/useAdmin'
import { PageLoader } from '../ui/Spinner'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const { isAdmin } = useAdmin()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
