/**
 * Constantes del feature Tables
 */

export const TABLE_MESSAGES = {
	FETCH_SUCCESS: 'Mesas cargadas exitosamente',
	FETCH_ERROR: 'Error al cargar mesas',
	CREATE_SUCCESS: 'Mesa creada exitosamente',
	CREATE_ERROR: 'Error al crear mesa',
	UPDATE_SUCCESS: 'Mesa actualizada exitosamente',
	UPDATE_ERROR: 'Error al actualizar mesa',
	DELETE_SUCCESS: 'Mesa eliminada exitosamente',
	DELETE_ERROR: 'Error al eliminar mesa',
	VALIDATION_ERROR: 'Por favor verifica los datos de la mesa',
}

export const TABLE_API_ENDPOINTS = {
	BASE: '/table',
	LIST: '/table',
	CREATE: '/table',
	DETAIL: (id) => `/table/${id}`,
	UPDATE: (id) => `/table/${id}`,
	DELETE: (id) => `/table/${id}`,
	LAYOUT: (restaurantId) => `/table/layout/${restaurantId}`,
}

export const TABLE_DEFAULTS = {
	PAGE_SIZE: 10,
	SORT_BY: 'table_number',
	SORT_ORDER: 'asc',
}

export const TABLE_STATES = ['Disponible', 'Ocupada', 'Reservada']

export const TABLE_STATUS = {
	ACTIVE: true,
	INACTIVE: false,
}

export const TABLE_SORT_BY = {
	NUMBER: 'table_number',
	NAME: 'table_name',
	CAPACITY: 'table_capacity',
	STATE: 'table_state',
	CREATED_AT: 'createdAt',
}
