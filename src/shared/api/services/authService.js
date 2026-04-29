import toast from 'react-hot-toast'

const USERS_STORAGE_KEY = 'restaurant-auth-users'
const TOKENS_STORAGE_KEY = 'restaurant-auth-tokens'

const getUsers = () => {
  const stored = localStorage.getItem(USERS_STORAGE_KEY)
  if (!stored) {
    const seedUsers = [
      {
        _id: 'u1',
        nombre: 'Administrador',
        username: 'admin',
        email: 'admin@admin.com',
        telefono: '+57 300 000 0000',
        rol: 'ADMIN',
        password: 'admin123',
      },
    ]
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(seedUsers))
    return seedUsers
  }
  return JSON.parse(stored)
}

const saveUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

const getTokens = () => {
  const stored = localStorage.getItem(TOKENS_STORAGE_KEY)
  return stored ? JSON.parse(stored) : {}
}

const saveTokens = (tokens) => {
  localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens))
}

const createToken = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

const storeToken = (token, userId) => {
  const tokens = getTokens()
  tokens[token] = userId
  saveTokens(tokens)
}

const resolveUserByToken = (token) => {
  const tokens = getTokens()
  const userId = tokens[token]
  if (!userId) return null
  return getUsers().find((user) => user._id === userId) || null
}

/**
 * Servicio de Autenticación
 * Maneja login, registro, logout y renovación de token
 */
export const authService = {
  login: async (email, password) => {
    const users = getUsers()
    const user = users.find(
      (item) => item.email === email && item.password === password
    )

    if (!user) {
      toast.error('Email o contraseña incorrectos')
      return { success: false, error: 'Credenciales inválidas' }
    }

    const token = createToken()
    const refreshToken = createToken()
    storeToken(token, user._id)
    storeToken(refreshToken, user._id)

    return {
      success: true,
      token,
      refreshToken,
      user: { ...user, password: undefined },
    }
  },

  register: async (userData) => {
    const users = getUsers()
    const alreadyExists = users.some(
      (item) => item.email === userData.email || item.username === userData.username
    )
    if (alreadyExists) {
      toast.error('El email o usuario ya está registrado')
      return { success: false, error: 'Email o usuario en uso' }
    }

    const newUser = {
      _id: `u${Date.now()}`,
      nombre: userData.nombre,
      username: userData.username,
      email: userData.email,
      telefono: userData.telefono,
      rol: userData.rol || 'CLIENTE',
      password: userData.password,
    }

    users.push(newUser)
    saveUsers(users)

    toast.success('Registro exitoso')
    return { success: true, user: { ...newUser, password: undefined } }
  },

  getCurrentUser: async (token) => {
    const user = resolveUserByToken(token)
    if (!user) {
      return { success: false, error: 'Token inválido' }
    }
    return { success: true, user: { ...user, password: undefined } }
  },

  logout: () => {
    return { success: true }
  },
}
