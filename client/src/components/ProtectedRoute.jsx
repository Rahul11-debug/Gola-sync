import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import Loader from './Loader'

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, token } = useAuthStore()

  if (!token) return <Navigate to="/login" replace />
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <Loader text="Authenticating…" />
    </div>
  )
  if (roles.length > 0 && !roles.includes(user.role)) {
    const fallback = { employee: '/employee/dashboard', manager: '/manager/dashboard', admin: '/admin/dashboard' }
    return <Navigate to={fallback[user.role] || '/login'} replace />
  }
  return children
}
