/**
 * Servicio de Restaurant
 * Maneja todas las llamadas API relacionadas con restaurantes
 */

import adminClient from '../../../shared/api/adminClient.js'
import { RESTAURANT_API_ENDPOINTS } from '../constants/restaurantConstants.js'

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
        data: response.data,
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
      const response = await adminClient.get(
        RESTAURANT_API_ENDPOINTS.DETAIL(id)
      )
      return {
        success: true,
        data: response.data,
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
      const response = await adminClient.post(
        RESTAURANT_API_ENDPOINTS.CREATE,
        restaurantData
      )
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
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
      return {
        success: true,
        data: response.data,
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
      const response = await adminClient.get(
        RESTAURANT_API_ENDPOINTS.SEARCH,
        {
          params: { q: searchTerm },
        }
      )
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  },
}
