import { create } from 'zustand'
import { restaurantService } from '../services/restaurantService.js'
import { RESTAURANT_DEFAULTS } from '../constants/restaurantConstants.js'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { getAssignedRestaurantId, isManagerRole } from '../../../shared/utils/roles'

const filterRestaurantsByAssignedId = (restaurants, assignedRestaurantId) => {
  if (!Array.isArray(restaurants)) return []
  if (!assignedRestaurantId) return restaurants

  return restaurants.filter((restaurant) => {
    const restaurantId = restaurant?._id || restaurant?.id
    return String(restaurantId || '') === String(assignedRestaurantId)
  })
}

const useRestaurantStore = create((set, get) => ({
  // State
  restaurants: [],
  currentRestaurant: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: RESTAURANT_DEFAULTS.PAGE_SIZE,
    total: 0,
  },
  filters: {
    search: '',
    status: null,
    cuisineType: null,
  },
  sortBy: RESTAURANT_DEFAULTS.SORT_BY,
  sortOrder: RESTAURANT_DEFAULTS.SORT_ORDER,

  // Actions
  setRestaurants: (restaurants) => set({ restaurants }),
  setCurrentRestaurant: (restaurant) => set({ currentRestaurant: restaurant }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  setSortBy: (sortBy, sortOrder = 'asc') =>
    set({ sortBy, sortOrder }),

  clearError: () => set({ error: null }),
  clearCurrentRestaurant: () => set({ currentRestaurant: null }),

  resolveRestaurantId: (restaurant) => restaurant?._id || restaurant?.id,

  // Async Actions
  fetchRestaurants: async (params = {}) => {
    set({ loading: true, error: null })
    const user = useAuthStore.getState().user
    const isManager = isManagerRole(user?.rol)
    const managerRestaurantId = isManager ? getAssignedRestaurantId(user) : ''

    if (isManager && !managerRestaurantId) {
      const error = 'El gerente no tiene un restaurante asignado'
      set({ restaurants: [], error, loading: false })
      return { success: false, error }
    }

    const scopedParams = managerRestaurantId && !params?.restaurantId
      ? { ...params, restaurantId: managerRestaurantId }
      : params

    const result = await restaurantService.getRestaurants(scopedParams)

    if (result.success) {
      const scopedRestaurants = managerRestaurantId
        ? filterRestaurantsByAssignedId(result.data || [], managerRestaurantId)
        : (result.data || [])
      set({
        restaurants: scopedRestaurants,
        loading: false,
      })
    } else {
      set({
        error: result.error,
        loading: false,
      })
    }

    return result
  },

  fetchRestaurantById: async (id) => {
    set({ loading: true, error: null })
    const result = await restaurantService.getRestaurantById(id)

    if (result.success) {
      set({
        currentRestaurant: result.data,
        loading: false,
      })
    } else {
      set({
        error: result.error,
        loading: false,
      })
    }

    return result
  },

  createRestaurant: async (restaurantData) => {
    set({ loading: true, error: null })
    const result = await restaurantService.createRestaurant(restaurantData)

    if (result.success) {
      set((state) => ({
        restaurants: [...state.restaurants, result.data],
        loading: false,
      }))
    } else {
      set({
        error: result.error,
        loading: false,
      })
    }

    return result
  },

  updateRestaurant: async (id, restaurantData) => {
    set({ loading: true, error: null })
    const result = await restaurantService.updateRestaurant(
      id,
      restaurantData
    )

    // Debug: ensure updated data (including images) arrives from service
    console.log(' useRestaurantStore.updateRestaurant result.data:', result?.data)

    if (result.success) {
      set((state) => ({
        restaurants: state.restaurants.map((r) =>
          (r._id || r.id) === id ? result.data : r
        ),
        currentRestaurant:
          (state.currentRestaurant?._id || state.currentRestaurant?.id) === id
            ? result.data
            : state.currentRestaurant,
        loading: false,
      }))
    } else {
      set({
        error: result.error,
        loading: false,
      })
    }

    return result
  },

  deleteRestaurant: async (id) => {
    set({ loading: true, error: null })
    const result = await restaurantService.deleteRestaurant(id)

    if (result.success) {
      set((state) => ({
        restaurants: state.restaurants.filter((r) => (r._id || r.id) !== id),
        currentRestaurant:
          (state.currentRestaurant?._id || state.currentRestaurant?.id) === id
            ? null
            : state.currentRestaurant,
        loading: false,
      }))
    } else {
      set({
        error: result.error,
        loading: false,
      })
    }

    return result
  },

  searchRestaurants: async (searchTerm) => {
    set({ loading: true, error: null })
    const user = useAuthStore.getState().user
    const isManager = isManagerRole(user?.rol)
    const managerRestaurantId = isManager ? getAssignedRestaurantId(user) : ''

    if (isManager && !managerRestaurantId) {
      const error = 'El gerente no tiene un restaurante asignado'
      set({ restaurants: [], error, loading: false })
      return { success: false, error }
    }

    const result = await restaurantService.searchRestaurants(searchTerm)

    if (result.success) {
      const scopedRestaurants = managerRestaurantId
        ? filterRestaurantsByAssignedId(result.data || [], managerRestaurantId)
        : (result.data || [])
      set({
        restaurants: scopedRestaurants,
        filters: { ...get().filters, search: searchTerm },
        loading: false,
      })
    } else {
      set({
        error: result.error,
        loading: false,
      })
    }

    return result
  },

  // Getters
  getFilteredRestaurants: () => {
    const state = get()
    let filtered = state.restaurants

    // Aplicar filtros
    if (state.filters.search) {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(state.filters.search.toLowerCase())
      )
    }

    if (state.filters.status) {
      filtered = filtered.filter((r) => r.status === state.filters.status)
    }

    // Aplicar orden
    filtered.sort((a, b) => {
      const aVal = a[state.sortBy]
      const bVal = b[state.sortBy]

      if (typeof aVal === 'string') {
        return state.sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return state.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })

    return filtered
  },

  getTotalCount: () => get().restaurants.length,

  getRestaurantById: (id) =>
    get().restaurants.find((r) => (r._id || r.id) === id),
}))

export default useRestaurantStore
