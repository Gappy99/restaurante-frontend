import { create } from 'zustand'
import { informationService } from '../services/informationService.js'
import { restaurantService } from '../../restaurant/services/restaurantService.js'

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
    const result = await restaurantService.getRestaurants()

    if (result.success) {
      set({ restaurants: result.data || [] })
    }

    return result
  },

  loadInformations: async (restaurantId = '') => {
    set({ loading: true, error: null })
    const result = await informationService.getInformations({ restaurantId })

    if (result.success) {
      set({
        informations: result.data || [],
        filters: { ...get().filters, restaurantId },
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
