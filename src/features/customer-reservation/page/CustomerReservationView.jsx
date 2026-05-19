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

  // URL externa de imagen de fondo - mesa de restaurante reservada
  const reservationBackgroundImage = 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=1600&q=80'

  return (
    <div 
      className="relative min-h-full text-[#f8fafc] overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.55) 50%, rgba(0, 0, 0, 0.65) 100%), url(${reservationBackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Filtro decorativo sutil */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />

      {/* Contenedor simétrico central */}
      <div className="relative z-10 flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-10">
        <section className="w-full max-w-5xl">
          {/* Header centrado y simétrico */}
          <div className="text-center mb-12 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#9ca3af]">
              Experiencia Premium
            </p>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-[#f8fafc] drop-shadow-lg">
              Mis Reservaciones
            </h1>
            <p className="text-sm md:text-base text-[#d1d5db] drop-shadow-lg mx-auto max-w-2xl">
              Consulta y gestiona tus reservas registradas
            </p>
          </div>

          {/* Card glassmorphism principal - simétrica */}
          <div className="mx-auto rounded-[2rem] border border-white/10 bg-black/30 backdrop-blur-2xl shadow-2xl shadow-black/50">
            {/* Header de stats */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/5 px-6 sm:px-8 py-6">
              <div className="text-center sm:text-left flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#9ca3af]">
                  Estado
                </p>
                <h2 className="mt-2 text-3xl font-black text-[#f8fafc]">
                  Tus reservas
                </h2>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-center backdrop-blur-sm">
                <div className="text-3xl font-black text-white">{filteredReservations.length}</div>
                <div className="mt-1 text-[9px] uppercase tracking-[0.25em] text-[#9ca3af]">Total</div>
              </div>
            </div>

            {/* Buscador centrado */}
            <div className="px-6 sm:px-8 py-6 border-b border-white/5">
              <div className="flex justify-center">
                <input
                  aria-label="Buscar reservaciones"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar restaurante, estado o fecha..."
                  className="w-full sm:w-96 rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-[#f8fafc] placeholder:text-[#d1d5db]/40 outline-none transition focus:border-white/30 focus:bg-black/40 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Lista de reservaciones */}
            <div className="px-6 sm:px-8 py-8">
              <CustomerReservationList
                reservations={filteredReservations}
                loading={loading}
                onView={handleView}
              />
            </div>
          </div>

          {/* Espacio decorativo inferior simétrico */}
          <div className="mt-8 flex justify-center gap-2">
            <div className="h-1 w-1.5 rounded-full bg-white/20" />
            <div className="h-1 w-1.5 rounded-full bg-white/40" />
            <div className="h-1 w-1.5 rounded-full bg-white/20" />
          </div>
        </section>
      </div>

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
