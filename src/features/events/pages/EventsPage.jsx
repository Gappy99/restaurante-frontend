import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Modal from '../../../shared/components/Modal'
import useEventStore from '../store/useEventStore.js'
import { eventService } from '../services/eventService.js'

const statusOptions = [
  { value: 'active', label: 'Activo' },
  { value: 'paused', label: 'Pausado' },
  { value: 'finished', label: 'Finalizado' },
]

const EventsPage = () => {
  const { events, loading, error, fetchEvents, deleteEvent } = useEventStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleOpenModal = (event = null) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedEvent(null)
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    const confirm = window.confirm('¿Eliminar este evento?')
    if (!confirm) return

    const result = await deleteEvent(id)
    if (result.success) {
      toast.success('Evento eliminado correctamente')
    }
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredEvents = events.filter((event) => {
    if (!normalizedSearch) return true
    const title = (event.title || event.event_title || '').toLowerCase()
    const location = (event.location || event.event_location || '').toLowerCase()
    return title.includes(normalizedSearch) || location.includes(normalizedSearch)
  })

  return (
    <div className="min-h-screen bg-[#1E1914] text-[#FCF0CA] p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-12 rounded-[2rem] bg-[#2E160C]/80 border border-[#7F532C]/30 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#FCF0CA] via-[#E3C797] to-[#946841]">
              Eventos
            </h1>
            <p className="mt-3 text-[#D8C5A3] max-w-2xl">
              Administra los eventos del restaurante con creación, edición, búsqueda y eliminación.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#946841]">🔎</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar evento o ubicación"
                className="w-full rounded-3xl border border-[#7F532C]/40 bg-[#2E160C]/90 py-4 pl-12 pr-4 text-[#FCF0CA] placeholder:text-[#946841]/80 outline-none transition focus:border-[#FCF0CA]/60 focus:ring-2 focus:ring-[#946841]/25"
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center rounded-3xl bg-[#7F532C] px-6 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#FCF0CA] shadow-lg shadow-black/20 transition hover:bg-[#946841]"
            >
              + Nuevo evento
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full rounded-3xl bg-[#2E160C]/90 border border-[#7F532C]/40 p-8 text-center text-[#FCF0CA]">
              Cargando eventos...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="col-span-full rounded-3xl bg-[#2E160C]/90 border border-[#7F532C]/40 p-8 text-center text-[#FCF0CA]">
              No se encontraron eventos.
            </div>
          ) : (
            filteredEvents.map((event) => (
              <article
                key={event._id || event.id}
                className="rounded-[2rem] border border-[#7F532C]/20 bg-[#2E160C]/90 p-6 shadow-2xl shadow-black/20"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-[#946841]">
                      {event.status || event.event_status || 'Activo'}
                    </p>
                    <h2 className="mt-3 text-2xl font-bold text-[#FCF0CA]">
                      {event.title || event.event_title || 'Evento sin título'}
                    </h2>
                  </div>
                  <div className="rounded-3xl bg-[#FCF0CA]/5 px-4 py-2 text-sm text-[#FCF0CA]">
                    {event.date || event.event_date ? new Date(event.date || event.event_date).toLocaleDateString() : 'Fecha pendiente'}
                  </div>
                </div>

                <p className="mb-5 text-[#D8C5A3] min-h-[4.25rem]">
                  {event.description || event.event_description || 'No hay descripción disponible.'}
                </p>

                <div className="mb-6 flex flex-wrap gap-3 text-sm text-[#FCF0CA]/80">
                  <span className="rounded-full border border-[#7F532C]/40 bg-[#FCF0CA]/5 px-3 py-2">
                    {event.location || event.event_location || 'Ubicación no especificada'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleOpenModal(event)}
                    className="rounded-2xl border border-[#FCF0CA]/20 bg-[#946841]/10 px-4 py-2 text-sm text-[#FCF0CA] transition hover:border-[#FCF0CA]/40 hover:bg-[#946841]/20"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(event._id || event.id)}
                    className="rounded-2xl border border-[#FCF0CA]/20 bg-[#7F532C]/10 px-4 py-2 text-sm text-[#FCF0CA] transition hover:border-[#FCF0CA]/40 hover:bg-[#7F532C]/20"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        onSuccess={async () => {
          await fetchEvents()
          handleCloseModal()
        }}
      />
    </div>
  )
}

const EventModal = ({ isOpen, onClose, event, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm({
    defaultValues: {
      title: event?.title || event?.event_title || '',
      description: event?.description || event?.event_description || '',
      location: event?.location || event?.event_location || '',
      date: event?.date || event?.event_date || '',
      status: event?.status || event?.event_status || 'active',
    },
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    reset({
      title: event?.title || event?.event_title || '',
      description: event?.description || event?.event_description || '',
      location: event?.location || event?.event_location || '',
      date: event?.date || event?.event_date || '',
      status: event?.status || event?.event_status || 'active',
    })
  }, [event, reset])

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const payload = {
        title: data.title,
        description: data.description,
        location: data.location,
        date: data.date,
        status: data.status,
      }

      let result
      if (event) {
        result = await eventService.updateEvent(event._id || event.id, payload)
      } else {
        result = await eventService.createEvent(payload)
      }

      if (!result.success) {
        throw new Error(result.error || 'No se pudo guardar el evento')
      }

      toast.success(`Evento ${event ? 'actualizado' : 'creado'} correctamente`)
      onSuccess()
    } catch (submitError) {
      toast.error(submitError.message || 'No se pudo guardar el evento')
      console.error(submitError)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedStatus = watch('status')

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event ? 'Editar evento' : 'Nuevo evento'}>
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#2E160C]">Título</label>
            <input
              type="text"
              {...register('title', { required: 'El título es obligatorio' })}
              className="w-full rounded-2xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-3 text-[#2E160C] outline-none focus:border-[#946841] focus:ring-2 focus:ring-[#946841]/20"
              placeholder="Nombre del evento"
            />
            {errors.title && <p className="mt-2 text-sm text-[#7F532C]">{errors.title.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#2E160C]">Descripción</label>
            <textarea
              rows="4"
              {...register('description')}
              className="w-full rounded-2xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-3 text-[#2E160C] outline-none focus:border-[#946841] focus:ring-2 focus:ring-[#946841]/20"
              placeholder="Detalles del evento"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#2E160C]">Ubicación</label>
              <input
                type="text"
                {...register('location', { required: 'La ubicación es obligatoria' })}
                className="w-full rounded-2xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-3 text-[#2E160C] outline-none focus:border-[#946841] focus:ring-2 focus:ring-[#946841]/20"
                placeholder="Lugar del evento"
              />
              {errors.location && <p className="mt-2 text-sm text-[#7F532C]">{errors.location.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#2E160C]">Fecha</label>
              <input
                type="datetime-local"
                {...register('date', { required: 'La fecha es obligatoria' })}
                className="w-full rounded-2xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-3 text-[#2E160C] outline-none focus:border-[#946841] focus:ring-2 focus:ring-[#946841]/20"
              />
              {errors.date && <p className="mt-2 text-sm text-[#7F532C]">{errors.date.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#2E160C]">Estado</label>
            <select
              {...register('status')}
              className="w-full rounded-2xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-3 text-[#2E160C] outline-none focus:border-[#946841] focus:ring-2 focus:ring-[#946841]/20"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-[#5B300E]">Estado actual: {statusOptions.find((option) => option.value === selectedStatus)?.label}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-3xl bg-[#7F532C] px-6 py-3 text-white transition hover:bg-[#946841] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Guardando...' : event ? 'Actualizar evento' : 'Crear evento'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-3xl border border-[#7F532C] bg-[#FCF0CA] px-6 py-3 text-[#2E160C] transition hover:bg-[#F2E7D2]"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default EventsPage
