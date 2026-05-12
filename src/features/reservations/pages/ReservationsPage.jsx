import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import useAuthStore from '../../../shared/stores/useAuthStore'
import useReservationStore from '../../../shared/stores/useReservationStore'
import reservationService from '../../../shared/api/services/reservationService'
import Modal from '../../../shared/components/Modal'
import Table from '../../../shared/components/Table'

const ReservationsPage = () => {
  const { user } = useAuthStore()
  const { reservations, loading } = useReservationStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState(null)
  const isAdmin = user?.rol === 'ADMIN'

  useEffect(() => {
    loadReservations()
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

  const handleOpenModal = (reservation = null) => {
    setEditingReservation(reservation)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingReservation(null)
    setIsModalOpen(false)
  }

  const handleCancel = async (id) => {
    if (!window.confirm('¿Deseas cancelar esta reservación?')) return
    await reservationService.cancelReservation(id)
    await loadReservations()
  }

  const columns = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'hora', label: 'Hora' },
    { key: 'personas', label: 'Personas' },
    { key: 'estado', label: 'Estado' },
    { key: 'mesa', label: 'Mesa' },
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
        onSuccess={async () => {
          await loadReservations()
          handleCloseModal()
        }}
      />
    </div>
  )
}

const ReservationModal = ({ isOpen, onClose, reservation, currentUser, isAdmin, onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      cliente: currentUser?.nombre || '',
      email: currentUser?.email || '',
      fecha: reservation?.fecha || '',
      hora: reservation?.hora || '',
      personas: reservation?.personas || 1,
      mesa: reservation?.mesa || '',
      estado: reservation?.estado || 'PENDIENTE',
      notas: reservation?.notas || '',
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    reset({
      cliente: reservation?.cliente || currentUser?.nombre || '',
      email: reservation?.email || currentUser?.email || '',
      fecha: reservation?.fecha || '',
      hora: reservation?.hora || '',
      personas: reservation?.personas || 1,
      mesa: reservation?.mesa || '',
      estado: reservation?.estado || 'PENDIENTE',
      notas: reservation?.notas || '',
    })
  }, [reservation, currentUser, reset])

  const onSubmit = async (data) => {
    setIsSubmitting(true)

    const payload = {
      ...data,
      userId: currentUser?._id,
      cliente: data.cliente || currentUser?.nombre,
      email: data.email || currentUser?.email,
    }

    if (reservation?._id) {
      await reservationService.updateReservation(reservation._id, payload)
      toast.success('Reservación actualizada con éxito')
    } else {
      await reservationService.createReservation(payload)
      toast.success('Reservación registrada con éxito')
    }

    setIsSubmitting(false)
    onSuccess()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reservation ? 'Editar Reservación' : 'Nueva Reservación'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <input
              {...register('cliente', { required: 'Nombre requerido' })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Nombre del cliente"
              disabled={!isAdmin && !!currentUser?.nombre}
            />
            {errors.cliente && <p className="text-red-500 text-sm">{errors.cliente.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              {...register('email', { required: 'Email requerido' })}
              type="email"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="correo@cliente.com"
              disabled={!isAdmin && !!currentUser?.email}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              {...register('fecha', { required: 'Fecha requerida' })}
              className="w-full px-4 py-2 border rounded-lg"
            />
            {errors.fecha && <p className="text-red-500 text-sm">{errors.fecha.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
            <input
              type="time"
              {...register('hora', { required: 'Hora requerida' })}
              className="w-full px-4 py-2 border rounded-lg"
            />
            {errors.hora && <p className="text-red-500 text-sm">{errors.hora.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Personas</label>
            <input
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mesa</label>
            <input
              {...register('mesa')}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Número o área"
            />
          </div>

          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
          <textarea
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
          >
            {isSubmitting ? 'Guardando...' : reservation ? 'Actualizar' : 'Crear reservación'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ReservationsPage
