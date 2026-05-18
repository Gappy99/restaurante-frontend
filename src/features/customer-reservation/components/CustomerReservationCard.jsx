import PropTypes from 'prop-types'
import { getReservationDisplayStatus, getReservationStatusStyles } from '../utils/reservationStatus'

export default function CustomerReservationCard({ reservation, onView }) {
  const restaurantName = reservation.restaurant_name || reservation.restaurant?.restaurant_name || reservation.restaurant?.name || 'Restaurante'
  const date = reservation.fecha || reservation.reservation_date || 'Sin fecha'
  const time = reservation.hora || reservation.reservation_time || 'Sin hora'
  const people = reservation.personas || reservation.number_of_people || reservation.guest_count || 1
  const table = reservation.mesa || reservation.table || reservation.table_name || 'Sin mesa'
  const status = getReservationDisplayStatus(reservation)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#FCF0CA]/10 bg-black/30 shadow-lg shadow-black/20 transition-transform duration-300 hover:-translate-y-1 hover:border-[#FCF0CA]/25">
      <div className="bg-gradient-to-br from-[#7F532C] via-[#5B300E] to-[#2E160C] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#F5D9A5]/70">Reservación</p>
            <h2 className="mt-3 text-2xl font-black leading-tight text-[#FCF0CA] truncate">{restaurantName}</h2>
          </div>
          <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] ${getReservationStatusStyles(status)}`}>
            {status}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-[#FCF0CA]">
          <div className="rounded-2xl border border-[#FCF0CA]/15 bg-black/20 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#F5D9A5]/70">Fecha</p>
            <p className="mt-1 font-semibold">{date}</p>
          </div>
          <div className="rounded-2xl border border-[#FCF0CA]/15 bg-black/20 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#F5D9A5]/70">Hora</p>
            <p className="mt-1 font-semibold">{time}</p>
          </div>
          <div className="rounded-2xl border border-[#FCF0CA]/15 bg-black/20 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#F5D9A5]/70">Personas</p>
            <p className="mt-1 font-semibold">{people}</p>
          </div>
          <div className="rounded-2xl border border-[#FCF0CA]/15 bg-black/20 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#F5D9A5]/70">Mesa</p>
            <p className="mt-1 font-semibold truncate">{table}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <button
          type="button"
          onClick={() => onView(reservation)}
          className="mt-auto inline-flex items-center justify-center rounded-2xl bg-[#FCF0CA] px-5 py-3 text-sm font-black uppercase tracking-[0.25em] text-[#5B300E] transition hover:bg-white"
        >
          Ver detalles
        </button>
      </div>
    </article>
  )
}

CustomerReservationCard.propTypes = {
  reservation: PropTypes.object.isRequired,
  onView: PropTypes.func.isRequired,
}
