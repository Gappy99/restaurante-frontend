import { create } from 'zustand'

const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  login: (token, user) => set({ token, user, isAuthenticated: true }),
  logout: () => set({ token: null, user: null, isAuthenticated: false }),

  getToken: () => get().token,
  getUser: () => get().user,
  isAuthenticated: () => get().isAuthenticated,
}))

export default useAuthStore