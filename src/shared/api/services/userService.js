import adminClient from '../adminClient'
import authClient from '../authClient'

const normalizeUser = (user) => ({
  ...user,
  _id: user._id || user.idusuario || user.id,
  name: user.name || '',
  surname: user.surname || '',
  username: user.username || '',
  email: user.email || '',
  user_age: user.user_age || 0,
})

// Servicio para obtener usuarios desde el backend
export const getUsers = async () => {
  try {
    const response = await adminClient.get('/users')
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
    const payload = {
      nombre: userData.nombre || userData.name || userData.contact_name || '',
      email: userData.email || userData.contact_email || '',
      telefono: userData.telefono || userData.phone || userData.contact_phone_number || '',
      rol: userData.rol || userData.role || userData.contact_position || 'CLIENTE',
    }
    const response = await adminClient.post('/users', payload)
    return normalizeUser(response.data?.user || response.data?.data || response.data)
  } catch (error) {
    console.error('Error al crear usuario:', error)
    throw error
  }
}

// Servicio para actualizar un usuario
export const updateUser = async (id, userData) => {
  try {
    const payload = {
      nombre: userData.nombre || userData.name || userData.contact_name || '',
      email: userData.email || userData.contact_email || '',
      telefono: userData.telefono || userData.phone || userData.contact_phone_number || '',
      rol: userData.rol || userData.role || userData.contact_position || 'CLIENTE',
    }
    const response = await adminClient.put(`/users/${id}`, payload)
    return normalizeUser(response.data?.user || response.data?.data || response.data)
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    throw error
  }
}

// Servicio para eliminar un usuario
export const deleteUser = async (id) => {
  try {
    const response = await adminClient.delete(`/users/${id}`)
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