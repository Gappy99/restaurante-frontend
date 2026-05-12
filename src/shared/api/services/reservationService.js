import adminClient from '../../api/adminClient'
import toast from 'react-hot-toast'

const resource = '/reservations'

const reservationService = {
  getReservations: async (params = {}) => {
    try {
      const response = await adminClient.get(resource, { params })
      return response.data?.data ?? response.data ?? []
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error cargando reservaciones')
      return []
    }
  },

  createReservation: async (reservationData) => {
    try {
      const response = await adminClient.post(resource, reservationData)
      toast.success('Reservación creada correctamente')
      return response.data?.data ?? response.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear reservación')
      return null
    }
  },

  updateReservation: async (id, reservationData) => {
    try {
      const response = await adminClient.put(`${resource}/${id}`, reservationData)
      toast.success('Reservación actualizada correctamente')
      return response.data?.data ?? response.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar reservación')
      return null
    }
  },

  cancelReservation: async (id) => {
    try {
      const response = await adminClient.patch(`${resource}/${id}`, { status: 'CANCELADA' })
      toast.success('Reservación cancelada')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cancelar reservación')
      return null
    }
  },

  deleteReservation: async (id) => {
    try {
      const response = await adminClient.delete(`${resource}/${id}`)
      toast.success('Reservación eliminada')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar reservación')
      return null
    }
  },
}

export default reservationService
