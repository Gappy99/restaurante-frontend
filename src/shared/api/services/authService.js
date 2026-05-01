import authClient from '../authClient'
import toast from 'react-hot-toast'


export const authService = {
  // Login usuario
  login: async (email, password) => {
    try {
      const response = await authClient.post('/login', { email, password })
      const data = response.data || {}
      const token = data.token
      const userDetails = data.userDetails || data.user || {}

      if (!token) {
        throw new Error('El backend no devolvió un token de autenticación')
      }

      // Mapear userDetails a formato interno (convertir "role" a "rol")
      const user = {
        id: userDetails.id || userDetails._id || null,
        username: userDetails.username || userDetails.nombre || '',
        email: userDetails.email || '',
        profilePicture: userDetails.profilePicture || null,
        rol: userDetails.role || userDetails.rol || 'USER_ROLE',
      }

      return {
        success: true,
        token,
        refreshToken: data.refreshToken || null,
        user,
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Error al iniciar sesión'
      )
      return {
        success: false,
        error: error.response?.data?.message || error.message,
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