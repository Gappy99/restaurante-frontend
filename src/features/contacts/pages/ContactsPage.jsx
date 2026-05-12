import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useContactStore } from '../../../shared/stores/useContactStore'
import { contactService } from '../../../shared/api/services/contactService'
import Modal from '../../../shared/components/Modal'

/**
 * Página de Gestión de Contactos (CRUD)
 */
const ContactsPage = () => {
  const { contacts, loading } = useContactStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)

  // Cargar contactos al montar
  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    await contactService.getContacts()
  }

  const handleOpenModal = (contact = null) => {
    setEditingContact(contact)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingContact(null)
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
      const result = await contactService.deleteContact(id)
      if (result.success) {
        await loadContacts()
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#2E160C]">Gestión de Contactos</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2 bg-[#5B300E] hover:bg-[#946841] text-[#FCF0CA] rounded-lg font-semibold transition"
        >
          + Nuevo Contacto
        </button>
      </div>

      {/* Tabla de contactos */}
      <div className="bg-[#FCF0CA]/50 rounded-lg shadow-lg overflow-hidden border-2 border-[#7F532C]/30">
        {loading ? (
          <div className="p-6 text-center text-[#5B300E]">Cargando contactos...</div>
        ) : contacts.length === 0 ? (
          <div className="p-6 text-center text-[#7F532C]">
            No hay contactos registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#5B300E] text-[#FCF0CA]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Tipo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Posición</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Teléfono</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, index) => (
                  <tr
                    key={contact._id}
                    className={`border-b border-[#7F532C]/20 hover:bg-[#FCF0CA] transition ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#FCF0CA]/30'
                    }`}
                  >
                    <td className="px-6 py-3 text-[#2E160C]">{contact.contact_name}</td>
                    <td className="px-6 py-3 text-[#5B300E]">{contact.contact_type}</td>
                    <td className="px-6 py-3 text-[#5B300E]">{contact.contact_position}</td>
                    <td className="px-6 py-3 text-[#5B300E]">{contact.contact_email}</td>
                    <td className="px-6 py-3 text-[#5B300E]">{contact.contact_phone_number}</td>
                    <td className="px-6 py-3 space-x-2">
                      <button
                        onClick={() => handleOpenModal(contact)}
                        className="px-3 py-1 bg-[#946841] hover:bg-[#5B300E] text-[#FCF0CA] rounded transition text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(contact._id)}
                        className="px-3 py-1 bg-[#7F532C] hover:bg-[#5B300E] text-[#FCF0CA] rounded transition text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de creación/edición */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        contact={editingContact}
        onSuccess={async () => {
          await loadContacts()
          handleCloseModal()
        }}
      />
    </div>
  )
}

/**
 * Modal de Contacto
 */
const ContactModal = ({ isOpen, onClose, contact, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: contact || {},
  })

  useEffect(() => {
    if (contact) {
      reset(contact)
    } else {
      reset()
    }
  }, [contact, reset])

  const onSubmit = async (data) => {
    try {
      if (contact) {
        await contactService.updateContact(contact._id, data)
      } else {
        await contactService.createContact(data)
      }
      onSuccess()
    } catch (error) {
      console.error('Error en el formulario:', error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative overflow-hidden rounded-3xl border border-[#7F532C]/25 bg-[#FCF0CA]/95 p-8 shadow-[0_24px_60px_rgba(46,22,12,0.25)] backdrop-blur-sm">
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#946841]/15 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 bottom-10 h-24 w-24 rounded-full bg-[#5B300E]/20 blur-2xl" />

        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-[#2E160C] mb-6">
            {contact ? 'Editar Contacto' : 'Nuevo Contacto'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#5B300E]">
                Nombre
              </label>
              <input
                type="text"
                placeholder="Nombre del contacto"
                {...register('contact_name', { required: 'Nombre requerido' })}
                className="w-full rounded-xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-2.5 text-[#2E160C] outline-none transition placeholder:text-[#946841]/70 focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/30"
              />
              {errors.contact_name && (
                <p className="text-sm text-[#5B300E]">{errors.contact_name.message}</p>
              )}
            </div>

            {/* Tipo */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#5B300E]">
                Tipo
              </label>
              <input
                type="text"
                placeholder="Ej: Gerente, Chef, etc."
                {...register('contact_type', { required: 'Tipo requerido' })}
                className="w-full rounded-xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-2.5 text-[#2E160C] outline-none transition placeholder:text-[#946841]/70 focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/30"
              />
              {errors.contact_type && (
                <p className="text-sm text-[#5B300E]">{errors.contact_type.message}</p>
              )}
            </div>

            {/* Posición */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#5B300E]">
                Posición
              </label>
              <input
                type="text"
                placeholder="Posición o cargo"
                {...register('contact_position')}
                className="w-full rounded-xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-2.5 text-[#2E160C] outline-none transition placeholder:text-[#946841]/70 focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/30"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#5B300E]">
                Email
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                {...register('contact_email', { required: 'Email requerido' })}
                className="w-full rounded-xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-2.5 text-[#2E160C] outline-none transition placeholder:text-[#946841]/70 focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/30"
              />
              {errors.contact_email && (
                <p className="text-sm text-[#5B300E]">{errors.contact_email.message}</p>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#5B300E]">
                Teléfono
              </label>
              <input
                type="tel"
                placeholder="+34 123 456 789"
                {...register('contact_phone_number', { required: 'Teléfono requerido' })}
                className="w-full rounded-xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-2.5 text-[#2E160C] outline-none transition placeholder:text-[#946841]/70 focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/30"
              />
              {errors.contact_phone_number && (
                <p className="text-sm text-[#5B300E]">{errors.contact_phone_number.message}</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-[#5B300E] hover:bg-[#946841] text-[#FCF0CA] rounded-xl font-semibold transition"
              >
                {contact ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-[#7F532C] hover:bg-[#5B300E] text-[#FCF0CA] rounded-xl font-semibold transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
}

export default ContactsPage
