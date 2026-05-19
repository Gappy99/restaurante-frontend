export const toRestaurantId = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value

  return (
    value?._id ||
    value?.id ||
    value?.restaurant_id ||
    value?.restaurantId ||
    value?.idusuario ||
    ''
  )
}

export const getEntityRestaurantIds = (entity) => {
  if (!entity || typeof entity !== 'object') return []

  const candidates = [
    entity.restaurantId,
    entity.restaurant_id,
    entity.Restaurant_id,
    entity.restaurant,
    entity.restaurant_ids,
    entity.restaurants,
    entity.restauranteAsignado,
    entity.restaurantAsignado,
  ]

  const ids = []

  const pushId = (candidate) => {
    if (!candidate && candidate !== 0) return
    if (Array.isArray(candidate)) {
      candidate.forEach(pushId)
      return
    }

    const id = toRestaurantId(candidate)
    if (id) ids.push(id)
  }

  candidates.forEach(pushId)
  return Array.from(new Set(ids))
}

export const matchesRestaurant = (entity, restaurantId) => {
  const targetId = toRestaurantId(restaurantId)
  if (!targetId) return true

  const ids = getEntityRestaurantIds(entity)
  if (ids.length === 0) return false

  return ids.some((id) => String(id) === String(targetId))
}

export const filterByRestaurant = (items, restaurantId) => {
  if (!Array.isArray(items)) return []
  const targetId = toRestaurantId(restaurantId)
  if (!targetId) return items
  return items.filter((item) => matchesRestaurant(item, targetId))
}