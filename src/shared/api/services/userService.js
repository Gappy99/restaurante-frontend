import authClient from '../authClient'
import { getAssignedRestaurantId, getAssignedRestaurantName, normalizeRole } from '../../utils/roles'

const resolveUserId = (payload) =>
  payload?.id ||
  payload?._id ||
  payload?.usuario_id ||
  payload?.user_id ||
  payload?.data?.id ||
  payload?.data?._id ||
  payload?.data?.usuario_id ||
  payload?.data?.user_id ||
  payload?.user?.id ||
  payload?.user?._id ||
  payload?.usuario?.id ||
  payload?.usuario?._id ||
  null

const extractApiErrorMessage = (error) => {
  const message = error?.response?.data?.message
  const errors = error?.response?.data?.errors

  if (Array.isArray(errors) && errors.length > 0) {
    const detailed = errors
      .map((item) => item?.msg || item?.message || item?.path)
      .filter(Boolean)
      .join(', ')

    if (detailed) {
      return `${message || 'Error de validación'}: ${detailed}`
    }
  }

  return message || error?.message || 'No se pudo crear el usuario'
}

const normalizeUser = (user) => ({
  ...user,
  _id: user._id || user.idusuario || user.id,
  name: user.name || '',
  surname: user.surname || '',
  username: user.username || '',
  email: user.email || '',
  user_age: user.user_age || 0,
  rol: user.rol || user.role || user.contact_position || 'CLIENTE',
  restauranteAsignado:
    user.restauranteAsignado ||
    user.restaurantAsignado ||
    user.restaurant_id ||
    user.restaurantId ||
    null,
  restauranteAsignadoId: getAssignedRestaurantId(user),
  restauranteAsignadoNombre: getAssignedRestaurantName(user),
})

// Servicio para obtener usuarios desde el backend
export const getUsers = async () => {
  try {
    const response = await authClient.get('/users')
    const users =
      response.data?.users ||
      response.data?.data ||
      response.data?.usuarios ||
      response.data

    return Array.isArray(users) ? users.map(normalizeUser) : []
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return []
  }
}

// Servicio para crear un usuario
export const createUser = async (userData) => {
  try {
    const role = normalizeRole(userData.rol || userData.role || userData.contact_position || 'CLIENTE')
    const normalizedEmail = String(userData.email || userData.contact_email || '').trim().toLowerCase()
    const normalizedUsername = String(
      userData.username || userData.user_name || userData.contact_username || normalizedEmail.split('@')[0] || ''
    ).trim().toLowerCase()
    const normalizedPhone = String(userData.telefono || userData.phone || userData.contact_phone_number || '')
      .replace(/\D/g, '')
    const assignedRestaurantId =
      userData.restauranteAsignado ||
      userData.restaurantAsignado ||
      userData.restaurant_id ||
      userData.restaurantId ||
      null

    const registerPayload = {
      nombre: userData.nombre || userData.name || userData.contact_name || '',
      username: normalizedUsername,
      email: normalizedEmail,
      telefono: normalizedPhone,
      password: userData.password || '',
      rol: role,
      rol_id: role,
      restauranteAsignado: role === 'GERENTE' ? assignedRestaurantId : null,
    }
    
    const registerResponse = await authClient.post('/register', registerPayload)
    const createdRaw = registerResponse.data?.user || registerResponse.data?.data || registerResponse.data

    return normalizeUser(createdRaw)

  } catch (error) {
    console.error('Error al crear usuario:', error)
    error.message = extractApiErrorMessage(error)
    throw error
  }
}

// Servicio para actualizar un usuario
export const updateUser = async (id, userData) => {
  try {
    const role = normalizeRole(userData.rol || userData.role || userData.contact_position || 'CLIENTE')
    const payload = {
      nombre: userData.nombre || userData.name || userData.contact_name || '',
      username: userData.username || userData.user_name || userData.contact_username || '',
      email: userData.email || userData.contact_email || '',
      telefono: userData.telefono || userData.phone || userData.contact_phone_number || '',
      rol: role,
      rol_id: role,
      restauranteAsignado:
        role === 'GERENTE'
          ? (userData.restauranteAsignado ||
            userData.restaurantAsignado ||
            userData.restaurant_id ||
            userData.restaurantId ||
            null)
          : null,
    }
    const response = await authClient.put(`/users/${id}`, payload)
    return normalizeUser(response.data?.user || response.data?.data || response.data)
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    throw error
  }
}

// Servicio para eliminar un usuario
export const deleteUser = async (id) => {
  try {
    const response = await authClient.delete(`/users/${id}`)
    return response.data
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    throw error
  }
}

// Servicio para obtener el perfil del usuario autenticado
export const getProfile = async (token) => {
  try {
    let response = await authClient.get('/me', { headers: { Authorization: `Bearer ${token}` } })

    // Si el servidor responde 304 o no retorna body, reintentar forzando bypass de cache
    if (response.status === 304 || !response.data || (typeof response.data === 'object' && Object.keys(response.data).length === 0)) {
      response = await authClient.get(`/me?_=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } })
    }

    const raw = response.data || {}
    const user = raw.data || raw.user || raw.userDetails || raw

    const profile = {
      nombre: user.nombre || user.name || user.username || user.fullName || '',
      email: user.email || '',
      telefono: user.telefono || user.phone || user.contact_phone_number || '',
      rol: user.rol || user.role || '',
      restauranteAsignado:
        user.restauranteAsignado ||
        user.restaurantAsignado ||
        user.restaurant_id ||
        user.restaurantId ||
        null,
      restauranteAsignadoNombre: getAssignedRestaurantName(user),
    }

    return { success: true, data: profile }
  } catch (error) {
    console.error('Error al obtener perfil:', error)
    return { success: false, error: error.response?.data?.message || error.message }
  }
}

export default {
  getUsers,
  createUser,
  updateUser,
  deleteUser
  ,getProfile
}