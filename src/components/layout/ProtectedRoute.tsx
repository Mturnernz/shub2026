import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'

interface ProtectedRouteProps {
  children: React.ReactNode
  role?: 'client' | 'provider'
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { session, activeRole } = useAuthStore()
  const location = useLocation()

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role && activeRole !== role) {
    return <Navigate to={activeRole === 'provider' ? '/dashboard' : '/discover'} replace />
  }

  return <>{children}</>
}
