import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import useAuthStore from '../../../shared/stores/useAuthStore'
import useReservationStore from '../../../shared/stores/useReservationStore'
import reservationService from '../../../shared/api/services/reservationService'
import { restaurantService } from '../../restaurant/services/restaurantService'
import { tableService } from '../../tables/services/tableService'
import Modal from '../../../shared/components/Modal'
import Table from '../../../shared/components/Table'

const ReservationsPage = () => {
  const { user } = useAuthStore()
  const { reservations, loading } = useReservationStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState(null)
  const [restaurants, setRestaurants] = useState([])
  const isAdmin = user?.rol === 'ADMIN'

  useEffect(() => {
    loadReservations()
    loadRestaurants()
  }, [user])

  const loadReservations = async () => {
    useReservationStore.getState().setLoading(true)
    const params = isAdmin ? {} : { userId: user?._id }
    const data = await reservationService.getReservations(params)
    if (data) {
      useReservationStore.getState().setReservations(data)
    }
    useReservationStore.getState().setLoading(false)
  }

  const loadRestaurants = async () => {
    const result = await restaurantService.getRestaurants()
    setRestaurants(result.success ? result.data : [])
  }

  const loadTables = async (restaurantId) => {
    if (!restaurantId) {
      setTables([])
      return
    }

    const result = await tableService.getTables({ restaurantId })
    setTables(result.success ? result.data : [])
  }

  const handleOpenModal = (reservation = null) => {
    console.log('✏️ Editar reservación seleccionado:', reservation)
    setEditingReservation(reservation)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingReservation(null)
    setIsModalOpen(false)
  }

  const handleCancel = async (id) => {
    console.log('🛑 Cancelar reservación seleccionado:', id)
    if (!window.confirm('¿Deseas cancelar esta reservación?')) return
    const result = await reservationService.cancelReservation(id)
    console.log('🛑 Cancelar reservación resultado:', result)
    await loadReservations()
  }

  const columns = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'hora', label: 'Hora' },
    { key: 'personas', label: 'Personas' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'estado', label: 'Estado' },
    { key: 'mesa', label: 'Mesa' },
    { key: 'notas', label: 'Notas' },
  ]

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservaciones</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Administra reservaciones de clientes y confirma estados en tiempo real.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          + Nueva Reservación
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Cargando reservaciones...</div>
        ) : reservations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No se encontraron reservaciones.
          </div>
        ) : (
          <Table
            columns={columns}
            data={reservations}
            onEdit={handleOpenModal}
            onDelete={handleCancel}
            actionLabels={{ edit: 'Editar', delete: 'Cancelar' }}
          />
        )}
      </div>

      <ReservationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reservation={editingReservation}
        currentUser={user}
        isAdmin={isAdmin}
        restaurants={restaurants}
        onSuccess={async () => {
          await loadReservations()
          handleCloseModal()
        }}
      />
    </div>
  )
}

const ReservationModal = ({ isOpen, onClose, reservation, currentUser, isAdmin, restaurants, onSuccess }) => {
  console.log('🎯 ReservationModal render:', { isOpen, currentUser, isAdmin, reservation })
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      cliente: currentUser?.nombre || '',
      email: currentUser?.email || '',
      fecha: reservation?.fecha || reservation?.reservation_date || '',
      hora: reservation?.hora || reservation?.reservation_time || '',
      personas:
        reservation?.personas ||
        reservation?.number_of_people ||
        reservation?.guest_count ||
        reservation?.people ||
        reservation?.party_size ||
        1,
      tipo: reservation?.tipo || reservation?.reservation_type || 'mesa',
      table_id:
        reservation?.table_id ||
        reservation?.mesa ||
        reservation?.table?._id ||
        reservation?.table?.table_id ||
        reservation?.table?.id ||
        '',
      estado: reservation?.estado || reservation?.status || 'PENDIENTE',
      notas:
        reservation?.notas ||
        reservation?.notes ||
        reservation?.reservation_history ||
        reservation?.description ||
        reservation?.details ||
        '',
      restaurant_id:
        reservation?.restaurant_id ||
        reservation?.restaurantId ||
        reservation?.restaurant?._id ||
        '',
    },
  })

  const rawSelectedRestaurantId = watch('restaurant_id')
  const selectedRestaurantId =
    rawSelectedRestaurantId && typeof rawSelectedRestaurantId === 'object'
      ? rawSelectedRestaurantId._id || rawSelectedRestaurantId.restaurant_id || rawSelectedRestaurantId.id || ''
      : rawSelectedRestaurantId || ''
  const selectedType = watch('tipo')
  const [tables, setTables] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const normalizeRestaurantParam = (restaurantId) => {
    if (!restaurantId) return ''
    if (typeof restaurantId === 'object') {
      return restaurantId._id || restaurantId.restaurant_id || restaurantId.id || ''
    }
    return String(restaurantId)
  }

  const loadTables = async (restaurantId) => {
    const normalizedRestaurantId = normalizeRestaurantParam(restaurantId)
    if (!normalizedRestaurantId) {
      setTables([])
      return
    }

    const result = await tableService.getTables({ restaurantId: normalizedRestaurantId })
    setTables(result.success ? result.data : [])
  }

  useEffect(() => {
    reset({
      cliente: reservation?.cliente || currentUser?.nombre || '',
      email: reservation?.email || currentUser?.email || '',
      fecha: reservation?.fecha || reservation?.reservation_date || '',
      hora: reservation?.hora || reservation?.reservation_time || '',
      personas:
        reservation?.personas ||
        reservation?.number_of_people ||
        reservation?.guest_count ||
        reservation?.people ||
        reservation?.party_size ||
        1,
      tipo: reservation?.tipo || reservation?.reservation_type || 'mesa',
      table_id:
        reservation?.table_id ||
        reservation?.mesa ||
        reservation?.table?._id ||
        reservation?.table?.table_id ||
        reservation?.table?.id ||
        '',
      estado: reservation?.estado || reservation?.status || 'PENDIENTE',
      notas:
        reservation?.notas ||
        reservation?.notes ||
        reservation?.reservation_history ||
        reservation?.description ||
        reservation?.details ||
        '',
      restaurant_id:
        reservation?.restaurant_id ||
        reservation?.restaurantId ||
        reservation?.restaurant?._id ||
        '',
    })
  }, [reservation, currentUser, reset])

  useEffect(() => {
    loadTables(selectedRestaurantId)
  }, [selectedRestaurantId])

  // Reset table_id when restaurant changes
  useEffect(() => {
    if (selectedRestaurantId) {
      reset((prev) => ({
        ...prev,
        table_id: '',
      }))
    }
  }, [selectedRestaurantId, reset])

  const onError = (formErrors) => {
    console.log('❌ Form validation errors:', formErrors)
  }

  const onSubmit = async (data) => {
    try {
      console.log('🚀 onSubmit function called with data:', data)
      console.log('🚀 Current user:', currentUser)
      console.log('🚀 Is admin:', isAdmin)

      if (!isAdmin) {
        console.log('❌ User is not admin - blocking submission')
        toast.error('Solo los administradores pueden crear reservaciones')
        return
      }

      // Validate table selection for mesa reservations
      if (data.tipo === 'mesa' && (!data.table_id || data.table_id === '')) {
        toast.error('Debe seleccionar una mesa para reservaciones de tipo mesa')
        return
      }

      console.log('Submitting reservation with data:', data)
      setIsSubmitting(true)

    const payload = {
      cliente: data.cliente || currentUser?.nombre,
      client_name: data.cliente || currentUser?.nombre,
      email: data.email || currentUser?.email,
      client_email: data.email || currentUser?.email,
      reservation_date: data.fecha,
      reservation_time: data.hora,
      personas: String(data.personas),
      estado: data.estado,
      notas: data.notas,
      notes: data.notas,
      reservation_history: data.notas,
      description: data.notas,
      details: data.notas,
      restaurant_id: data.restaurant_id,
      reservation_type: data.tipo || 'mesa',
      reservation_price: 0,
    }

    console.log('Raw form data:', data)
    console.log('Date format:', data.fecha, typeof data.fecha)
    console.log('Time format:', data.hora, typeof data.hora)

    if (data.tipo === 'mesa' && data.table_id && data.table_id !== '') {
      payload.table_id = data.table_id
      console.log('Table ID being sent:', data.table_id)
      console.log('Available tables:', tables)
    } else {
      payload.table_id = null
    }

    console.log('Final reservation payload:', payload)
    console.log('Restaurant ID in payload:', payload.restaurant_id)
    console.log('Table ID in payload:', payload.table_id)

    // Verify table exists and belongs to restaurant
    if (payload.table_id) {
      const selectedTable = tables.find(table => (table.table_id || table._id || table.id) === payload.table_id)
      console.log('Selected table object:', selectedTable)
      console.log('Table ID being sent:', payload.table_id)
      console.log('All available table IDs:', tables.map(t => t.table_id || t._id || t.id))
      if (!selectedTable) {
        console.error('Table not found in available tables!')
        toast.error('La mesa seleccionada no existe o no pertenece a este restaurante')
        setIsSubmitting(false)
        return
      }
    }

    if (reservation?._id) {
      await reservationService.updateReservation(reservation._id, payload)
      toast.success('Reservación actualizada con éxito')
    } else {
      const { estado, ...createPayload } = payload
      await reservationService.createReservation(createPayload)
      toast.success('Reservación registrada con éxito')
    }

    setIsSubmitting(false)
    onSuccess()
    } catch (error) {
      console.error('❌ Error in onSubmit:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reservation ? 'Editar Reservación' : 'Nueva Reservación'}
    >
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4" onSubmitCapture={(e) => console.log('📝 Form onSubmit triggered', e)}>
        <div>
          <select
            aria-label="Restaurante"
            {...register('restaurant_id', { required: 'Restaurante requerido' })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Seleccionar restaurante</option>
            {restaurants.map((rest) => (
              <option key={rest._id} value={rest._id}>
                {rest.restaurant_name}
              </option>
            ))}
          </select>
          {errors.restaurant_id && <p className="text-red-500 text-sm">{errors.restaurant_id.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              aria-label="Cliente"
              {...register('cliente', { required: 'Nombre requerido' })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Nombre del cliente"
              disabled={!isAdmin && !!currentUser?.nombre}
            />
            {errors.cliente && <p className="text-red-500 text-sm">{errors.cliente.message}</p>}
          </div>

          <div>
            <input
              aria-label="Email"
              {...register('email', { required: 'Email requerido' })}
              type="email"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="correo@cliente.com"
              disabled={!isAdmin && !!currentUser?.email}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <select
              aria-label="Tipo"
              {...register('tipo')}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="mesa">Mesa</option>
              <option value="domicilio">Domicilio</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              aria-label="Fecha"
              type="date"
              {...register('fecha', { required: 'Fecha requerida' })}
              className="w-full px-4 py-2 border rounded-lg"
            />
            {errors.fecha && <p className="text-red-500 text-sm">{errors.fecha.message}</p>}
          </div>

          <div>
            <input
              aria-label="Hora"
              type="time"
              {...register('hora', { required: 'Hora requerida' })}
              className="w-full px-4 py-2 border rounded-lg"
            />
            {errors.hora && <p className="text-red-500 text-sm">{errors.hora.message}</p>}
          </div>

          <div>
            <input
              aria-label="Personas"
              type="number"
              {...register('personas', {
                required: 'Cantidad requerida',
                min: { value: 1, message: 'Debe ser al menos 1' },
              })}
              className="w-full px-4 py-2 border rounded-lg"
            />
            {errors.personas && <p className="text-red-500 text-sm">{errors.personas.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedType !== 'domicilio' ? (
            <div>
              <select
                aria-label="Mesa"
                {...register('table_id', {
                  validate: (value) =>
                    selectedType === 'domicilio' || value ? true : 'Mesa requerida',
                })}
                className="w-full px-4 py-2 border rounded-lg"
                disabled={!selectedRestaurantId || tables.length === 0}
              >
                <option value="">Seleccionar mesa</option>
                {tables.map((table) => {
                  const id = table.table_id || table._id || table.id
                  console.log('Rendering table option:', { id, name: table.table_name, number: table.table_number })
                  return (
                    <option key={id} value={id}>
                      {`Mesa ${table.table_number || ''}${table.table_name ? ` - ${table.table_name}` : ''}`}
                    </option>
                  )
                })}
              </select>
              {errors.table_id && <p className="text-red-500 text-sm">{errors.table_id.message}</p>}
              {!selectedRestaurantId && (
                <p className="text-gray-500 text-sm mt-1">Selecciona un restaurante primero.</p>
              )}
              {selectedRestaurantId && tables.length === 0 && (
                <p className="text-gray-500 text-sm mt-1">No hay mesas registradas para este restaurante.</p>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700">
              No es necesario seleccionar una mesa para domicilios.
            </div>
          )}

          {isAdmin && (
              <div>
              <select
                aria-label="Estado"
                {...register('estado')}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="EN_PROCESO">En proceso</option>
                <option value="FINALIZADA">Finalizada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
          )}
        </div>

        <div>
          <textarea
            aria-label="Notas adicionales"
            {...register('notas')}
            className="w-full px-4 py-2 border rounded-lg min-h-[120px]"
            placeholder="Indica solicitudes, alergias o detalles especiales"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            onClick={() => console.log('🔥 Submit button clicked!')}
          >
            {isSubmitting ? 'Guardando...' : reservation ? 'Actualizar' : 'Crear reservación'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ReservationsPage
