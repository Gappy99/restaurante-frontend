const normalizeStatus = (status) => {
  const normalized = String(status || 'PENDIENTE').trim().toUpperCase()

  if (normalized === 'CANCELED') return 'CANCELADA'
  if (normalized === 'DONE') return 'COMPLETADA'

  return normalized
}

export const parseReservationDateTime = (reservation) => {
  const dateValue = reservation?.fecha || reservation?.reservation_date || reservation?.date || ''
  const timeValue = reservation?.hora || reservation?.reservation_time || reservation?.time || '00:00'

  if (!dateValue) return null

  const timePart = typeof timeValue === 'string' && timeValue.length >= 5 ? timeValue.slice(0, 5) : '00:00'
  const candidate = new Date(`${dateValue}T${timePart}`)

  return Number.isNaN(candidate.getTime()) ? null : candidate
}

export const getReservationDisplayStatus = (reservation, now = new Date()) => {
  const rawStatus = normalizeStatus(
    reservation?.estado || reservation?.status || reservation?.state || reservation?.reservation_status
  )

  if (rawStatus === 'CANCELADA' || rawStatus === 'COMPLETADA') {
    return rawStatus
  }

  const reservationDateTime = parseReservationDateTime(reservation)
  if (reservationDateTime && now >= reservationDateTime) {
    return 'LISTA'
  }

  return rawStatus || 'PENDIENTE'
}

export const getReservationStatusStyles = (status) => {
  const normalized = normalizeStatus(status)

  const styles = {
    PENDIENTE: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
    CONFIRMADA: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
    LISTA: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200',
    CANCELADA: 'border-red-400/40 bg-red-400/10 text-red-200',
    COMPLETADA: 'border-blue-400/40 bg-blue-400/10 text-blue-200',
  }

  return styles[normalized] || 'border-[#FCF0CA]/30 bg-black/20 text-[#FCF0CA]'
}

export const normalizeReservationStatus = normalizeStatus
