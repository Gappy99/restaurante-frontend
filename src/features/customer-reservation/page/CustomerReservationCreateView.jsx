import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import useAuthStore from '../../../shared/stores/useAuthStore'
import reservationService from '../../../shared/api/services/reservationService'
import { tableService } from '../../tables/services/tableService'

const LAST_RESTAURANT_KEY = 'customer:lastRestaurant'
const EDITING_RESERVATION_KEY = 'customer:editingReservation'

export default function CustomerReservationCreateView() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const user = useAuthStore((state) => state.user)

  const locationReservation = location.state?.reservation || null
  const storedEditingReservation = (() => {
    try {
      const raw = sessionStorage.getItem(EDITING_RESERVATION_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  const editingReservation = locationReservation || storedEditingReservation || null
  const isEditing = Boolean(editingReservation || params?.id)

  const [restaurantContext, setRestaurantContext] = useState(null)
  const [tables, setTables] = useState([])
  const [loadingTables, setLoadingTables] = useState(false)
  const [layoutMap, setLayoutMap] = useState({})
  const [loadingLayout, setLoadingLayout] = useState(false)
  const [isTablePlanOpen, setIsTablePlanOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    reservation_date: '',
    reservation_time: '',
    personas: 1,
    reservation_type: 'mesa',
    table_id: '',
    notes: '',
  })

  useEffect(() => {
    if (editingReservation) {
      setRestaurantContext({
        id:
          editingReservation?.restaurant_id ||
          editingReservation?.restaurantId ||
          editingReservation?.restaurant?._id ||
          editingReservation?.restaurant?.id ||
          '',
        name:
          editingReservation?.restaurant_name ||
          editingReservation?.restaurant?.restaurant_name ||
          editingReservation?.restaurant?.name ||
          '',
      })
    }

    const raw = localStorage.getItem(LAST_RESTAURANT_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (parsed?.id && !editingReservation) {
        setRestaurantContext(parsed)
      }
    } catch {
      // ignore invalid cache
    }
  }, [])

  useEffect(() => {
    if (!editingReservation) return

    setFormData({
      reservation_date: editingReservation?.fecha || editingReservation?.reservation_date || '',
      reservation_time: editingReservation?.hora || editingReservation?.reservation_time || '',
      personas:
        editingReservation?.personas ||
        editingReservation?.number_of_people ||
        editingReservation?.guest_count ||
        1,
      reservation_type: editingReservation?.tipo || editingReservation?.reservation_type || 'mesa',
      table_id:
        editingReservation?.table_id ||
        editingReservation?.mesa ||
        editingReservation?.table?._id ||
        editingReservation?.table?.id ||
        '',
      notes:
        editingReservation?.notas ||
        editingReservation?.notes ||
        editingReservation?.description ||
        editingReservation?.details ||
        '',
    })
  }, [editingReservation])

  useEffect(() => {
    const loadTables = async () => {
      if (!restaurantContext?.id || formData.reservation_type !== 'mesa') {
        setTables([])
        setLayoutMap({})
        return
      }

      setLoadingTables(true)
      const result = await tableService.getTables({ restaurantId: restaurantContext.id })
      setTables(result?.success ? result.data : [])
      setLoadingTables(false)

      setLoadingLayout(true)
      const layoutResult = await tableService.getRestaurantLayout(restaurantContext.id)
      setLayoutMap(layoutResult?.success ? layoutResult.data || {} : {})
      setLoadingLayout(false)
    }

    loadTables()
  }, [restaurantContext?.id, formData.reservation_type])

  const userDisplayName = useMemo(
    () => user?.nombre || user?.name || user?.username || 'Cliente',
    [user]
  )

  const userEmail = useMemo(() => user?.email || '', [user])

  const isAvailableTable = (table) => {
    const state = String(table?.table_state || table?.state || table?.status || '').toUpperCase()
    if (!state) return true
    return ['DISPONIBLE', 'AVAILABLE', 'LIBRE'].includes(state)
  }

  const availableTables = useMemo(() => tables.filter(isAvailableTable), [tables])

  const getTableId = (table) => table?.table_id || table?._id || table?.id

  const requestedPeople = Number(formData.personas || 0)

  const maxTableCapacity = useMemo(() => {
    if (!Array.isArray(tables) || tables.length === 0) return 0

    return tables.reduce((max, table) => {
      const capacity = Number(table?.table_capacity || 0)
      return capacity > max ? capacity : max
    }, 0)
  }, [tables])

  const filteredTables = useMemo(() => {
    if (!requestedPeople || requestedPeople < 1) return availableTables

    if (maxTableCapacity > 0 && requestedPeople > maxTableCapacity) {
      return []
    }

    const exactTables = availableTables.filter(
      (table) => Number(table?.table_capacity || 0) === requestedPeople
    )

    if (exactTables.length >= 2) {
      return exactTables
    }

    const nearbyTables = availableTables.filter((table) => {
      const capacity = Number(table?.table_capacity || 0)
      return Math.abs(capacity - requestedPeople) <= 3
    })

    return Array.from(
      new Map([...exactTables, ...nearbyTables].map((table) => [getTableId(table), table])).values()
    )
  }, [availableTables, requestedPeople, maxTableCapacity])

  const capacityWarning = useMemo(() => {
    if (!requestedPeople || requestedPeople < 1) return ''

    if (maxTableCapacity > 0 && requestedPeople > maxTableCapacity) {
      return 'El numero de personas es muy grande para las mesas disponibles. Para realizar esta reservacion debe comunicarse con el restaurant.'
    }

    return ''
  }, [requestedPeople, maxTableCapacity])

  const selectedTableName = useMemo(() => {
    const found = tables.find((table) => getTableId(table) === formData.table_id)
    return found?.table_name || found?.name || ''
  }, [tables, formData.table_id])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSelectTableFromPlan = (table) => {
    const tId = getTableId(table)
    if (!tId) return
    setFormData((prev) => ({ ...prev, table_id: tId }))
    setIsTablePlanOpen(false)
  }

  useEffect(() => {
    if (!formData.table_id) return

    const stillValid = filteredTables.some((table) => getTableId(table) === formData.table_id)
    if (!stillValid) {
      setFormData((prev) => ({ ...prev, table_id: '' }))
    }
  }, [filteredTables, formData.table_id])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user?._id) {
      toast.error('No se pudo obtener el usuario logeado')
      return
    }

    if (!restaurantContext?.id) {
      toast.error('No se pudo obtener el restaurante seleccionado')
      return
    }

    if (capacityWarning) {
      toast.error(capacityWarning)
      return
    }

    if (!formData.reservation_date || !formData.reservation_time) {
      toast.error('Fecha y hora son requeridas')
      return
    }

    if (formData.reservation_type === 'mesa' && !formData.table_id) {
      toast.error('Debes seleccionar una mesa')
      return
    }

    setSubmitting(true)

    const payload = {
      user_id: user._id,
      userId: user._id,
      client_name: userDisplayName,
      client_email: userEmail,
      reservation_date: formData.reservation_date,
      reservation_time: formData.reservation_time,
      personas: String(formData.personas || 1),
      reservation_type: formData.reservation_type,
      table_id: formData.reservation_type === 'mesa' ? formData.table_id : null,
      restaurant_id: restaurantContext.id,
      notes: formData.notes,
      reservation_history: formData.notes,
      description: formData.notes,
      details: formData.notes,
      reservation_price: 0,
    }

    const result = await reservationService.createReservation(payload)
    setSubmitting(false)

    if (result) {
      toast.success(isEditing ? 'Reservación actualizada con éxito' : 'Reservación creada con éxito')
      sessionStorage.removeItem(EDITING_RESERVATION_KEY)
      navigate('/customer/reservations')
    }
  }

  return (
    <div 
      className="relative min-h-full text-[#f8fafc] overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.68) 0%, rgba(0, 0, 0, 0.60) 50%, rgba(0, 0, 0, 0.68) 100%), url('https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=1600&q=80')`,
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
        <section className="w-full max-w-3xl">
          {/* Header centrado y simétrico */}
          <div className="text-center mb-10 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#9ca3af]">
              {isEditing ? '✎ Editar Reservación' : '+ Nueva Reservación'}
            </p>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-[#f8fafc] drop-shadow-lg">
              {isEditing ? 'Editar reservación' : 'Tu Reservación'}
            </h1>
            <p className="text-sm md:text-base text-[#d1d5db] drop-shadow-lg">
              {isEditing ? 'Actualiza los detalles de tu reserva' : 'Reserva una mesa en tu restaurante favorito'}
            </p>
          </div>

          {/* Card glassmorphism principal - simétrica */}
          <div className="rounded-[2rem] border border-white/10 bg-black/30 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8 md:p-10">
              {/* Información de usuario y restaurante */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 pb-8 border-b border-white/5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#9ca3af] mb-2">Usuario</p>
                  <input 
                    id="reservation-user-name" 
                    value={userDisplayName} 
                    disabled 
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-[#f8fafc] backdrop-blur-sm"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#9ca3af] mb-2">Restaurante</p>
                  <input 
                    id="reservation-restaurant-name" 
                    value={restaurantContext?.name || ''} 
                    disabled 
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-[#f8fafc] backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Campos principales de reservación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#9ca3af] mb-2">Fecha</p>
                  <input
                    id="reservation-date"
                    type="date"
                    value={formData.reservation_date}
                    onChange={(e) => handleChange('reservation_date', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-[#f8fafc] focus:border-white/30 focus:bg-black/40 outline-none transition backdrop-blur-sm"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#9ca3af] mb-2">Hora</p>
                  <input
                    id="reservation-time"
                    type="time"
                    value={formData.reservation_time}
                    onChange={(e) => handleChange('reservation_time', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-[#f8fafc] focus:border-white/30 focus:bg-black/40 outline-none transition backdrop-blur-sm"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#9ca3af] mb-2">Personas</p>
                  <input
                    id="reservation-people"
                    type="number"
                    min="1"
                    value={formData.personas}
                    onChange={(e) => handleChange('personas', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-[#f8fafc] focus:border-white/30 focus:bg-black/40 outline-none transition backdrop-blur-sm"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#9ca3af] mb-2">Tipo</p>
                  <select
                    id="reservation-type"
                    value={formData.reservation_type}
                    onChange={(e) => handleChange('reservation_type', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-[#f8fafc] focus:border-white/30 focus:bg-black/40 outline-none transition backdrop-blur-sm"
                  >
                    <option value="mesa">🍽️ Mesa</option>
                    <option value="domicilio">🏠 Domicilio</option>
                  </select>
                </div>
              </div>

              {/* Mesa (si es reservación de mesa) */}
              {formData.reservation_type === 'mesa' && (
                <div className="md:col-span-2 pb-8 border-b border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#9ca3af] mb-2">Seleccionar Mesa</p>
                  <select
                    id="reservation-table"
                    value={formData.table_id}
                    onChange={(e) => handleChange('table_id', e.target.value)}
                    disabled={loadingTables}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-[#f8fafc] focus:border-white/30 focus:bg-black/40 outline-none transition backdrop-blur-sm disabled:opacity-50"
                  >
                    <option value="">Selecciona una mesa</option>
                    {filteredTables.map((table) => {
                      const tId = getTableId(table)
                      const tName = table.table_name || table.name || `Mesa ${table.table_number || ''}`
                      return (
                        <option key={tId} value={tId}>
                          {tName}
                        </option>
                      )
                    })}
                  </select>

                  <p className="mt-2 text-xs text-[#d1d5db]/60">
                    Se mostrarán primero las mesas con capacidad exacta. Si hay menos de 2 disponibles, también se incluirán las mesas cercanas.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsTablePlanOpen(true)}
                      disabled={loadingTables || loadingLayout || !restaurantContext?.id || Boolean(capacityWarning)}
                      className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f8fafc] hover:bg-white/10 transition disabled:opacity-50 backdrop-blur-sm"
                    >
                      📋 Ver mesas disponibles
                    </button>
                    {selectedTableName && (
                      <span className="text-xs text-[#a1d8f7] font-medium">
                        ✓ {selectedTableName}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Notas */}
              <div className="mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#9ca3af] mb-2">Notas Especiales</p>
                <textarea
                  id="reservation-notes"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-[#f8fafc] focus:border-white/30 focus:bg-black/40 outline-none transition backdrop-blur-sm resize-none"
                  placeholder="Ej: Celebración especial, restricciones dietéticas, etc."
                />
              </div>

              {/* Avisos y errores */}
              {!restaurantContext?.id && (
                <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  ⚠️ No hay restaurante seleccionado. Selecciona uno en la sección de Restaurantes.
                </div>
              )}

              {capacityWarning && (
                <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  🚫 {capacityWarning}
                </div>
              )}

              {/* Botones de acción centrados y simétricos */}
              <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/customer/reservations')}
                  className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-[#f8fafc] hover:bg-white/10 transition backdrop-blur-sm order-2 sm:order-1"
                >
                  ← Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !restaurantContext?.id || !user?._id || Boolean(capacityWarning)}
                  className="rounded-lg bg-white text-black px-8 py-3 text-sm font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 shadow-lg"
                >
                  {submitting ? '⏳ Guardando...' : isEditing ? '✎ Actualizar' : '✓ Reservar'}
                </button>
              </div>
            </form>
          </div>

          {/* Espacio decorativo inferior simétrico */}
          <div className="mt-8 flex justify-center gap-2">
            <div className="h-1 w-1.5 rounded-full bg-white/20" />
            <div className="h-1 w-1.5 rounded-full bg-white/40" />
            <div className="h-1 w-1.5 rounded-full bg-white/20" />
          </div>
        </section>
      </div>

      {isTablePlanOpen && formData.reservation_type === 'mesa' && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 md:p-8">
          <div className="mx-auto h-full max-w-6xl rounded-[2rem] border border-[#6b7280]/40 bg-[#0f172a] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black uppercase tracking-wide text-[#f8fafc]">Mesas disponibles</h2>
                <p className="text-xs text-[#d1d5db]/70">Haz clic en una mesa para seleccionarla</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTablePlanOpen(false)}
                className="rounded-xl border border-[#f8fafc]/20 px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#f8fafc]"
              >
                Cerrar
              </button>
            </div>

            <div className="h-[78vh] overflow-auto rounded-2xl border border-[#6b7280]/30 bg-[#111827] p-4">
              {filteredTables.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#d1d5db]/75">
                  {capacityWarning || 'No hay mesas disponibles para este restaurante.'}
                </div>
              ) : Object.keys(layoutMap || {}).length > 0 ? (
                <div className="relative mx-auto" style={{ width: 1200, height: 760 }}>
                  {filteredTables.map((table) => {
                    const tId = getTableId(table)
                    const p = layoutMap?.[tId] || { x: 0, y: 0, width: 140, height: 96 }
                    const isSelected = formData.table_id === tId
                    const tName = table.table_name || table.name || `Mesa ${table.table_number || ''}`
                    return (
                      <button
                        type="button"
                        key={tId}
                        onClick={() => handleSelectTableFromPlan(table)}
                        className={`absolute rounded-xl border-2 px-2 py-2 text-left text-[#f8fafc] ${isSelected ? 'border-emerald-300 bg-emerald-800/40' : 'border-[#6b7280]/70 bg-[#1f2937]/85 hover:border-[#f8fafc]/60'}`}
                        style={{
                          left: Number(p.x) || 0,
                          top: Number(p.y) || 0,
                          width: Number(p.width) || 140,
                          height: Number(p.height) || 96,
                        }}
                      >
                        <p className="truncate text-xs font-bold">{tName}</p>
                        <p className="mt-1 text-[10px] text-[#f8fafc]/70">Capacidad: {table.table_capacity || '-'}</p>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {filteredTables.map((table) => {
                    const tId = getTableId(table)
                    const isSelected = formData.table_id === tId
                    const tName = table.table_name || table.name || `Mesa ${table.table_number || ''}`
                    return (
                      <button
                        type="button"
                        key={tId}
                        onClick={() => handleSelectTableFromPlan(table)}
                        className={`rounded-xl border px-4 py-3 text-left ${isSelected ? 'border-emerald-300 bg-emerald-800/30 text-emerald-100' : 'border-[#6b7280]/50 bg-[#1f2937]/40 text-[#f8fafc]'}`}
                      >
                        <p className="font-bold">{tName}</p>
                        <p className="mt-1 text-xs text-[#d1d5db]/75">Capacidad: {table.table_capacity || '-'}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
