import { create } from 'zustand'

const useAuthStore = create((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,

  login: (token, user, refreshToken = null) =>
    set({ token, user, refreshToken, isAuthenticated: true }),
  logout: () =>
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),

  getToken: () => get().token,
  getUser: () => get().user,
  isAuthenticated: () => get().isAuthenticated,
  getRefreshToken: () => get().refreshToken,
}))

export default useAuthStore