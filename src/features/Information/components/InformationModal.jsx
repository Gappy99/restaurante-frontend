import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

const InformationModal = ({
  isOpen,
  onClose,
  onSave,
  information,
  restaurants = [],
  defaultRestaurantId = '',
  isSaving = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    reset({
      title: information?.title || '',
      information: information?.information || '',
      type: information?.type || '',
      restaurantId:
        information?.restaurantId?._id ||
        information?.restaurantId?.id ||
        information?.restaurantId ||
        defaultRestaurantId ||
        '',
      statistics: JSON.stringify(information?.statistics || {}, null, 2),
    })
  }, [defaultRestaurantId, information, isOpen, reset])

  const onSubmit = async (data) => {
    let parsedStatistics = {}

    if (data.statistics?.trim()) {
      try {
        parsedStatistics = JSON.parse(data.statistics)
      } catch (error) {
        setError('statistics', {
          type: 'manual',
          message: 'Las estadísticas deben ser un JSON válido',
        })
        return
      }
    }

    const payload = {
      title: data.title.trim(),
      information: data.information.trim(),
      type: data.type?.trim() || '',
      restaurantId: data.restaurantId,
      statistics: parsedStatistics,
    }

    const result = await onSave(payload)
    if (result?.success !== false) {
      reset()
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-6 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--accent-soft)] bg-[var(--surface)] shadow-2xl">
        <div className="border-b border-[var(--accent-soft)] bg-[var(--bg)] px-6 py-5">
          <h2 className="text-2xl font-bold text-[var(--text)]">
            {information ? 'Editar información' : 'Nueva información'}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Completa los datos requeridos por el backend: título, contenido y restaurante.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Título *</label>
              <input
                type="text"
                className="w-full rounded-xl border border-[var(--accent-soft)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                placeholder="Ej. Promoción del día"
                {...register('title', { required: 'El título es obligatorio' })}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Información *</label>
              <textarea
                rows={5}
                className="w-full rounded-xl border border-[var(--accent-soft)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                placeholder="Escribe el contenido de la información"
                {...register('information', { required: 'El contenido de la información es obligatorio' })}
              />
              {errors.information && <p className="mt-1 text-sm text-red-600">{errors.information.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Tipo</label>
              <input
                type="text"
                className="w-full rounded-xl border border-[var(--accent-soft)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                placeholder="Ej. promo, aviso, estadística"
                {...register('type')}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Restaurante *</label>
              <select
                className="w-full rounded-xl border border-[var(--accent-soft)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                {...register('restaurantId', { required: 'El restaurante es obligatorio' })}
              >
                <option value="">Selecciona un restaurante</option>
                {restaurants.map((restaurant) => {
                  const restaurantId = restaurant._id || restaurant.id
                  return (
                    <option key={restaurantId} value={restaurantId}>
                      {restaurant.restaurant_name || restaurant.nombre || restaurant.name || 'Restaurante sin nombre'}
                    </option>
                  )
                })}
              </select>
              {errors.restaurantId && <p className="mt-1 text-sm text-red-600">{errors.restaurantId.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">
                Estadísticas JSON
              </label>
              <textarea
                rows={6}
                className="w-full rounded-xl border border-[var(--accent-soft)] bg-[var(--surface)] px-4 py-3 font-mono text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                placeholder='{
  "visitas": 120,
  "ventas": 34
}'
                {...register('statistics')}
              />
              {errors.statistics && <p className="mt-1 text-sm text-red-600">{errors.statistics.message}</p>}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--accent-soft)] pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-[var(--accent-soft)] bg-[var(--bg)] px-5 py-2.5 font-medium text-[var(--text)] transition hover:bg-[var(--accent-soft)] sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-xl bg-[var(--primary)] px-5 py-2.5 font-medium text-[var(--surface)] transition hover:bg-[#000000] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {isSaving ? 'Guardando...' : information ? 'Guardar cambios' : 'Crear información'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InformationModal
