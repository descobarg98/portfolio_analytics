import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    const params = new URLSearchParams()
    params.set('redirect', location.pathname + location.search)
    return <Navigate to={`/login?${params.toString()}`} replace />
  }

  if (location.pathname !== '/onboarding' && user.profile && user.profile.onboarded === false) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
