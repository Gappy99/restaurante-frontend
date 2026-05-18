import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import useUserStore from '../../../shared/stores/useUserStore'
import userService from '../../../shared/api/services/userService'

import Modal from '../../../shared/components/Modal'
import Table from '../../../shared/components/Table'

/**
 * Página de Gestión de Usuarios (CRUD)
 */
const UsersPage = () => {
  const { users, loading } = useUserStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const usersData = await userService.getUsers()
    useUserStore.getState().setUsers(usersData) // Guarda los usuarios en el store
  }

  const handleOpenModal = (user = null) => {
    if (user) {
      // Mapear campos del backend al formato del formulario
      setEditingUser({
        _id: user._id || user.contact_id,
        nombre: user.contact_name || user.nombre || '',
        email: user.contact_email || user.email || '',
        telefono: user.contact_phone_number || user.telefono || '',
        rol: user.contact_position || user.rol || 'CLIENTE',
        contact_type: user.contact_type || 'CLIENTE'
      })
    } else {
      setEditingUser(null)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingUser(null)
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      await userService.deleteUser(id)
      await loadUsers()
    }
  }

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'rol', label: 'Rol' },
    { key: 'telefono', label: 'Teléfono' },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)]">Gestión de Usuarios</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2 bg-[var(--primary)] hover:bg-[#000000] text-[var(--surface)] rounded-lg font-semibold transition"
        >
          + Nuevo Usuario
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-[var(--muted)]">Cargando usuarios...</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-[var(--muted)]">
            No hay usuarios registrados
          </div>
        ) : (
          <Table
            columns={columns}
            data={users}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
          />
        )}
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={editingUser}
        onSuccess={async () => {
          await loadUsers()
          handleCloseModal()
        }}
      />
    </div>
  )
}

const UserModal = ({ isOpen, onClose, user, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: user || {},
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    reset(user || {})
  }, [user, reset])

  const onSubmit = async (data) => {
    setIsSubmitting(true)

    try {
      if (user?._id) {
        await userService.updateUser(user._id, data)
      } else {
        await userService.createUser({ ...data, rol: 'CLIENTE' })
      }

      onSuccess()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Editar Usuario' : 'Nuevo Usuario'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            aria-label="Nombre"
            {...register('nombre', { required: 'Nombre requerido' })}
            placeholder="Nombre"
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre.message}</p>}
        </div>

        <div>
          <input
            aria-label="Email"
            {...register('email', { required: 'Email requerido' })}
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <input
            aria-label="Teléfono"
            {...register('telefono')}
            placeholder="Teléfono"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">
            Cancelar
          </button>

          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#1f2937] text-[#f8fafc] rounded-lg">
            {isSubmitting ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default UsersPage