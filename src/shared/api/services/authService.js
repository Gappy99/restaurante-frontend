import authClient from '../authClient'
import toast from 'react-hot-toast'
import { getAssignedRestaurantId } from '../../utils/roles'

export const authService = {
  login: async (email, password) => {
    try {
      const response = await authClient.post('/login', { email, password })
      // TEMP LOG: inspeccionar respuesta del backend en la consola del cliente
      console.debug('authService.login response.data:', response?.data)
      const data = response.data || {}
      const token = data.token || data.accessToken || data.access_token
      const userDetails =
        data.data ||
        data.userDetails ||
        data.user ||
        data.usuario ||
        data.data?.user ||
        data.data?.usuario ||
        {}

      if (!token) {
        throw new Error('El backend no devolvió un token de autenticación')
      }

      const userId =
        userDetails.id ||
        userDetails._id ||
        userDetails.usuario_id ||
        userDetails.user_id ||
        null

      const user = {
        id: userId,
        _id: userId,
        nombre: userDetails.nombre || userDetails.name || userDetails.username || '',
        username: userDetails.username || userDetails.nombre || '',
        email: userDetails.email || '',
        telefono:
          userDetails.telefono || userDetails.phone || userDetails.contact_phone_number || '',
        profilePicture: userDetails.profilePicture || null,
        rol: userDetails.role || userDetails.rol || 'USER_ROLE',
        // Normalize assigned restaurant: prefer object/string fields, fallback to helper
        restauranteAsignado:
          userDetails.restauranteAsignado ||
          userDetails.restaurantAsignado ||
          userDetails.restaurant_id ||
          userDetails.restaurantId ||
          // accept explicit id fields if backend sends them
          userDetails.restauranteAsignadoId ||
          userDetails.restaurante_asignado_id ||
          null ||
          getAssignedRestaurantId(userDetails),
        restauranteAsignadoId: getAssignedRestaurantId(userDetails) ||
          (typeof (userDetails.restauranteAsignado || userDetails.restaurantAsignado) === 'string'
            ? (userDetails.restauranteAsignado || userDetails.restaurantAsignado)
            : null),
      }

      // TEMP LOG: inspeccionar usuario normalizado antes de devolverlo
      console.debug('authService.login normalized user:', user)

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
