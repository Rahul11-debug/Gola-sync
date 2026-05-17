import { create } from 'zustand'
import api from '../api/axiosInstance'

const useGoalStore = create((set, get) => ({
  goals: [],
  loading: false,
  error: null,

  fetchMyGoals: async (quarter) => {
    set({ loading: true })
    try {
      const params = quarter ? { quarter } : {}
      const { data } = await api.get('/goals/my', { params })
      set({ goals: data.goals, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.message, loading: false })
    }
  },

  createGoal: async (payload) => {
    const { data } = await api.post('/goals', payload)
    set((s) => ({ goals: [data.goal, ...s.goals] }))
    return data.goal
  },

  updateGoal: async (id, payload) => {
    const { data } = await api.put(`/goals/${id}`, payload)
    set((s) => ({ goals: s.goals.map((g) => (g._id === id ? data.goal : g)) }))
    return data.goal
  },

  deleteGoal: async (id) => {
    await api.delete(`/goals/${id}`)
    set((s) => ({ goals: s.goals.filter((g) => g._id !== id) }))
  },

  submitGoals: async (quarter) => {
    const { data } = await api.post('/goals/submit', { quarter })
    await get().fetchMyGoals(quarter)
    return data
  },
}))

export default useGoalStore
