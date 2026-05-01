import { create } from 'zustand'
import { restaurantService } from '../api/restaurantsApi'

const useRestaurantStore = create((set, get) => ({
  restaurants: [],
  loading: false,
  error: null,

  setRestaurants: (restaurants) => set({ restaurants }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  loadRestaurants: async () => {
    set({ loading: true, error: null })
    try {
      const data = await restaurantService.getRestaurants()
      set({ restaurants: data })
    } catch (error) {
      set({ error: error.message || 'Error al cargar restaurantes' })
    } finally {
      set({ loading: false })
    }
  },

  addRestaurant: (restaurant) =>
    set((state) => ({
      restaurants: [
        ...state.restaurants,
        { ...restaurant, _id: Date.now().toString() },
      ],
    })),

  updateRestaurant: (id, updatedRestaurant) =>
    set((state) => ({
      restaurants: state.restaurants.map((restaurant) =>
        restaurant._id === id
          ? { ...restaurant, ...updatedRestaurant }
          : restaurant
      ),
    })),

  deleteRestaurant: (id) =>
    set((state) => ({
      restaurants: state.restaurants.filter((restaurant) => restaurant._id !== id),
    })),

  getRestaurantById: (id) => get().restaurants.find((restaurant) => restaurant._id === id),
}))

export default useRestaurantStore
