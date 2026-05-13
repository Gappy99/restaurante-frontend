import { create } from 'zustand'
import { eventService } from '../services/eventService.js'

const useEventStore = create((set, get) => ({
  events: [],
  currentEvent: null,
  loading: false,
  error: null,

  setEvents: (events) => set({ events }),
  setCurrentEvent: (currentEvent) => set({ currentEvent }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  clearCurrentEvent: () => set({ currentEvent: null }),

  fetchEvents: async (params = {}) => {
    set({ loading: true, error: null })
    const result = await eventService.getEvents(params)
    if (result.success) {
      set({ events: result.data, loading: false })
    } else {
      set({ error: result.error, loading: false })
    }
    return result
  },

  fetchEventById: async (id) => {
    set({ loading: true, error: null })
    const result = await eventService.getEventById(id)
    if (result.success) {
      set({ currentEvent: result.data, loading: false })
    } else {
      set({ error: result.error, loading: false })
    }
    return result
  },

  createEvent: async (eventData) => {
    set({ loading: true, error: null })
    const result = await eventService.createEvent(eventData)
    if (result.success) {
      set((state) => ({ events: [...state.events, result.data], loading: false }))
    } else {
      set({ error: result.error, loading: false })
    }
    return result
  },

  updateEvent: async (id, eventData) => {
    set({ loading: true, error: null })
    const result = await eventService.updateEvent(id, eventData)
    if (result.success) {
      set((state) => ({
        events: state.events.map((item) =>
          (item._id || item.id) === id ? result.data : item
        ),
        currentEvent:
          (state.currentEvent?._id || state.currentEvent?.id) === id
            ? result.data
            : state.currentEvent,
        loading: false,
      }))
    } else {
      set({ error: result.error, loading: false })
    }
    return result
  },

  deleteEvent: async (id) => {
    set({ loading: true, error: null })
    const result = await eventService.deleteEvent(id)
    if (result.success) {
      set((state) => ({
        events: state.events.filter((item) => (item._id || item.id) !== id),
        loading: false,
      }))
    } else {
      set({ error: result.error, loading: false })
    }
    return result
  },

  getEventById: (id) =>
    get().events.find((item) => (item._id || item.id) === id),
}))

export default useEventStore
