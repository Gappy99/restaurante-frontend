import adminClient from '../../../shared/api/adminClient.js'
import { RESTAURANT_API_ENDPOINTS } from '../constants/restaurantConstants.js'

const normalizeRestaurantList = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.restaurants)) {
    return payload.restaurants
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  return []
}

const normalizeRestaurantItem = (payload) => {
  if (!payload || Array.isArray(payload)) {
    return null
  }

  // Log para debug
  console.log('normalizeRestaurantItem recibió:', payload)

  const raw = payload.restaurant || payload.data || payload

  // Normalizar imágenes en un array de strings en `restaurant_images`
  const imgCandidates = []

  const pushIfString = (val) => {
    if (!val && val !== 0) return
    if (typeof val === 'string') imgCandidates.push(val)
    else if (Array.isArray(val)) {
      val.forEach((v) => {
        if (typeof v === 'string') imgCandidates.push(v)
        else if (v && typeof v === 'object') {
         
          const maybe = v.url || v.secure_url || v.path || v.src || v.location || v.link
          if (maybe) imgCandidates.push(maybe)
        }
      })
    } else if (val && typeof val === 'object') {
      const maybe = val.url || val.secure_url || val.path || val.src || val.location || val.link
      if (maybe) imgCandidates.push(maybe)
    }
  }

  pushIfString(raw.restaurant_images || raw.images || raw.photos || raw.photos_urls)
  pushIfString(raw.restaurant_image || raw.image || raw.img)
  pushIfString(raw.data?.restaurant_images || raw.data?.images || raw.data?.image)

  const result = { ...raw }
  if (imgCandidates.length > 0) {
    result.restaurant_images = Array.from(new Set(imgCandidates))
  } else if (!result.restaurant_images) {
    result.restaurant_images = []
  }

  console.log('normalizeRestaurantItem devolvió:', result)
  return result
}

export const restaurantService = {
  /**
   * Obtener lista de todos los restaurantes
   * ENDPOINT NO DISPONIBLE EN EL BACKEND ACTUAL
   */
  getRestaurants: async (params = {}) => {
    try {
      // Endpoint no disponible en el backend actualmente
      return {
        success: true,
        data: [],
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  },

  /**
   * Obtener un restaurante por ID
   * ENDPOINT NO DISPONIBLE EN EL BACKEND ACTUAL
   */
  getRestaurantById: async (id) => {
    try {
      // Endpoint no disponible en el backend actualmente
      return {
        success: true,
        data: null,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  },

  /**
   * Crear un nuevo restaurante
   * ENDPOINT NO DISPONIBLE EN EL BACKEND ACTUAL
   */
  createRestaurant: async (restaurantData) => {
    try {
      // Endpoint no disponible en el backend actualmente
      return {
        success: true,
        data: null,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        raw: error.response?.data,
      }
        }
      }

      return {
        success: false,
        error: raw?.message || error.message,
        raw,
      }
    }
  },

  /**
   * Actualizar un restaurante
   * ENDPOINT NO DISPONIBLE EN EL BACKEND ACTUAL
   */
  updateRestaurant: async (id, restaurantData) => {
    try {
      // Endpoint no disponible en el backend actualmente
      return {
        success: true,
        data: null,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  },

  /**
   * Eliminar un restaurante
   * ENDPOINT NO DISPONIBLE EN EL BACKEND ACTUAL
   */
  deleteRestaurant: async (id) => {
    try {
      // Endpoint no disponible en el backend actualmente
      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  },

  /**
   * Buscar restaurantes
   * ENDPOINT NO DISPONIBLE EN EL BACKEND ACTUAL
   */
  searchRestaurants: async (searchTerm) => {
    try {
      // Endpoint no disponible en el backend actualmente
      return {
        success: true,
        data: [],
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  },
}
