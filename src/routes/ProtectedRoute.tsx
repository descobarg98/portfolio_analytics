import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) {
    const params = new URLSearchParams()
    params.set('redirect', location.pathname + location.search)
    return <Navigate to={`/login?${params.toString()}`} replace />
  }
  return <Outlet />
}
