export const RESTAURANT_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
}

export const RESTAURANT_SORT_BY = {
  NAME: 'restaurant_name',
  PRICE: 'restaurant_mean_price',
  DATE_CREATED: 'createdAt',
}

/**
 * @typedef {Object} Restaurant
 * @property {string} _id - ID único del restaurante (MongoDB)
 * @property {string} restaurant_name - Nombre del restaurante
 * @property {string} restaurant_type - Tipo de restaurante (Fast Food, Casual, etc)
 * @property {string} restaurant_type_gastronomic - Tipo gastronómico (Italiana, Mexicana, etc)
 * @property {string} restaurant_direction - Dirección del restaurante
 * @property {string} restaurant_time_start - Hora de apertura (HH:MM)
 * @property {string} restaurant_time_close - Hora de cierre (HH:MM)
 * @property {number} restaurant_mean_price - Precio promedio
 * @property {string[]} restaurant_images - URLs de imágenes del restaurante
 * @property {string} contact_id - ID del contacto (ObjectId)
 * @property {string} table_id - ID de referencia de mesa (ObjectId)
 * @property {boolean} estado - Estado del restaurante (true: activo, false: inactivo)
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de actualización
 */
