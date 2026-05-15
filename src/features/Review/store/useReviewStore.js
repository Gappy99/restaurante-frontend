import { create } from 'zustand'
import toast from 'react-hot-toast'
import {
  createReview as createReviewRequest,
  deleteReview as deleteReviewRequest,
  getReviews as getReviewsRequest,
  updateReview as updateReviewRequest,
} from '../api/reviewApi'

const normalizeId = (value) => value?._id || value?.id || value || null
const toReviewArray = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.reviews)) return payload.reviews
  return []
}

export const useReviewStore = create((set, get) => ({
  reviews: [],
  loading: false,
  error: null,
  restaurantFilter: '',

  fetchReviews: async (restaurantId = '') => {
    try {
      set({ loading: true, error: null, restaurantFilter: restaurantId })
      const response = await getReviewsRequest(restaurantId || null)
      const payload = toReviewArray(response.data)
      set({ reviews: payload, loading: false })
      return { success: true, data: payload }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al cargar las reseñas'
      set({ error: message, loading: false, reviews: [] })
      toast.error(message)
      return { success: false, error: message }
    }
  },

  saveReview: async (formData, id = null) => {
    try {
      set({ loading: true, error: null })

      if (id) {
        await updateReviewRequest(id, formData)
        toast.success('Reseña actualizada exitosamente')
      } else {
        await createReviewRequest(formData)
        toast.success('Reseña creada exitosamente')
      }

      await get().fetchReviews(get().restaurantFilter)
      set({ loading: false })
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al guardar la reseña'
      set({ error: message, loading: false })
      toast.error(message)
      return { success: false, error: message }
    }
  },

  removeReview: async (id) => {
    try {
      set({ loading: true, error: null })
      await deleteReviewRequest(id)
      toast.success('Reseña eliminada exitosamente')
      await get().fetchReviews(get().restaurantFilter)
      set({ loading: false })
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar la reseña'
      set({ error: message, loading: false })
      toast.error(message)
      return { success: false, error: message }
    }
  },

  setRestaurantFilter: (restaurantId) => set({ restaurantFilter: restaurantId }),

  getReviewById: (id) => get().reviews.find((review) => normalizeId(review) === id),
}))