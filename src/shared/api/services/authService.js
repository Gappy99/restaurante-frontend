import authClient from '../authClient'
import toast from 'react-hot-toast'

/**
 * Servicio de Autenticación
 * Maneja login, registro, logout y renovación de token
 */

export const authService = {
  // Login usuario
  login: async (email, password) => {
    try {
      const response = await authClient.post('/login', { email, password })
      const { token, refreshToken, user } = response.data

      return {
        success: true,
        token,
        refreshToken,
        user,
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Error al iniciar sesión'
      )
      return {
        success: false,
        error: error.response?.data?.message,
      }
    }
  },

  // Registro de usuario
  register: async (userData) => {
    try {
      const response = await authClient.post('/register', userData)
      toast.success('Registro exitoso')
      return {
        success: true,
        user: response.data.user,
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Error en el registro'
      )
      return {
        success: false,
        error: error.response?.data?.message,
      }
    }
  },

  // Obtener usuario actual
  getCurrentUser: async (token) => {
    try {
      const response = await authClient.get('/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return { success: true, user: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Logout (limpia token del cliente)
  logout: () => {
    return { success: true }
  },
}
