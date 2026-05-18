import { useEffect, useState } from 'react'
import { useTableForm } from '../hooks/useTables.js'
import { validateTableForm, formatTableData } from '../utils/tableUtils.js'
import { TABLE_MESSAGES, TABLE_STATES } from '../constants/tableConstants.js'
import toast from 'react-hot-toast'

/* eslint-disable react/prop-types */
const TableInlineForm = ({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  fixedRestaurantId = '',
}) => {
  const { handleCreate, handleUpdate, loading, error, clearError } = useTableForm()

  const [formData, setFormData] = useState({
    name: initialData?.table_name || '',
    number: initialData?.table_number ?? '',
    ubication: initialData?.table_ubication || '',
    capacity: initialData?.table_capacity ?? '',
    timeAvailable: initialData?.table_time_available || '',
    tableState: initialData?.table_state || 'Disponible',
    restaurantId:
      fixedRestaurantId ||
      initialData?.restaurant_id?._id ||
      initialData?.restaurant_id ||
      '',
    reservationId: initialData?.reserva_id?._id || initialData?.reserva_id || '',
    estado: initialData?.estado ?? true,
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isOpen) return

    setFormData({
      name: initialData?.table_name || '',
      number: initialData?.table_number ?? '',
      ubication: initialData?.table_ubication || '',
      capacity: initialData?.table_capacity ?? '',
      timeAvailable: initialData?.table_time_available || '',
      tableState: initialData?.table_state || 'Disponible',
      restaurantId:
        fixedRestaurantId ||
        initialData?.restaurant_id?._id ||
        initialData?.restaurant_id ||
        '',
      reservationId: initialData?.reserva_id?._id || initialData?.reserva_id || '',
      estado: initialData?.estado ?? true,
    })
    setErrors({})
  }, [isOpen, initialData, fixedRestaurantId])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()

    const { isValid, errors: validationErrors } = validateTableForm(formData)

    if (!isValid) {
      setErrors(validationErrors)
      toast.error(TABLE_MESSAGES.VALIDATION_ERROR)
      return
    }

    try {
      const payload = formatTableData(formData)

      const result = initialData
        ? await handleUpdate(initialData._id || initialData.id, payload)
        : await handleCreate(payload)

      if (result.success) {
        toast.success(
          initialData ? TABLE_MESSAGES.UPDATE_SUCCESS : TABLE_MESSAGES.CREATE_SUCCESS
        )
        onSuccess?.()
        onClose()
      } else {
        toast.error(
          result.error ||
            (initialData ? TABLE_MESSAGES.UPDATE_ERROR : TABLE_MESSAGES.CREATE_ERROR)
        )
      }
    } catch (err) {
      toast.error(
        err.message ||
          (initialData ? TABLE_MESSAGES.UPDATE_ERROR : TABLE_MESSAGES.CREATE_ERROR)
      )
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-[2rem] border border-[#6b7280]/20 bg-[#111111] p-6 shadow-2xl shadow-black/50" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black uppercase italic text-[#f8fafc]">
            {initialData ? 'Editar Mesa' : 'Agregar Mesa'}
          </h3>
          <p className="mt-1 text-sm text-[#9ca3af]">
            {initialData
              ? 'Modifica los datos de la mesa sin salir del plano.'
              : 'Crea una nueva mesa y luego ubícala visualmente en el plano.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-[#6b7280]/40 px-3 py-1.5 text-sm text-[#f8fafc] hover:bg-[#1f2937]/30"
        >
          Cerrar
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-900/20 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-[1.5rem] bg-[#111111]/60 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <input
              aria-label="Nombre de la Mesa"
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ej: Mesa 1"
              className="w-full rounded-xl border border-[#6b7280]/50 bg-[#1f2937]/20 px-4 py-3 text-[#f8fafc] outline-none transition-colors placeholder:text-[#9ca3af]/50 focus:border-[#f8fafc]"
            />
            {errors.name && <p className="text-xs text-red-300">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <input
                aria-label="Número"
                id="number"
                type="number"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                min="1"
                placeholder="1"
                className="w-full rounded-xl border border-[#6b7280]/50 bg-[#1f2937]/20 px-4 py-3 text-[#f8fafc] outline-none transition-colors placeholder:text-[#9ca3af]/50 focus:border-[#f8fafc]"
              />
              {errors.number && <p className="text-xs text-red-300">{errors.number}</p>}
            </div>

            <div className="space-y-2">
              <input
                aria-label="Capacidad"
                id="capacity"
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="1"
                placeholder="4"
                className="w-full rounded-xl border border-[#6b7280]/50 bg-[#1f2937]/20 px-4 py-3 text-[#f8fafc] outline-none transition-colors placeholder:text-[#9ca3af]/50 focus:border-[#f8fafc]"
              />
              {errors.capacity && <p className="text-xs text-red-300">{errors.capacity}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <input
            aria-label="Ubicación"
            id="ubication"
            type="text"
            name="ubication"
            value={formData.ubication}
            onChange={handleInputChange}
            placeholder="Ej: Terraza, Patio, Interior"
            className="w-full rounded-xl border border-[#6b7280]/50 bg-[#1f2937]/20 px-4 py-3 text-[#f8fafc] outline-none transition-colors placeholder:text-[#9ca3af]/50 focus:border-[#f8fafc]"
          />
          {errors.ubication && <p className="text-xs text-red-300">{errors.ubication}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <input
              aria-label="Horario Disponible"
              id="timeAvailable"
              type="text"
              name="timeAvailable"
              value={formData.timeAvailable}
              onChange={handleInputChange}
              placeholder="Ej: 10:00 - 23:00"
              className="w-full rounded-xl border border-[#6b7280]/50 bg-[#1f2937]/20 px-4 py-3 text-[#f8fafc] outline-none transition-colors placeholder:text-[#9ca3af]/50 focus:border-[#f8fafc]"
            />
          </div>

          <div className="space-y-2">
            <select
              aria-label="Estado de la Mesa"
              id="tableState"
              name="tableState"
              value={formData.tableState}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-[#6b7280]/50 bg-[#1f2937]/20 px-4 py-3 text-[#f8fafc] outline-none transition-colors focus:border-[#f8fafc]"
            >
              {TABLE_STATES.map((state) => (
                <option key={state} value={state} className="bg-[#111111] text-[#f8fafc]">
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <input
              aria-label="Restaurante"
              id="restaurantId"
              type="text"
              name="restaurantId"
              value={formData.restaurantId}
              onChange={handleInputChange}
              readOnly={Boolean(fixedRestaurantId)}
              disabled={Boolean(fixedRestaurantId)}
              placeholder="ObjectId del restaurante"
              className="w-full rounded-xl border border-[#6b7280]/50 bg-[#1f2937]/20 px-4 py-3 text-[#f8fafc] outline-none transition-colors placeholder:text-[#9ca3af]/50 focus:border-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-70"
            />
            {fixedRestaurantId && (
              <p className="text-xs text-[#9ca3af]">Esta mesa se asignará al restaurante actual.</p>
            )}
            {errors.restaurantId && <p className="text-xs text-red-300">{errors.restaurantId}</p>}
          </div>

          <div className="space-y-2">
            <input
              aria-label="Reserva"
              id="reservationId"
              type="text"
              name="reservationId"
              value={formData.reservationId}
              onChange={handleInputChange}
              placeholder="Opcional"
              className="w-full rounded-xl border border-[#6b7280]/50 bg-[#1f2937]/20 px-4 py-3 text-[#f8fafc] outline-none transition-colors placeholder:text-[#9ca3af]/50 focus:border-[#f8fafc]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#6b7280]/50 px-5 py-3 font-semibold text-[#f8fafc] transition-colors hover:bg-[#1f2937]/20"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-2xl bg-[#6b7280] px-6 py-3 font-bold text-[#f8fafc] transition-colors hover:bg-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Guardando...' : initialData ? 'Actualizar mesa' : 'Guardar mesa'}
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}

export default TableInlineForm
