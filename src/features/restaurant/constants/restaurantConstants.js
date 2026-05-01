/**
 * Constantes del feature Restaurant
 */

export const RESTAURANT_MESSAGES = {
  FETCH_SUCCESS: 'Restaurantes cargados exitosamente',
  FETCH_ERROR: 'Error al cargar restaurantes',
  CREATE_SUCCESS: 'Restaurante creado exitosamente',
  CREATE_ERROR: 'Error al crear restaurante',
  UPDATE_SUCCESS: 'Restaurante actualizado exitosamente',
  UPDATE_ERROR: 'Error al actualizar restaurante',
  DELETE_SUCCESS: 'Restaurante eliminado exitosamente',
  DELETE_ERROR: 'Error al eliminar restaurante',
  VALIDATION_ERROR: 'Por favor verifica los datos del formulario',
}

export const RESTAURANT_API_ENDPOINTS = {
  BASE: '/restaurant',
  LIST: '/restaurant',
  CREATE: '/restaurant',
  DETAIL: (id) => `/restaurant/${id}`,
  UPDATE: (id) => `/restaurant/${id}`,
  DELETE: (id) => `/restaurant/${id}`,
  SEARCH: '/restaurant/search',
}

export const RESTAURANT_DEFAULTS = {
  PAGE_SIZE: 10,
  SORT_BY: 'name',
  SORT_ORDER: 'asc',
  INITIAL_CAPACITY: 50,
}

// Tipos de restaurante (restaurant_type)
export const RESTAURANT_TYPES = [
  'Fast Food',
  'Casual',
  'Fine Dining',
  'Buffet',
  'Café',
  'Pizzería',
  'Comida Rápida',
]

// Tipos gastronómicos (restaurant_type_gastronomic)
export const GASTRONOMIC_TYPES = [
  'Italiana',
  'Mexicana',
  'China',
  'Japonesa',
  'Americana',
  'Española',
  'Francesa',
  'Peruana',
  'Tailandesa',
  'Vegetariana',
  'Fusión',
  'Tradicional',
]

// Horarios predefinidos
export const DEFAULT_TIME_START = '10:00'
export const DEFAULT_TIME_CLOSE = '23:00'
