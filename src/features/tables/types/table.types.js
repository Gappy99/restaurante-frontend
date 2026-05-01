/**
 * Tipos y definiciones JSDoc para Table
 */

export const TABLE_STATUS_VALUES = {
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

/**
 * @typedef {Object} TableRestaurantRef
 * @property {string} _id
 * @property {string} restaurant_name
 * @property {string} restaurant_direction
 */

/**
 * @typedef {Object} TableRecord
 * @property {string} _id
 * @property {string} table_name
 * @property {number} table_number
 * @property {string} table_ubication
 * @property {number} table_capacity
 * @property {string} table_time_available
 * @property {'Disponible'|'Ocupada'|'Reservada'} table_state
 * @property {TableRestaurantRef|string} restaurant_id
 * @property {string|null} reserva_id
 * @property {boolean} estado
 * @property {string} disponibilidad
 */
