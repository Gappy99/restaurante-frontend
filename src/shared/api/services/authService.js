import authClient from '../authClient'
import toast from 'react-hot-toast'

export const authService = {
  login: async (email, password) => {
    try {
      const response = await authClient.post('/login', { email, password })
      const data = response.data || {}
      const token = data.token
      const userDetails = data.data || data.userDetails || data.user || {}

      if (!token) {
        throw new Error('El backend no devolvió un token de autenticación')
      }

      const user = {
        id: userDetails.id || userDetails._id || null,
        nombre: userDetails.nombre || userDetails.name || userDetails.username || '',
        username: userDetails.username || userDetails.nombre || '',
        email: userDetails.email || '',
        telefono: userDetails.telefono || userDetails.phone || userDetails.contact_phone_number || '',
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
        error.response?.data?.message || error.message || 'Error al iniciar sesión'
      )
      return { success: false, error: error.response?.data?.message || error.message }
    }
  },

  register: async (userData) => {
    try {
      const response = await authClient.post('/register', userData)
      return { success: true, user: response.data }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar usuario')
      return { success: false, error: error.response?.data?.message || error.message }
    }
  },

  getCurrentUser: async (token) => {
    try {
      const response = await authClient.get('/me', { headers: { Authorization: `Bearer ${token}` } })
      return { success: true, user: response.data }
    } catch (error) {
      return { success: false, error: 'Token inválido' }
    }
  },

  logout: () => {
    return { success: true }
  },
}
