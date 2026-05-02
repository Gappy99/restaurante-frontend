import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import InformationCard from '../components/InformationCard'
import InformationModal from '../components/InformationModal'
import useInformationStore from '../store/useInformationStore'

const InformationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const restaurantId = searchParams.get('restaurantId') || ''

  const {
    informations,
    restaurants,
    loading,
    error,
    loadInformations,
    loadRestaurants,
    createInformation,
    updateInformation,
    deleteInformation,
  } = useInformationStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInformation, setEditingInformation] = useState(null)

  useEffect(() => {
    loadRestaurants()
  }, [loadRestaurants])

  useEffect(() => {
    loadInformations(restaurantId)
  }, [loadInformations, restaurantId])

  const restaurantMap = useMemo(() => {
    return restaurants.reduce((accumulator, restaurant) => {
      const id = restaurant._id || restaurant.id
      if (id) {
        accumulator[id] =
          restaurant.restaurant_name ||
          restaurant.nombre ||
          restaurant.name ||
          'Restaurante sin nombre'
      }
      return accumulator
    }, {})
  }, [restaurants])

  const handleOpenModal = (information = null) => {
    setEditingInformation(information)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingInformation(null)
    setIsModalOpen(false)
  }

  const handleFilterChange = (event) => {
    const value = event.target.value
    setSearchParams(value ? { restaurantId: value } : {})
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta información?')) {
      return
    }

    const result = await deleteInformation(id)
    if (result.success) {
      toast.success('Información eliminada')
      return
    }

    toast.error(result.error || 'No se pudo eliminar la información')
  }

  const handleSave = async (informationData) => {
    const editId = editingInformation?._id || editingInformation?.id
    const isEditing = Boolean(editingInformation && editId)

    if (editingInformation && !editId) {
      toast.error('No se puede actualizar: falta el ID de la información')
      return { success: false, error: 'MISSING_INFORMATION_ID' }
    }

    const result = isEditing
      ? await updateInformation(editId, informationData)
      : await createInformation(informationData)

    if (result.success) {
      toast.success(isEditing ? 'Información actualizada' : 'Información creada')
      handleCloseModal()
      await loadInformations(restaurantId)
      return result
    }

    toast.error(result.error || 'No se pudo guardar la información')
    return result
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-[var(--accent-soft)] bg-[var(--surface)] p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text)]">
            Information
          </span>
          <h1 className="text-3xl font-bold text-[var(--text)]">Información por restaurante</h1>
          <p className="text-sm text-[var(--muted)]">
            El backend exige restaurantId, así que aquí puedes crear, filtrar y administrar la información por restaurante.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="min-w-72">
            <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Filtrar por restaurante</label>
            <select
              value={restaurantId}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-[var(--accent-soft)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
            >
              <option value="">Todos los restaurantes</option>
              {restaurants.map((restaurant) => {
                const id = restaurant._id || restaurant.id
                return (
                  <option key={id} value={id}>
                    {restaurant.restaurant_name || restaurant.nombre || restaurant.name || 'Restaurante sin nombre'}
                  </option>
                )
              })}
            </select>
          </div>

          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="h-fit rounded-xl bg-[var(--primary)] px-5 py-3 font-medium text-[var(--surface)] transition hover:bg-[#446b5b]"
          >
            + Agregar información
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-[var(--accent-soft)] bg-[var(--surface)] p-8 text-center text-[var(--muted)]">
          Cargando información...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-[var(--accent-soft)] bg-[var(--bg)] p-8 text-[var(--accent)]">
          {error}
        </div>
      ) : informations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--accent-soft)] bg-[var(--surface)] p-10 text-center text-[var(--muted)]">
          No hay información registrada{restaurantId ? ' para este restaurante' : ''}.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          {informations.map((information, index) => {
            const infoId = information._id || information.id || `info-${index}`
            const restaurantIdValue = information.restaurantId?._id || information.restaurantId?.id || information.restaurantId
            const restaurantNameValue =
              restaurantMap[restaurantIdValue] ||
              information.restaurantId?.restaurant_name ||
              information.restaurantId?.nombre ||
              information.restaurantId?.name ||
              'No disponible'
            return (
              <InformationCard
                key={infoId}
                information={information}
                restaurantName={restaurantNameValue}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
              />
            )
          })}
        </div>
      )}

      <InformationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        information={editingInformation}
        restaurants={restaurants}
        defaultRestaurantId={restaurantId}
        isSaving={loading}
      />
    </div>
  )
}

export default InformationPage
