const STORAGE_KEY = 'restaurante_events'

const getStoredEvents = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    console.error('Error leyendo eventos desde localStorage', error)
    return []
  }
}

const saveStoredEvents = (events) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch (error) {
    console.error('Error guardando eventos en localStorage', error)
  }
}

const buildEventPayload = ({ title, description, location, date, status }) => ({
  id: crypto?.randomUUID?.() || `${Date.now()}`,
  title: title?.trim() || '',
  description: description?.trim() || '',
  location: location?.trim() || '',
  date: date || '',
  status: status || 'active',
})

const normalizeEventList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.events)) return payload.events
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const normalizeEventItem = (payload) => {
  if (!payload || Array.isArray(payload)) return null
  return payload.event || payload.data || payload
}

const mapToStoredEvent = (eventData, id) => ({
  id: id || eventData.id || crypto?.randomUUID?.() || `${Date.now()}`,
  title: eventData.title?.trim() || '',
  description: eventData.description?.trim() || '',
  location: eventData.location?.trim() || '',
  date: eventData.date || '',
  status: eventData.status || 'active',
})

export const eventService = {
  getEvents: async () => {
    const events = getStoredEvents()
    return {
      success: true,
      data: normalizeEventList(events),
    }
  },

  getEventById: async (id) => {
    const events = getStoredEvents()
    const event = events.find((item) => item.id === id)
    if (!event) {
      return {
        success: false,
        error: 'Evento no encontrado',
      }
    }

    return {
      success: true,
      data: normalizeEventItem(event),
    }
  },

  createEvent: async (eventData) => {
    const events = getStoredEvents()
    const event = mapToStoredEvent(eventData)
    const normalizedEvent = normalizeEventItem(event)

    if (!normalizedEvent) {
      return {
        success: false,
        error: 'Datos de evento inválidos',
      }
    }

    const newEvents = [...events, normalizedEvent]
    saveStoredEvents(newEvents)

    return {
      success: true,
      data: normalizedEvent,
    }
  },

  updateEvent: async (id, eventData) => {
    const events = getStoredEvents()
    const existing = events.find((item) => item.id === id)
    if (!existing) {
      return {
        success: false,
        error: 'Evento no encontrado',
      }
    }

    const updatedEvent = mapToStoredEvent(eventData, id)
    const newEvents = events.map((item) => (item.id === id ? updatedEvent : item))
    saveStoredEvents(newEvents)

    return {
      success: true,
      data: updatedEvent,
    }
  },

  deleteEvent: async (id) => {
    const events = getStoredEvents()
    const newEvents = events.filter((item) => item.id !== id)
    saveStoredEvents(newEvents)
    return {
      success: true,
    }
  },
}
