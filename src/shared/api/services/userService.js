import axios from 'axios'

const apiUrl = 'http://localhost:3006/api/users' // Cambia a tu URL de API

// Servicio para obtener usuarios
export const getUsers = async () => {
  try {
    const response = await axios.get(apiUrl)
    return response.data
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return []
  }
}

// Servicio para crear un usuario
export const createUser = async (userData) => {
  try {
    const response = await axios.post(apiUrl, userData)
    return response.data
  } catch (error) {
    console.error('Error al crear usuario:', error)
  }
}

// Servicio para actualizar un usuario
export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`${apiUrl}/${id}`, userData)
    return response.data
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
  }
}

// Servicio para eliminar un usuario
export const deleteUser = async (id) => {
  try {
    await axios.delete(`${apiUrl}/${id}`)
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
  }
}

export default {
  getUsers,
  createUser,
  updateUser,
  deleteUser
}