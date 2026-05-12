import { useCallback } from 'react'
import useDishStore from '../store/useDishStore.js'

/**
 * Hook para obtener y manejar la lista de platillos
 */
export const useDishes = (restaurantId = null) => {
  const { dishes, loading, error, fetchDishesByRestaurant, setFilters } = useDishStore()

  const handleFetchDishes = useCallback(async () => {
    if (!restaurantId) return
    setFilters({ restaurant: restaurantId })
    return await fetchDishesByRestaurant(restaurantId)
  }, [fetchDishesByRestaurant, restaurantId, setFilters])

  return {
    dishes,
    loading,
    error,
    fetchDishes: handleFetchDishes,
  }
}

/**
 * Hook para obtener un platillo especifico por ID
 */
export const useDish = (id) => {
  const { dishes, loading } = useDishStore()
  const dish = dishes.find((d) => (d._id || d.id) === id) || null

  return {
    dish,
    loading,
  }
}

/**
 * Hook para guardar un platillo (create/update)
 */
export const useSaveDish = (dishId = null) => {
  const { saveDish, dishes, loading, error } = useDishStore()

  const currentDish = dishId
    ? dishes.find((d) => (d._id || d.id) === dishId)
    : null

  const handleSave = useCallback(
    async (formData) => {
      if (!formData?.name) {
        return {
          success: false,
          error: 'El nombre del platillo es obligatorio',
        }
      }

      if (!formData?.price || formData.price < 0) {
        return {
          success: false,
          error: 'El precio es obligatorio y debe ser positivo',
        }
      }

      if (!formData?.type) {
        return {
          success: false,
          error: 'El tipo de platillo es obligatorio',
        }
      }

      return await saveDish(formData, dishId)
    },
    [saveDish, dishId]
  )

  return {
    handleSave,
    currentDish,
    loading,
    error,
    isEditing: !!dishId,
  }
}

/**
 * Hook para eliminar un platillo
 */
export const useDeleteDish = () => {
  const { removeDish, loading, error } = useDishStore()

  const handleDelete = useCallback(
    async (id) => {
      return await removeDish(id)
    },
    [removeDish]
  )

  return {
    handleDelete,
    loading,
    error,
  }
}

/**
 * Hook para busqueda de platillos
 */
export const useSearchDishes = (restaurantId = null) => {
  const store = useDishStore()

  const handleSearch = useCallback(
    async (term) => {
      if (!restaurantId) return []
      if (!term) {
        return store.dishes
      }
      return await store.searchDishes(restaurantId, term)
    },
    [store, restaurantId]
  )

  return {
    search: handleSearch,
    loading: store.loading,
    dishes: store.dishes,
  }
}

/**
 * Hook para obtener platillos por tipo
 */
export const useDishesByType = (type) => {
  const { dishes } = useDishStore()
  const filtered = dishes.filter((d) => d.type === type && d.available)

  return {
    dishes: filtered,
    count: filtered.length,
  }
}

export default useDishStore
