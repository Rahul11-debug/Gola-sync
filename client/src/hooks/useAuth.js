import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export function useRequireAuth(allowedRoles = []) {
  const { user, token, fetchMe } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    if (!user) { fetchMe() }
  }, [token, user])

  useEffect(() => {
    if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      const routes = { employee: '/employee/dashboard', manager: '/manager/dashboard', admin: '/admin/dashboard' }
      navigate(routes[user.role] || '/login')
    }
  }, [user])

  return { user, loading: !user && !!token }
}
