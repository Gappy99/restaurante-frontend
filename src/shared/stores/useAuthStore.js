import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      // Acciones
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },
      login: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        })
      },

      // Getters
      getToken: () => get().token,
      getUser: () => get().user,
      isAdmin: () => get().user?.rol === 'ADMIN',
    }),
    {
      name: 'auth-storage', // Key en localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
