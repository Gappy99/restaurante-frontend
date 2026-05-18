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
    <div className="min-h-full bg-[#111111] text-[#f8fafc] px-4 py-8 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-4xl rounded-[2.5rem] border border-[#6b7280]/30 bg-[#1f2937]/20 px-6 py-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-8 lg:px-10">
        <div className="border-b border-[#f8fafc]/10 pb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#9ca3af]">{isEditing ? 'Editar Reservación' : 'Nueva Reservación'}</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-[#f8fafc]">
            {isEditing ? 'Editar reservación' : 'Crear reservación'}
          </h1>
          <p className="mt-3 text-sm text-[#d1d5db]/80">Los IDs de usuario y restaurante se asignan automáticamente por el flujo de cliente.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-1">
            <p className="text-xs uppercase tracking-[0.2em] text-[#d1d5db]/70">Usuario</p>
            <input id="reservation-user-name" value={userDisplayName} disabled className="mt-2 w-full rounded-xl border border-[#f8fafc]/20 bg-black/20 px-4 py-3 text-sm text-[#f8fafc]" />
          </div>

          <div className="md:col-span-1">
            <p className="text-xs uppercase tracking-[0.2em] text-[#d1d5db]/70">ID Usuario</p>
            <input id="reservation-user-id" value={user?._id || ''} disabled className="mt-2 w-full rounded-xl border border-[#f8fafc]/20 bg-black/20 px-4 py-3 text-sm text-[#f8fafc]" />
          </div>

          <div className="md:col-span-1">
            <p className="text-xs uppercase tracking-[0.2em] text-[#d1d5db]/70">Restaurante</p>
            <input id="reservation-restaurant-name" value={restaurantContext?.name || ''} disabled className="mt-2 w-full rounded-xl border border-[#f8fafc]/20 bg-black/20 px-4 py-3 text-sm text-[#f8fafc]" />
          </div>

          <div className="md:col-span-1">
            <p className="text-xs uppercase tracking-[0.2em] text-[#d1d5db]/70">ID Restaurante</p>
            <input id="reservation-restaurant-id" value={restaurantContext?.id || ''} disabled className="mt-2 w-full rounded-xl border border-[#f8fafc]/20 bg-black/20 px-4 py-3 text-sm text-[#f8fafc]" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d1d5db]/70">Fecha</p>
            <input
              id="reservation-date"
              type="date"
              value={formData.reservation_date}
              onChange={(e) => handleChange('reservation_date', e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#f8fafc]/20 bg-black/20 px-4 py-3 text-sm text-[#f8fafc]"
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d1d5db]/70">Hora</p>
            <input
              id="reservation-time"
              type="time"
              value={formData.reservation_time}
              onChange={(e) => handleChange('reservation_time', e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#f8fafc]/20 bg-black/20 px-4 py-3 text-sm text-[#f8fafc]"
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d1d5db]/70">Personas</p>
            <input
              id="reservation-people"
              type="number"
              min="1"
              value={formData.personas}
              onChange={(e) => handleChange('personas', e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#f8fafc]/20 bg-black/20 px-4 py-3 text-sm text-[#f8fafc]"
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d1d5db]/70">Tipo</p>
            <select
              id="reservation-type"
              value={formData.reservation_type}
              onChange={(e) => handleChange('reservation_type', e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#f8fafc]/20 bg-black/20 px-4 py-3 text-sm text-[#f8fafc]"
            >
              <option value="mesa">Mesa</option>
              <option value="domicilio">Domicilio</option>
            </select>
          </div>

          {formData.reservation_type === 'mesa' && (
            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-[#d1d5db]/70">Mesa</p>
              <select
                id="reservation-table"
                value={formData.table_id}
                onChange={(e) => handleChange('table_id', e.target.value)}
                disabled={loadingTables}
                className="mt-2 w-full rounded-xl border border-[#f8fafc]/20 bg-black/20 px-4 py-3 text-sm text-[#f8fafc]"
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

              <p className="mt-2 text-xs text-[#d1d5db]/70">
                Se mostrarán primero las mesas con capacidad exacta. Si hay menos de 2 disponibles, también se incluirán las mesas cercanas en un rango de 3 personas.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsTablePlanOpen(true)}
                  disabled={loadingTables || loadingLayout || !restaurantContext?.id || Boolean(capacityWarning)}
                  className="rounded-xl border border-[#f8fafc]/25 bg-black/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f8fafc] disabled:opacity-60"
                >
                  Ver mesas disponibles
                </button>
                {selectedTableName && (
                  <span className="text-xs text-[#d1d5db]/80">
                    Seleccionada: {selectedTableName}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[#d1d5db]/70">Notas</p>
            <textarea
              id="reservation-notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#f8fafc]/20 bg-black/20 px-4 py-3 text-sm text-[#f8fafc]"
              placeholder="Opcional"
            />
          </div>

          {!restaurantContext?.id && (
            <div className="md:col-span-2 rounded-xl border border-zinc-400/50 bg-zinc-400/10 px-4 py-3 text-sm text-zinc-100">
              No hay restaurante seleccionado. Ve a Restaurantes, luego Ver detalles y despues Reservaciones para iniciar este flujo.
            </div>
          )}

          {capacityWarning && (
            <div className="md:col-span-2 rounded-xl border border-red-400/50 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {capacityWarning}
            </div>
          )}

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/customer/reservations')}
              className="rounded-2xl border border-[#f8fafc]/25 bg-black/20 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-[#f8fafc]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !restaurantContext?.id || !user?._id || Boolean(capacityWarning)}
              className="rounded-2xl bg-[#f8fafc] px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-[#1f2937] disabled:opacity-60"
            >
              {submitting ? 'Guardando...' : isEditing ? 'Actualizar Reservación' : 'Crear Reservación'}
            </button>
          </div>
        </form>
      </section>

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
