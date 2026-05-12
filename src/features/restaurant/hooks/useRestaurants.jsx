import { useCallback } from 'react'
import useRestaurantStore from '../store/useRestaurantStore.js'

/**
 * Hook para obtener y manejar restaurantes
 */
export const useRestaurants = () => {
  const {
    restaurants,
    loading,
    error,
    fetchRestaurants,
    setRestaurants,
    clearError,
  } = useRestaurantStore()

  return {
    restaurants,
    loading,
    error,
    fetchRestaurants,
    setRestaurants,
    clearError,
  }
}

/**
 * Hook para manejar restaurante individual
 */
export const useRestaurant = (id) => {
  const {
    currentRestaurant,
    loading,
    error,
    fetchRestaurantById,
    setCurrentRestaurant,
    clearCurrentRestaurant,
  } = useRestaurantStore()

  const fetch = useCallback(() => {
    if (id) {
      return fetchRestaurantById(id)
    }
  }, [id, fetchRestaurantById])

  return {
    restaurant: currentRestaurant,
    loading,
    error,
    fetch,
    setCurrentRestaurant,
    clearCurrentRestaurant,
  }
}

/**
 * Hook para crear/actualizar restaurante
 */
export const useRestaurantForm = () => {
  const {
    loading,
    error,
    createRestaurant,
    updateRestaurant,
    clearError,
    setCurrentRestaurant,
  } = useRestaurantStore()

  const handleCreate = useCallback(
    async (data) => {
      const result = await createRestaurant(data)
      return result
    },
    [createRestaurant]
  )

  const handleUpdate = useCallback(
    async (id, data) => {
      const result = await updateRestaurant(id, data)
      return result
    },
    [updateRestaurant]
  )

  return {
    loading,
    error,
    handleCreate,
    handleUpdate,
    clearError,
    setCurrentRestaurant,
  }
}

/**
 * Hook para busqueda de restaurantes
 */
export const useRestaurantSearch = () => {
  const {
    filters,
    setFilters,
    searchRestaurants,
    loading,
    error,
  } = useRestaurantStore()

  const handleSearch = useCallback(
    async (searchTerm) => {
      return await searchRestaurants(searchTerm)
    },
    [searchRestaurants]
  )

  const updateFilters = useCallback(
    (newFilters) => {
      setFilters(newFilters)
    },
    [setFilters]
  )

  return {
    filters,
    updateFilters,
    handleSearch,
    loading,
    error,
  }
}

/**
 * Hook para eliminar restaurante
 */
export const useRestaurantDelete = () => {
  const { loading, error, deleteRestaurant } = useRestaurantStore()

  const handleDelete = useCallback(
      async (id) => {
        return await deleteRestaurant(id)
      },
    [deleteRestaurant]
  )

  return {
    loading,
    error,
    handleDelete,
  }
}
