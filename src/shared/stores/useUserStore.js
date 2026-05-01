import { create } from 'zustand'

const useUserStore = create((set) => ({
  users: [
    { _id: '1', nombre: 'Juan Pérez', email: 'juan@example.com', rol: 'ADMIN', telefono: '123-456-7890' },
    { _id: '2', nombre: 'Ana López', email: 'ana@example.com', rol: 'CLIENTE', telefono: '987-654-3210' },
    { _id: '3', nombre: 'Carlos García', email: 'carlos@example.com', rol: 'ADMIN', telefono: '555-666-7777' },
  ],
  loading: false,
  error: null,

  // Funciones
  setUsers: (users) => set({ users }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Simulación de CRUD
  addUser: (user) =>
    set((state) => ({
      users: [...state.users, { ...user, _id: Date.now().toString() }],
    })),

  updateUser: (id, updatedUser) =>
    set((state) => ({
      users: state.users.map((user) =>
        user._id === id ? { ...user, ...updatedUser } : user
      ),
    })),

  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user._id !== id),
    })),

  getUserById: (id) => get().users.find((user) => user._id === id),
}))

export default useUserStore