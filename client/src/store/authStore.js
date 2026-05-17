import { create } from 'zustand'
import api from '../api/axiosInstance'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      set({ user: data.user, token: data.token, loading: false })
      return data.user
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false })
      throw err
    }
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user })
    } catch {
      set({ user: null, token: null })
      localStorage.removeItem('token')
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
}))

export default useAuthStore
