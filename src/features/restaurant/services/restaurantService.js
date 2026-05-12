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
   */
  getRestaurants: async (params = {}) => {
    try {
      const response = await adminClient.get(RESTAURANT_API_ENDPOINTS.LIST, {
        params,
      })

      return {
        success: true,
        data: normalizeRestaurantList(response.data),
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
   */
  getRestaurantById: async (id) => {
    try {
      const response = await adminClient.get(RESTAURANT_API_ENDPOINTS.DETAIL(id))
      const restaurant = normalizeRestaurantItem(response.data)

      if (!restaurant) {
        throw new Error('Respuesta invalida al obtener restaurante')
      }

      return {
        success: true,
        data: restaurant,
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
   */
  createRestaurant: async (restaurantData) => {
    try {
      // Asegurar que la creación siempre envíe FormData (backend espera multipart)
      let payload = restaurantData
      if (!(restaurantData instanceof FormData)) {
        const fd = new FormData()
        Object.keys(restaurantData).forEach((key) => {
          const val = restaurantData[key]
          if (val === undefined || val === null) return
          // Si es un array, append cada elemento
          if (Array.isArray(val)) {
            val.forEach((v) => fd.append(key, v))
          } else {
            fd.append(key, val)
          }
        })
        payload = fd
      }

      console.log('📤 createRestaurant enviando payload, isFormData:', payload instanceof FormData)
      if (payload instanceof FormData) {
        // Loguear contenido del FormData para depuración
        for (const pair of payload.entries()) {
          console.log('📥 formdata', pair[0], pair[1])
        }
      }

      const response = await adminClient.post(
        RESTAURANT_API_ENDPOINTS.CREATE,
        payload
      )
      const restaurant = normalizeRestaurantItem(response.data)

      if (!restaurant) {
        throw new Error('Respuesta invalida al crear restaurante')
      }

      return {
        success: true,
        data: restaurant,
      }
    } catch (error) {
      
      console.error('createRestaurant error:', error.response?.status, error.response?.data || error.message)

      const raw = error.response?.data

      const isImageServiceError = raw && (raw.message?.includes('Invalid api_key') || raw.error?.includes('Invalid api_key'))

      if (isImageServiceError) {
        try {
          console.warn('Image service error detected — intentando fallback: crear sin imagen y luego adjuntar imagen')

          const jsonPayload = {}
          if (restaurantData instanceof FormData) {
            for (const [k, v] of restaurantData.entries()) {
              if (k === 'restaurant_images') continue
              jsonPayload[k] = v
            }
          } else {
            Object.assign(jsonPayload, restaurantData)
            delete jsonPayload.restaurant_images
          }

          const createRes = await adminClient.post(RESTAURANT_API_ENDPOINTS.CREATE, jsonPayload)
          const created = normalizeRestaurantItem(createRes.data)
          if (!created) throw new Error('Respuesta invalida al crear restaurante en fallback')

          const originalFile = restaurantData instanceof FormData ? Array.from(restaurantData.getAll('restaurant_images'))[0] : restaurantData.restaurant_images

          if (originalFile) {
            const fd = new FormData()
            fd.append('restaurant_images', originalFile)
            const attachRes = await adminClient.put(RESTAURANT_API_ENDPOINTS.UPDATE(created._id || created.id), fd)
            const attached = normalizeRestaurantItem(attachRes.data)
            return { success: true, data: attached || created }
          }

          return { success: true, data: created }
        } catch (fallbackError) {
          console.error('createRestaurant fallback error:', fallbackError)
          return {
            success: false,
            error: fallbackError.response?.data?.message || fallbackError.message,
            raw: fallbackError.response?.data,
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
   */
  updateRestaurant: async (id, restaurantData) => {
    try {
      const response = await adminClient.put(
        RESTAURANT_API_ENDPOINTS.UPDATE(id),
        restaurantData
      )
      const restaurant = normalizeRestaurantItem(response.data)

      if (!restaurant) {
        throw new Error('Respuesta invalida al actualizar restaurante')
      }

      return {
        success: true,
        data: restaurant,
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
   */
  deleteRestaurant: async (id) => {
    try {
      await adminClient.delete(RESTAURANT_API_ENDPOINTS.DELETE(id))
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
   */
  searchRestaurants: async (searchTerm) => {
    try {
      const response = await adminClient.get(RESTAURANT_API_ENDPOINTS.SEARCH, {
        params: { q: searchTerm },
      })

      return {
        success: true,
        data: normalizeRestaurantList(response.data),
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  },
}
