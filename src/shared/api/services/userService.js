import adminClient from '../adminClient'
import useUserStore from '../../stores/useUserStore'
import toast from 'react-hot-toast'

/**
 * Servicio de Usuarios
 * CRUD de usuarios
 */

export const userService = {
  // Obtener todos los usuarios
  getUsers: async () => {
    try {
      useUserStore.getState().setLoading(true)
      const response = await adminClient.get('/auth/users')
      useUserStore.getState().setUsers(response.data)
      return { success: true, data: response.data }
    } catch (error) {
      toast.error('Error al obtener usuarios')
      return { success: false, error: error.message }
    } finally {
      useUserStore.getState().setLoading(false)
    }
  },

  // Crear usuario
  createUser: async (userData) => {
    try {
      const response = await adminClient.post('/auth/register', userData)
      useUserStore.getState().addUser(response.data)
      toast.success('Usuario creado exitosamente')
      return { success: true, data: response.data }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Error al crear usuario'
      )
      return { success: false, error: error.message }
    }
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    try {
      const response = await adminClient.put(
        `/auth/users/${id}`,
        userData
      )
      useUserStore.getState().updateUser(id, response.data)
      toast.success('Usuario actualizado exitosamente')
      return { success: true, data: response.data }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Error al actualizar usuario'
      )
      return { success: false, error: error.message }
    }
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    try {
      await adminClient.delete(`/auth/users/${id}`)
      useUserStore.getState().deleteUser(id)
      toast.success('Usuario eliminado exitosamente')
      return { success: true }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Error al eliminar usuario'
      )
      return { success: false, error: error.message }
    }
  },
}
