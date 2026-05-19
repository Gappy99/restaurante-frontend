import { create } from 'zustand'
import { informationService } from '../services/informationService.js'
import { restaurantService } from '../../restaurant/services/restaurantService.js'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { filterByRestaurant } from '../../../shared/utils/restaurantScope'
import { getAssignedRestaurantId, isManagerRole } from '../../../shared/utils/roles'

const useInformationStore = create((set, get) => ({
  informations: [],
  restaurants: [],
  currentInformation: null,
  loading: false,
  error: null,
  filters: {
    restaurantId: '',
  },

  setInformations: (informations) => set({ informations }),
  setRestaurants: (restaurants) => set({ restaurants }),
  setCurrentInformation: (currentInformation) => set({ currentInformation }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  clearError: () => set({ error: null }),
  clearCurrentInformation: () => set({ currentInformation: null }),

  loadRestaurants: async () => {
    const user = useAuthStore.getState().user
    const managerRestaurantId = isManagerRole(user?.rol) ? getAssignedRestaurantId(user) : ''
    const result = await restaurantService.getRestaurants(
      managerRestaurantId ? { restaurantId: managerRestaurantId } : {}
    )

    if (result.success) {
      const scopedRestaurants = managerRestaurantId
        ? filterByRestaurant(result.data || [], managerRestaurantId)
        : (result.data || [])
      set({ restaurants: scopedRestaurants })
    }

    return result
  },

  loadInformations: async (restaurantId = '') => {
    set({ loading: true, error: null })
    const user = useAuthStore.getState().user
    const managerRestaurantId = isManagerRole(user?.rol) ? getAssignedRestaurantId(user) : ''
    const scopedRestaurantId = restaurantId || managerRestaurantId || ''
    const result = await informationService.getInformations({ restaurantId: scopedRestaurantId })

    if (result.success) {
      const scopedInformations = scopedRestaurantId
        ? filterByRestaurant(result.data || [], scopedRestaurantId)
        : (result.data || [])
      set({
        informations: scopedInformations,
        filters: { ...get().filters, restaurantId: scopedRestaurantId },
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

  loadInformationById: async (id) => {
    set({ loading: true, error: null })
    const result = await informationService.getInformationById(id)

    if (result.success) {
      set({
        currentInformation: result.data,
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

  createInformation: async (informationData) => {
    set({ loading: true, error: null })
    const result = await informationService.createInformation(informationData)

    if (result.success) {
      set((state) => ({
        informations: [result.data, ...state.informations],
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

  updateInformation: async (id, informationData) => {
    set({ loading: true, error: null })
    const result = await informationService.updateInformation(id, informationData)

    if (result.success) {
      set((state) => ({
        informations: state.informations.map((item) =>
          (item._id || item.id) === id ? result.data : item
        ),
        currentInformation:
          (state.currentInformation?._id || state.currentInformation?.id) === id
            ? result.data
            : state.currentInformation,
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

  deleteInformation: async (id) => {
    set({ loading: true, error: null })
    const result = await informationService.deleteInformation(id)

    if (result.success) {
      set((state) => ({
        informations: state.informations.filter((item) => (item._id || item.id) !== id),
        currentInformation:
          (state.currentInformation?._id || state.currentInformation?.id) === id
            ? null
            : state.currentInformation,
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

  getInformationById: (id) =>
    get().informations.find((item) => (item._id || item.id) === id),
}))

export default useInformationStore
