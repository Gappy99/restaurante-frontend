export const asId = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value?._id || value?.id || value?.Orders_id || ''
}

export const formatDateTime = (value) => {
  if (!value) return 'Sin fecha'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return date.toLocaleString('es-ES')
}

export const extractDetalleList = (resp) => {
  if (!resp) return []
  if (Array.isArray(resp)) return resp
  if (Array.isArray(resp?.data)) return resp.data
  if (Array.isArray(resp?.detallePedidos)) return resp.detallePedidos
  return []
}

export const getInvoiceStatusLabel = (status) => {
  const normalized = String(status || 'pendiente').toLowerCase()
  if (normalized === 'pagada') return 'Pagada'
  if (normalized === 'cancelada') return 'Cancelada'
  if (normalized === 'emitida') return 'Emitida'
  return 'Pendiente'
}

export const getInvoiceStatusClass = (status) => {
  const normalized = String(status || 'pendiente').toLowerCase()
  if (normalized === 'pagada') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
  if (normalized === 'cancelada') return 'border-rose-500/30 bg-rose-500/10 text-rose-200'
  if (normalized === 'emitida') return 'border-sky-500/30 bg-sky-500/10 text-sky-200'
  return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-200'
}