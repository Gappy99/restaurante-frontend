import { useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import Modal from '../../../shared/components/Modal'
import reservationService from '../../../shared/api/services/reservationService'
import { getReservationDisplayStatus, getReservationStatusStyles } from '../utils/reservationStatus'

export default function ReservationViewModal({ isOpen, onClose, reservation, onReservationUpdated }) {
  const navigate = useNavigate()
  const [showCancelPrompt, setShowCancelPrompt] = useState(false)

  if (!isOpen || !reservation) return null

  const restaurantName = reservation.restaurant_name || reservation.restaurant?.restaurant_name || reservation.restaurant?.name || 'Restaurante'
  const date = reservation.fecha || reservation.reservation_date || 'Sin fecha'
  const time = reservation.hora || reservation.reservation_time || 'Sin hora'
  const people = reservation.personas || reservation.number_of_people || reservation.guest_count || 1
  const table = reservation.mesa || reservation.table || reservation.table_name || 'Sin mesa'
  const status = getReservationDisplayStatus(reservation)
  const notes = reservation.notas || reservation.notes || reservation.description || reservation.details || 'Sin observaciones'
  const canModify = status !== 'CANCELADA' && status !== 'COMPLETADA'

  const handleCancelReservation = async () => {
    const id = reservation?._id || reservation?.id
    if (!id) return

    const result = await reservationService.cancelReservation(id)
    if (result) {
      onReservationUpdated?.(result)
      onClose()
    }
  }

  const handleEditReservation = () => {
    const id = reservation?._id || reservation?.id
    if (!id) return

    sessionStorage.setItem('customer:editingReservation', JSON.stringify(reservation))
    onClose()
    navigate(`/customer/reservations/${id}/edit`)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle de reservación">
      <div className="space-y-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Restaurante</p>
          <p className="mt-1 font-semibold text-gray-900">{restaurantName}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Fecha</p>
            <p className="mt-1 font-semibold text-gray-900">{date}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Hora</p>
            <p className="mt-1 font-semibold text-gray-900">{time}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Personas</p>
            <p className="mt-1 font-semibold text-gray-900">{people}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Mesa</p>
            <p className="mt-1 font-semibold text-gray-900">{table}</p>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Estado</p>
          <p className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.25em] ${getReservationStatusStyles(status)}`}>
            {status}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Notas</p>
          <p className="mt-1 text-gray-700 leading-relaxed">{notes}</p>
        </div>

        {canModify && (
          <div className="pt-2 flex flex-col gap-3">
            {showCancelPrompt && (
              <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p className="font-semibold">¿Deseas cancelar esta reservación?</p>
                <p className="mt-1 text-xs">Esta acción no se puede deshacer.</p>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCancelPrompt(false)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelReservation}
                    className="rounded-lg bg-red-600 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-white"
                  >
                    Sí, cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCancelPrompt(true)}
                className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-red-700"
              >
                Cancelar reservación
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

ReservationViewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reservation: PropTypes.object,
  onReservationUpdated: PropTypes.func,
}
 