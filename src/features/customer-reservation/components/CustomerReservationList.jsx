import PropTypes from 'prop-types'
import CustomerReservationCard from './CustomerReservationCard'

export default function CustomerReservationList({ reservations, loading, onView }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#7F532C] border-t-[#FCF0CA]" />
        <p className="text-xs font-mono uppercase tracking-[0.35em] text-[#F5D9A5]/80">Cargando reservaciones...</p>
      </div>
    )
  }

  if (!Array.isArray(reservations) || reservations.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[#FCF0CA]/20 bg-black/20 px-6 py-16 text-center">
        <p className="text-lg font-bold text-[#FCF0CA]">No hay reservaciones disponibles</p>
        <p className="mt-2 text-sm text-[#F5D9A5]/70">
          Aquí verás tus reservaciones cuando el backend devuelva registros.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {reservations.map((reservation) => (
        <CustomerReservationCard
          key={reservation._id || reservation.id}
          reservation={reservation}
          onView={onView}
        />
      ))}
    </div>
  )
}

CustomerReservationList.propTypes = {
  reservations: PropTypes.array,
  loading: PropTypes.bool,
  onView: PropTypes.func.isRequired,
}
