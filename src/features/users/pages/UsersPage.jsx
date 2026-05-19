import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import useUserStore from '../../../shared/stores/useUserStore'
import userService from '../../../shared/api/services/userService'
import { restaurantService } from '../../restaurant/services/restaurantService'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { getAssignedRestaurantId } from '../../../shared/utils/roles'

import Modal from '../../../shared/components/Modal'
import Table from '../../../shared/components/Table'

/**
 * Página de Gestión de Usuarios (CRUD)
 */
const UsersPage = () => {
  const { users, loading } = useUserStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [restaurants, setRestaurants] = useState([])
  const currentUser = useAuthStore((state) => state.user)
  const assignedRestaurantId = getAssignedRestaurantId(currentUser)

  const loadUsers = async () => {
    const usersData = await userService.getUsers()
    useUserStore.getState().setUsers(usersData) // Guarda los usuarios en el store
  }

  const loadRestaurants = async () => {
    const result = await restaurantService.getRestaurants()
    const restaurantList = result.success ? result.data : []

    if (assignedRestaurantId) {
      setRestaurants(
        restaurantList.filter((restaurant) => (restaurant._id || restaurant.id) === assignedRestaurantId)
      )
      return
    }

    setRestaurants(restaurantList)
  }

  useEffect(() => {
    loadUsers()
    loadRestaurants()
  }, [assignedRestaurantId])

  const handleOpenModal = (user = null) => {
    if (user) {
      // Mapear campos del backend al formato del formulario
      setEditingUser({
        _id: user._id || user.contact_id,
        nombre: user.contact_name || user.nombre || '',
        username: user.username || user.user_name || '',
        email: user.contact_email || user.email || '',
        telefono: user.contact_phone_number || user.telefono || '',
        rol: user.contact_position || user.rol || 'CLIENTE',
        restauranteAsignado:
          user.restauranteAsignadoId ||
          user.restauranteAsignado?._id ||
          user.restauranteAsignado?.id ||
          user.restaurant_id ||
          user.restaurantId ||
          '',
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
    { key: 'restauranteAsignadoNombre', label: 'Restaurante' },
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
        restaurants={restaurants}
      />
    </div>
  )
}

const UserModal = ({ isOpen, onClose, user, onSuccess, restaurants }) => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: user || {},
  })
  const selectedRole = watch('rol')

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    reset(user || {})
  }, [user, reset])

  const onSubmit = async (data) => {
    setIsSubmitting(true)

    try {
      if (!user && data.password !== data.confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      if (user?._id) {
        await userService.updateUser(user._id, data)
      } else {
        await userService.createUser(data)
      }

      onSuccess()
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'No se pudo guardar el usuario')
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
            {...register('email', {
              required: 'Email requerido',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: 'Email inválido',
              },
            })}
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <input
            aria-label="Teléfono"
            {...register('telefono', {
              required: 'Teléfono requerido',
              pattern: {
                value: /^\d{8}$/,
                message: 'El teléfono debe tener 8 dígitos',
              },
            })}
            placeholder="Teléfono"
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono.message}</p>}
        </div>

        <div>
          <input
            aria-label="Usuario"
            {...register('username', {
              required: user ? false : 'Usuario requerido',
              minLength: {
                value: 3,
                message: 'Mínimo 3 caracteres',
              },
            })}
            placeholder="Usuario"
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
        </div>

        {!user && (
          <>
            <div>
              <input
                aria-label="Contraseña"
                type="password"
                {...register('password', {
                  required: 'Contraseña requerida',
                  minLength: {
                    value: 8,
                    message: 'Mínimo 8 caracteres',
                  },
                })}
                placeholder="Contraseña"
                className="w-full px-4 py-2 border rounded-lg"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <div>
              <input
                aria-label="Confirmar contraseña"
                type="password"
                {...register('confirmPassword', {
                  required: 'Confirmar contraseña requerida',
                  validate: (value, formValues) => value === formValues.password || 'Las contraseñas no coinciden',
                })}
                placeholder="Confirmar contraseña"
                className="w-full px-4 py-2 border rounded-lg"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
            </div>
          </>
        )}

        <div>
          <select
            aria-label="Rol"
            {...register('rol', { required: 'Rol requerido' })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="CLIENTE">Cliente</option>
            <option value="GERENTE">Gerente</option>
            {user?.rol === 'ADMIN' && <option value="ADMIN">Admin</option>}
          </select>
          {errors.rol && <p className="text-red-500 text-sm">{errors.rol.message}</p>}
        </div>

        <div>
          <select
            aria-label="Restaurante asignado"
            {...register('restauranteAsignado', {
              validate: (value) => {
                if ((selectedRole || user?.rol || 'CLIENTE') !== 'GERENTE') return true
                return value ? true : 'Debes asignar un restaurante al gerente'
              },
            })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Selecciona un restaurante</option>
            {restaurants.map((restaurant) => {
              const id = restaurant._id || restaurant.id
              return (
                <option key={id} value={id}>
                  {restaurant.restaurant_name || restaurant.name || `Restaurante ${id}`}
                </option>
              )
            })}
          </select>
          <p className="text-xs text-gray-500 mt-1">Obligatorio para el rol Gerente.</p>
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