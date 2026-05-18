import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../../shared/stores/useAuthStore'
import reservationService from '../../../shared/api/services/reservationService'
import CustomerReservationList from '../components/CustomerReservationList'
import ReservationViewModal from '../components/ReservationViewModal'
import { getReservationDisplayStatus } from '../utils/reservationStatus'

const reservationBelongsToUser = (reservation, user) => {
  if (!user || !reservation) return false

  const targetIds = new Set([user._id, user.id, user.userId, user.uid].filter(Boolean))
  const targetEmails = new Set([user.email].filter(Boolean).map((e) => String(e).toLowerCase()))

  const matchPrimitive = (val) => {
    if (!val && val !== 0) return false
    const s = String(val)
    if (targetIds.has(s)) return true
    if (targetEmails.has(s.toLowerCase())) return true
    return false
  }

  // check common fields directly
  const directChecks = [
    reservation.user,
    reservation.client,
    reservation.customer,
    reservation.user_id,
    reservation.userId,
    reservation.client_id,
    reservation.clientId,
    reservation.customer_id,
    reservation.customerId,
    reservation.email,
    reservation.client_email,
    reservation.customer_email,
    reservation.cliente,
  ]

  for (const c of directChecks) {
    if (c == null) continue
    if (typeof c === 'object') {
      if (matchPrimitive(c._id) || matchPrimitive(c.id) || matchPrimitive(c.userId) || matchPrimitive(c.client_id) || matchPrimitive(c.clientId)) return true
      const e = c.email || c.client_email || c.customer_email
      if (e && matchPrimitive(e)) return true
    } else {
      if (matchPrimitive(c)) return true
    }
  }

  // shallow scan of reservation values for id/email matches (safe and broad)
  for (const key of Object.keys(reservation)) {
    const val = reservation[key]
    if (val == null) continue
    if (typeof val === 'string' || typeof val === 'number') {
      if (matchPrimitive(val)) return true
    } else if (typeof val === 'object') {
      // check one level deep
      for (const k2 of Object.keys(val)) {
        const v2 = val[k2]
        if (v2 == null) continue
        if (typeof v2 === 'string' || typeof v2 === 'number') {
          if (matchPrimitive(v2)) return true
        }
      }
    }
  }

  return false
}

export default function CustomerReservationView() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const loadReservations = async () => {
      setLoading(true)
      const data = await reservationService.getReservations({ userId: user?._id })
      const list = Array.isArray(data) ? data : []
      const owned = list.filter((r) => reservationBelongsToUser(r, user))
      setReservations(owned)
      setLoading(false)
    }

    loadReservations()
  }, [user?._id])

  const filteredReservations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const normalizedReservations = reservations.map((reservation) => ({
      ...reservation,
      displayStatus: getReservationDisplayStatus(reservation, now),
    }))

    if (!q) return normalizedReservations

    return normalizedReservations.filter((reservation) => {
      const restaurantName = (reservation.restaurant_name || reservation.restaurant?.restaurant_name || reservation.restaurant?.name || '').toLowerCase()
      const status = String(reservation.displayStatus || '').toLowerCase()
      const date = (reservation.fecha || reservation.reservation_date || '').toLowerCase()
      return restaurantName.includes(q) || status.includes(q) || date.includes(q)
    })
  }, [reservations, searchQuery, now])

  const handleView = (reservation) => {
    setSelectedReservation(reservation)
    setIsViewModalOpen(true)
  }

  return (
    <div className="min-h-full bg-[#2E160C] text-[#FCF0CA] px-4 py-8 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-7xl rounded-[2.5rem] border border-[#7F532C]/30 bg-[#5B300E]/20 px-6 py-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 border-b border-[#FCF0CA]/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#946841]">
              Mis Reservaciones
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#FCF0CA] sm:text-5xl">
              Revisa tus reservaciones
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[#F5D9A5]/80">
              Consulta el estado, fecha, mesa y notas de tus reservas registradas.
            </p>
          </div>

          <div className="rounded-2xl border border-[#FCF0CA]/10 bg-black/20 px-4 py-3 text-right">
            <div className="text-2xl font-black text-[#FCF0CA]">{filteredReservations.length}</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#946841]">reservaciones</div>
          </div>
        </div>

        <div className="mt-6 max-w-md">
          <input
            aria-label="Buscar reservaciones"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar, estado o fecha..."
            className="w-full rounded-2xl border border-[#FCF0CA]/20 bg-black/25 px-4 py-3 text-sm text-[#FCF0CA] placeholder:text-[#F5D9A5]/50 outline-none"
          />
        </div>

        <div className="mt-8">
          <CustomerReservationList
            reservations={filteredReservations}
            loading={loading}
            onView={handleView}
          />
        </div>
      </section>

      {isViewModalOpen && (
        <ReservationViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          reservation={selectedReservation}
          onReservationUpdated={async () => {
              const data = await reservationService.getReservations({ userId: user?._id })
              const list = Array.isArray(data) ? data : []
              const owned = list.filter((r) => reservationBelongsToUser(r, user))
              setReservations(owned)
          }}
        />
      )}
    </div>
  )
}
