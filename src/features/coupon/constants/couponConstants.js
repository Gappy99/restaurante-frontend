export const COUPON_MESSAGES = {
  FETCH_SUCCESS: 'Cupones cargados exitosamente',
  FETCH_ERROR: 'Error al cargar cupones',
  CREATE_SUCCESS: 'Cupón creado exitosamente',
  CREATE_ERROR: 'Error al crear cupón',
  UPDATE_SUCCESS: 'Cupón actualizado exitosamente',
  UPDATE_ERROR: 'Error al actualizar cupón',
  DELETE_SUCCESS: 'Cupón desactivado exitosamente',
  DELETE_ERROR: 'Error al desactivar cupón',
  VALIDATION_ERROR: 'Por favor verifica los datos del formulario',
}

export const COUPON_API_ENDPOINTS = {
  BASE: '/coupon',
  LIST: '/coupon',
  CREATE: '/coupon',
  DETAIL: (id) => `/coupon/${id}`,
  UPDATE: (id) => `/coupon/${id}`,
  DELETE: (id) => `/coupon/${id}`,
}

export const COUPON_DEFAULTS = {
  PAGE_SIZE: 10,
  SORT_BY: 'createdAt',
  SORT_ORDER: 'desc',
}