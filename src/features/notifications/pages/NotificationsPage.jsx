import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import useAuthStore from '../../../shared/stores/useAuthStore'
import useNotificationStore from '../../../shared/stores/useNotificationStore'
import notificationService from '../../../shared/api/services/notificationService'
import Modal from '../../../shared/components/Modal'

const NotificationsPage = () => {
  const { user } = useAuthStore()
  const { notifications, loading } = useNotificationStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNotification, setEditingNotification] = useState(null)
  const isAdmin = user?.rol === 'ADMIN'

  useEffect(() => {
    loadNotifications()
  }, [user])

  const loadNotifications = async () => {
    useNotificationStore.getState().setLoading(true)
    const params = isAdmin ? {} : { userId: user?._id }
    const data = await notificationService.getNotifications(params)
    if (data) {
      useNotificationStore.getState().setNotifications(data)
    }
    useNotificationStore.getState().setLoading(false)
  }

  const handleOpenModal = (notification = null) => {
    setEditingNotification(notification)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingNotification(null)
    setIsModalOpen(false)
  }

  const handleToggleRead = async (notification) => {
    await notificationService.updateNotification(notification._id, {
      read: !notification.read,
    })
    await loadNotifications()
  }

  const safeNotifications = Array.isArray(notifications) ? notifications : []
  const rows = safeNotifications.map((notification) => ({
    ...notification,
    estado: notification.read ? 'Leída' : 'Pendiente',
  }))

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Mantén al cliente informado con confirmaciones de reservaciones, tiempos de espera y el estado de pedidos.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            + Enviar notificación
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Cargando notificaciones...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay notificaciones disponibles.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Asunto</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tipo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((notification) => (
                  <tr key={notification._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">
                      <div className="font-semibold">{notification.title || notification.asunto || 'Sin asunto'}</div>
                      <div className="text-sm text-gray-500 mt-1">{notification.message}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{notification.type || 'General'}</td>
                    <td className="px-6 py-4 text-gray-700">{notification.estado}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(notification.createdAt || notification.fecha || Date.now()).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => handleToggleRead(notification)}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 text-sm font-semibold transition"
                      >
                        {notification.read ? 'Marcar pendiente' : 'Marcar leída'}
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenModal(notification)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-semibold transition"
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NotificationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        notification={editingNotification}
        onSuccess={async () => {
          await loadNotifications()
          handleCloseModal()
        }}
      />
    </div>
  )
}

const NotificationModal = ({ isOpen, onClose, notification, onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: notification?.title || '',
      message: notification?.message || '',
      type: notification?.type || 'Información',
      read: notification?.read || false,
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    reset({
      title: notification?.title || '',
      message: notification?.message || '',
      type: notification?.type || 'Información',
      read: notification?.read || false,
    })
  }, [notification, reset])

  const onSubmit = async (data) => {
    setIsSubmitting(true)

    if (notification?._id) {
      await notificationService.updateNotification(notification._id, data)
      toast.success('Notificación actualizada correctamente')
    } else {
      await notificationService.createNotification(data)
      toast.success('Notificación enviada correctamente')
    }

    setIsSubmitting(false)
    onSuccess()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={notification ? 'Editar Notificación' : 'Nueva Notificación'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
          <input
            {...register('title', { required: 'Asunto requerido' })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Reservación confirmada, tiempo de espera, etc."
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
          <textarea
            {...register('message', { required: 'Mensaje requerido' })}
            className="w-full px-4 py-2 border rounded-lg min-h-[120px]"
            placeholder="Escribe el mensaje que se enviará al cliente"
          />
          {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            {...register('type')}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="Información">Información</option>
            <option value="Confirmación">Confirmación</option>
            <option value="Alerta">Alerta</option>
            <option value="Recordatorio">Recordatorio</option>
          </select>
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
            {isSubmitting ? 'Guardando...' : notification ? 'Actualizar' : 'Enviar notificación'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default NotificationsPage
