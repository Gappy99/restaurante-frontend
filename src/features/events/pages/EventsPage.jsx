import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Modal from '../../../shared/components/Modal'
import useEventStore from '../store/useEventStore.js'
import { eventService } from '../services/eventService.js'
import { FiCalendar, FiPlus } from 'react-icons/fi'

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
    <div className="min-h-screen w-full bg-[#111111] text-[#f8fafc] font-sans overflow-x-hidden">
      
      {/* Header monocromático y limpio */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-16 p-4 md:p-8 rounded-[2.5rem] bg-[#1f2937]/20 border border-[#6b7280]/30 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-[#f8fafc] via-[#9ca3af] to-[#6b7280] bg-clip-text text-transparent">
            Gestión de Eventos
          </h1>
          <p className="text-[#9ca3af] mt-2 font-medium tracking-widest text-xs uppercase">
            Administra los eventos del restaurante
          </p>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="mt-8 md:mt-0 px-10 py-4 bg-[#6b7280] hover:bg-[#9ca3af] text-[#f8fafc] hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl font-bold shadow-lg shadow-black/20 flex items-center gap-3 border border-[#f8fafc]/10"
          disabled={loading}
        >
          <FiPlus size={18} aria-hidden="true" /> Nuevo Evento
        </button>
      </header>

      <main className="max-w-7xl mx-auto relative px-4 md:px-8">

        {/* Sección de visualización */}
        <section className="relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 border-4 border-[#6b7280] border-t-[#f8fafc] rounded-full animate-spin"></div>
              <p className="text-[#9ca3af] font-mono text-sm animate-pulse">CARGANDO BASE DE DATOS...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#1f2937]/10 rounded-[3rem] border-2 border-dashed border-[#6b7280]/30 text-center">
              <FiCalendar className="text-5xl mb-6 opacity-50" aria-hidden="true" />
              <h3 className="text-[#f8fafc] text-lg font-bold mb-2">No hay eventos registrados</h3>
              <p className="text-[#9ca3af] text-sm">Crea el primer evento haciendo clic en el botón "Nuevo evento"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <article
                  key={event._id || event.id}
                  className="rounded-[2rem] border border-[#6b7280]/20 bg-[#111111]/90 p-6 shadow-2xl shadow-black/20"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-[#9ca3af]">
                        {event.status || event.event_status || 'Activo'}
                      </p>
                      <h2 className="mt-3 text-2xl font-bold text-[#f8fafc]">
                        {event.title || event.event_title || 'Evento sin título'}
                      </h2>
                    </div>
                    <div className="rounded-3xl bg-[#f8fafc]/5 px-4 py-2 text-sm text-[#f8fafc]">
                      {event.date || event.event_date ? new Date(event.date || event.event_date).toLocaleDateString() : 'Fecha pendiente'}
                    </div>
                  </div>

                  <p className="mb-5 text-[#d1d5db] min-h-[4.25rem]">
                    {event.description || event.event_description || 'No hay descripción disponible.'}
                  </p>

                  <div className="mb-6 flex flex-wrap gap-3 text-sm text-[#f8fafc]/80">
                    <span className="rounded-full border border-[#6b7280]/40 bg-[#f8fafc]/5 px-3 py-2">
                      {event.location || event.event_location || 'Ubicación no especificada'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleOpenModal(event)}
                      className="rounded-2xl border border-[#f8fafc]/20 bg-[#9ca3af]/10 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#f8fafc]/40 hover:bg-[#9ca3af]/20"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(event._id || event.id)}
                      className="rounded-2xl border border-[#f8fafc]/20 bg-[#6b7280]/10 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#f8fafc]/40 hover:bg-[#6b7280]/20"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Decoración de fondo sutil para dar profundidad */}
        <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#1f2937]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#6b7280]/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
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
            <label className="mb-2 block text-sm font-semibold text-[#111111]">Título</label>
            <input
              type="text"
              {...register('title', { required: 'El título es obligatorio' })}
              className="w-full rounded-2xl border border-[#6b7280]/30 bg-[#f8fafc] px-4 py-3 text-[#111111] outline-none focus:border-[#9ca3af] focus:ring-2 focus:ring-[#9ca3af]/20"
              placeholder="Nombre del evento"
            />
            {errors.title && <p className="mt-2 text-sm text-[#6b7280]">{errors.title.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#111111]">Descripción</label>
            <textarea
              rows="4"
              {...register('description')}
              className="w-full rounded-2xl border border-[#6b7280]/30 bg-[#f8fafc] px-4 py-3 text-[#111111] outline-none focus:border-[#9ca3af] focus:ring-2 focus:ring-[#9ca3af]/20"
              placeholder="Detalles del evento"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111111]">Ubicación</label>
              <input
                type="text"
                {...register('location', { required: 'La ubicación es obligatoria' })}
                className="w-full rounded-2xl border border-[#6b7280]/30 bg-[#f8fafc] px-4 py-3 text-[#111111] outline-none focus:border-[#9ca3af] focus:ring-2 focus:ring-[#9ca3af]/20"
                placeholder="Lugar del evento"
              />
              {errors.location && <p className="mt-2 text-sm text-[#6b7280]">{errors.location.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111111]">Fecha</label>
              <input
                type="datetime-local"
                {...register('date', { required: 'La fecha es obligatoria' })}
                className="w-full rounded-2xl border border-[#6b7280]/30 bg-[#f8fafc] px-4 py-3 text-[#111111] outline-none focus:border-[#9ca3af] focus:ring-2 focus:ring-[#9ca3af]/20"
              />
              {errors.date && <p className="mt-2 text-sm text-[#6b7280]">{errors.date.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#111111]">Estado</label>
            <select
              {...register('status')}
              className="w-full rounded-2xl border border-[#6b7280]/30 bg-[#f8fafc] px-4 py-3 text-[#111111] outline-none focus:border-[#9ca3af] focus:ring-2 focus:ring-[#9ca3af]/20"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-[#1f2937]">Estado actual: {statusOptions.find((option) => option.value === selectedStatus)?.label}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-3xl bg-[#6b7280] px-6 py-3 text-white transition hover:bg-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Guardando...' : event ? 'Actualizar evento' : 'Crear evento'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-3xl border border-[#6b7280] bg-[#f8fafc] px-6 py-3 text-[#111111] transition hover:bg-[#e5e7eb]"
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
