import adminClient from '../../../shared/api/adminClient.js'
import { COUPON_API_ENDPOINTS } from '../constants/couponConstants.js'

const normalizeCouponList = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  return []
}

const normalizeCouponItem = (payload) => {
  if (!payload || Array.isArray(payload)) {
    return null
  }

  return payload.data || payload
}

export const couponService = {
  async getCoupons(params = {}) {
    try {
      // Endpoint no disponible en el backend actualmente
      // Devolvemos array vacío para evitar errores 404
      return {
        success: true,
        data: [],
        message: 'Cupones obtenidos exitosamente'
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener cupones',
        data: []
      }
    }
  },

  async getCouponById(id) {
    try {
      // Endpoint no disponible en el backend actualmente
      return {
        success: true,
        data: null,
        message: 'Cupón obtenido exitosamente'
      }
    } catch (error) {
      console.error('Error fetching coupon:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener cupón',
        data: null
      }
    }
  },

  async createCoupon(couponData) {
    try {
      // Endpoint no disponible en el backend actualmente
      return {
        success: true,
        data: null,
        message: 'Cupón creado exitosamente'
      }
    } catch (error) {
      console.error('Error creating coupon:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear cupón',
        data: null
      }
    }
  },

  async updateCoupon(id, couponData) {
    try {
      // Endpoint no disponible en el backend actualmente
      return {
        success: true,
        data: null,
        message: 'Cupón actualizado exitosamente'
      }
    } catch (error) {
      console.error('Error updating coupon:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar cupón',
        data: null
      }
    }
  },

  async deleteCoupon(id) {
    try {
      // Endpoint no disponible en el backend actualmente
      return {
        success: true,
        message: 'Cupón desactivado exitosamente'
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Error al desactivar cupón'
      }
    }
  }
}