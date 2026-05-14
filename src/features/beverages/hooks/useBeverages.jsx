import { useCallback } from 'react'
import useBeverageStore from '../store/useBeverageStore.js'

const beverageTypes = [
  'Cerveza',
  'Vinos',
  'Licores',
  'Cocteles',
  'Shots',
  'Bebidas_sin_alcohol',
  'Bebidas_calientes',
]

/**
 * Hook para obtener y manejar la lista de bebidas
 */
export const useBeverages = (restaurantId = null) => {
  const { beverages, loading, error, fetchBeveragesByRestaurant, setFilters } = useBeverageStore()

  const handleFetchBeverages = useCallback(async () => {
    if (!restaurantId) return
    setFilters({ restaurant: restaurantId })
    return await fetchBeveragesByRestaurant(restaurantId)
  }, [fetchBeveragesByRestaurant, restaurantId, setFilters])

  return {
    beverages,
    loading,
    error,
    fetchBeverages: handleFetchBeverages,
  }
}

/**
 * Hook para obtener una bebida especifica por ID
 */
export const useBeverage = (id) => {
  const { beverages, loading } = useBeverageStore()
  const beverage = beverages.find((b) => (b._id || b.id) === id) || null

  return {
    beverage,
    loading,
  }
}

/**
 * Hook para guardar una bebida (create/update)
 */
export const useSaveBeverage = (beverageId = null) => {
  const { saveBeverage, beverages, loading, error } = useBeverageStore()

  const currentBeverage = beverageId
    ? beverages.find((b) => (b._id || b.id) === beverageId)
    : null

  const handleSave = useCallback(
    async (formData) => {
      if (!formData?.name) {
        return {
          success: false,
          error: 'El nombre de la bebida es obligatorio',
        }
      }

      if (!formData?.description) {
        return {
          success: false,
          error: 'La descripción de la bebida es obligatoria',
        }
      }

      if (!formData?.price || formData.price < 0) {
        return {
          success: false,
          error: 'El precio es obligatorio y debe ser positivo',
        }
      }

      if (!formData?.type || !beverageTypes.includes(formData.type)) {
        return {
          success: false,
          error: 'El tipo de bebida es obligatorio y debe ser válido',
        }
      }

      if (!formData?.restaurant_id) {
        return {
          success: false,
          error: 'El restaurante de la bebida es obligatorio',
        }
      }

      const normalizedFormData = {
        ...formData,
        image: formData.image ?? null,
      }

      return await saveBeverage(normalizedFormData, beverageId)
    },
    [saveBeverage, beverageId]
  )

  return {
    handleSave,
    currentBeverage,
    loading,
    error,
    isEditing: !!beverageId,
  }
}

/**
 * Hook para eliminar una bebida
 */
export const useDeleteBeverage = () => {
  const { removeBeverage, loading, error } = useBeverageStore()

  const handleDelete = useCallback(
    async (id) => {
      return await removeBeverage(id)
    },
    [removeBeverage]
  )

  return {
    handleDelete,
    loading,
    error,
  }
}

/**
 * Hook para busqueda de bebidas
 */
export const useSearchBeverages = (restaurantId = null) => {
  const store = useBeverageStore()

  const handleSearch = useCallback(
    async (term) => {
      if (!restaurantId) return []
      if (!term) {
        return store.beverages
      }
      return await store.searchBeverages(restaurantId, term)
    },
    [store, restaurantId]
  )

  return {
    search: handleSearch,
    loading: store.loading,
    beverages: store.beverages,
  }
}

/**
 * Hook para obtener bebidas por tipo
 */
export const useBeveragesByType = (type) => {
  const { beverages } = useBeverageStore()
  const filtered = beverages.filter((b) => b.type === type && b.available)

  return {
    beverages: filtered,
    count: filtered.length,
  }
}

export default useBeverageStore
