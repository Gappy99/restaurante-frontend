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
      const response = await adminClient.get(COUPON_API_ENDPOINTS.LIST, {
        params,
      })

      return {
        success: true,
        data: normalizeCouponList(response.data),
        message: 'Cupones obtenidos exitosamente'
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al obtener cupones',
        data: []
      }
    }
  },

  async getCouponById(id) {
    try {
      const response = await adminClient.get(COUPON_API_ENDPOINTS.DETAIL(id))
      
      return {
        success: true,
        data: normalizeCouponItem(response.data),
        message: 'Cupón obtenido exitosamente'
      }
    } catch (error) {
      console.error('Error fetching coupon:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al obtener cupón',
        data: null
      }
    }
  },

  async createCoupon(couponData) {
    try {
      const response = await adminClient.post(COUPON_API_ENDPOINTS.CREATE, couponData)
      
      return {
        success: true,
        data: normalizeCouponItem(response.data),
        message: 'Cupón creado exitosamente'
      }
    } catch (error) {
      console.error('Error creating coupon:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al crear cupón',
        data: null
      }
    }
  },

  async updateCoupon(id, couponData) {
    try {
      const response = await adminClient.put(COUPON_API_ENDPOINTS.UPDATE(id), couponData)
      
      return {
        success: true,
        data: normalizeCouponItem(response.data),
        message: 'Cupón actualizado exitosamente'
      }
    } catch (error) {
      console.error('Error updating coupon:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al actualizar cupón',
        data: null
      }
    }
  },

  async deleteCoupon(id) {
    try {
      const response = await adminClient.delete(COUPON_API_ENDPOINTS.DELETE(id))
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