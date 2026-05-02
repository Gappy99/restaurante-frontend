import adminClient from '../adminClient'
import authClient from '../authClient'

const normalizeContact = (contact) => ({
  ...contact,
  _id: contact._id || contact.contact_id,
  nombre: contact.contact_name || contact.nombre || '',
  email: contact.contact_email || contact.email || '',
  rol: contact.contact_position || contact.rol || 'CLIENTE',
  telefono: contact.contact_phone_number || contact.telefono || '',
})

// Servicio para obtener contactos (usuarios en el backend)
export const getUsers = async () => {
  try {
    const response = await adminClient.get('/contact')
    const contacts = response.data.contacts || response.data || []
    return Array.isArray(contacts) ? contacts.map(normalizeContact) : []
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return []
  }
}

// Servicio para crear un contacto/usuario
export const createUser = async (userData) => {
  try {
    // Mapear campos del frontend al backend
    const contactData = {
      contact_type: userData.contact_type || 'CLIENTE',
      contact_name: userData.contact_name || userData.nombre || '',
      contact_position: userData.contact_position || userData.rol || 'CLIENTE',
      contact_phone_number: userData.contact_phone_number || userData.telefono || '',
      contact_email: userData.contact_email || userData.email || ''
    }
    const response = await adminClient.post('/contact', contactData)
    return normalizeContact(response.data.contact || response.data)
  } catch (error) {
    console.error('Error al crear usuario:', error)
    throw error
  }
}

// Servicio para actualizar un contacto/usuario
export const updateUser = async (id, userData) => {
  try {
    // Mapear campos del frontend al backend
    const contactData = {
      contact_type: userData.contact_type || 'CLIENTE',
      contact_name: userData.contact_name || userData.nombre || '',
      contact_position: userData.contact_position || userData.rol || 'CLIENTE',
      contact_phone_number: userData.contact_phone_number || userData.telefono || '',
      contact_email: userData.contact_email || userData.email || ''
    }
    const response = await adminClient.put(`/contact/${id}`, contactData)
    return normalizeContact(response.data.contact || response.data)
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    throw error
  }
}

// Servicio para eliminar un contacto/usuario
export const deleteUser = async (id) => {
  try {
    const response = await adminClient.delete(`/contact/${id}`)
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