/**
 * Utilidades del feature Restaurant
 */

/**
 * Formatea los datos del formulario al formato esperado por la API del backend
 * Mapea campos del frontend a nombres del backend
 */
export const formatRestaurantData = (formData) => {
  const data = new FormData()

  // Mapear campos del frontend a backend
  data.append('restaurant_name', formData.name?.trim() || '')
  data.append('restaurant_type', formData.type || '')
  data.append('restaurant_type_gastronomic', formData.gastronomicType || '')
  data.append('restaurant_direction', formData.address?.trim() || '')
  data.append('restaurant_time_start', formData.timeStart || '10:00')
  data.append('restaurant_time_close', formData.timeClose || '23:00')
  data.append('restaurant_mean_price', formData.meanPrice || 0)

  // Si hay archivo de imagen
  if (formData.image instanceof File) {
    data.append('restaurant_images', formData.image)
  }

  return data
}

/**
 * Valida los campos obligatorios del restaurante según backend
 */
export const validateRestaurantForm = (data) => {
  const errors = {}

  if (!data.name?.trim()) {
    errors.name = 'El nombre del restaurante es requerido'
  }

  if (!data.type?.trim()) {
    errors.type = 'El tipo de restaurante es requerido'
  }

  if (!data.gastronomicType?.trim()) {
    errors.gastronomicType = 'El tipo gastronómico es requerido'
  }

  if (!data.address?.trim()) {
    errors.address = 'La dirección es requerida'
  }

  if (!data.timeStart) {
    errors.timeStart = 'La hora de apertura es requerida'
  }

  if (!data.timeClose) {
    errors.timeClose = 'La hora de cierre es requerida'
  }

  if (!data.meanPrice || parseFloat(data.meanPrice) < 0) {
    errors.meanPrice = 'El precio promedio debe ser mayor a 0'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

/**
 * Obtiene etiqueta de estado para mostrar (el backend usa boolean)
 */
export const getRestaurantStatusLabel = (estado) => {
  return estado === true || estado === 'true' ? 'Activo' : 'Inactivo'
}

/**
 * Ordena restaurantes
 */
export const sortRestaurants = (restaurants, sortBy, sortOrder = 'asc') => {
  const sorted = [...restaurants].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]

    if (typeof aVal === 'string') {
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
  })

  return sorted
}

/**
 * Filtra restaurantes por búsqueda
 */
export const filterRestaurants = (restaurants, searchTerm) => {
  if (!searchTerm?.trim()) return restaurants

  const term = searchTerm.toLowerCase()

  return restaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(term) ||
    restaurant.description?.toLowerCase().includes(term) ||
    restaurant.address?.toLowerCase().includes(term)
  )
}
