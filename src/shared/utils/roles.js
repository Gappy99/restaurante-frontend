export const ROLES = {
  CLIENTE: 'CLIENTE',
  ADMIN: 'ADMIN',
  GERENTE: 'GERENTE',
}

export const normalizeRole = (role) => String(role || '').trim().toUpperCase()

export const isClientRole = (role) => normalizeRole(role) === ROLES.CLIENTE

export const isManagerRole = (role) => normalizeRole(role) === ROLES.GERENTE

export const isAdminRole = (role) => normalizeRole(role) === ROLES.ADMIN

export const isPrivilegedRole = (role) => isAdminRole(role) || isManagerRole(role)

export const getAssignedRestaurantId = (user) => {
  // Accept many possible backend shapes: object, string id, or explicit id fields
  const restaurant =
    user?.restauranteAsignado ||
    user?.restaurantAsignado ||
    user?.restaurant_id ||
    user?.restaurantId ||
    // some backends send the id under this property
    user?.restauranteAsignadoId ||
    user?.restaurante_asignado_id ||
    user?.restaurante_asignado ||
    null

  if (!restaurant) return ''
  if (typeof restaurant === 'string') return restaurant

  return (
    restaurant?._id ||
    restaurant?.id ||
    restaurant?.restaurant_id ||
    restaurant?.restaurantId ||
    ''
  )
}

export const getAssignedRestaurantName = (user) => {
  const restaurant =
    user?.restauranteAsignado ||
    user?.restaurantAsignado ||
    user?.restaurant_id ||
    user?.restaurantId ||
    null

  if (!restaurant || typeof restaurant === 'string') return ''

  return restaurant?.restaurant_name || restaurant?.name || restaurant?.nombre || ''
}