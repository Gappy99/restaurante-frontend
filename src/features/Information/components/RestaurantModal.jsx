import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

const categoryOptions = [
  'Comida rápida',
  'Gourmet',
  'Casera',
  'Bebidas',
  'Café',
  'Postres',
  'Michelin',
]

const cuisineOptions = [
  'Italiana',
  'Mexicana',
  'Colombiana',
  'Japonesa',
  'Vegana',
  'Micheline',
]

const RestaurantModal = ({ isOpen, onClose, restaurant, onSave }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()

  const [preview, setPreview] = useState(null)
  const photoFile = watch('logo')

  useEffect(() => {
    if (isOpen) {
      if (restaurant) {
        reset({
          nombre: restaurant.nombre || '',
          descripcion: restaurant.descripcion || '',
          categoria: restaurant.categoria || '',
          tipoCocina: restaurant.tipoCocina || '',
          ciudad: restaurant.ciudad || '',
          telefono: restaurant.telefono || '',
          email: restaurant.email || '',
          direccion: restaurant.direccion || '',
          pedidosOnline: restaurant.pedidosOnline || false,
          delivery: restaurant.delivery || false,
          impuestos: restaurant.impuestos || '',
          logo: null,
        })
        setPreview(restaurant.logo || null)
      } else {
        reset({
          nombre: '',
          descripcion: '',
          categoria: '',
          tipoCocina: '',
          ciudad: '',
          telefono: '',
          email: '',
          direccion: '',
          pedidosOnline: false,
          delivery: false,
          impuestos: '',
          logo: null,
        })
        setPreview(null)
      }
    }
  }, [isOpen, restaurant, reset])

  useEffect(() => {
    if (photoFile && photoFile.length > 0) {
      const file = photoFile[0]
      setPreview(URL.createObjectURL(file))
    }
  }, [photoFile])

  const onSubmit = async (data) => {
    const preparedLogo = data.logo && data.logo.length > 0
      ? URL.createObjectURL(data.logo[0])
      : restaurant?.logo || ''

    await onSave({
      nombre: data.nombre,
      descripcion: data.descripcion,
      categoria: data.categoria,
      tipoCocina: data.tipoCocina,
      ciudad: data.ciudad,
      telefono: data.telefono,
      email: data.email,
      direccion: data.direccion,
      pedidosOnline: data.pedidosOnline,
      delivery: data.delivery,
      impuestos: data.impuestos,
      logo: preparedLogo,
    })

    reset()
    setPreview(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg md:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div
          className="p-4 sm:p-5 text-[var(--surface)] sticky top-0 z-10"
          style={{
            background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)',
          }}
        >
          <h2 className="text-xl sm:text-2xl font-bold">
            {restaurant ? 'Editar restaurante' : 'Nuevo restaurante'}
          </h2>
          <p className="text-xs sm:text-sm opacity-80">
            Completa la información del restaurante
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          <div className="flex justify-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent)] flex items-center justify-center overflow-hidden shadow-inner">
              {preview ? (
                <img src={preview} className="w-full object-cover" alt="Preview" />
              ) : (
                <span className="text-[var(--text)] text-xs sm:text-sm">Sin imagen</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-[var(--text)] mb-1">Nombre del restaurante</label>
              <input
                className="w-full px-3 py-2 rounded-lg border-2 border-[var(--accent-soft)] bg-[var(--surface)] shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition"
                placeholder="Ej. La Buena Mesa"
                {...register('nombre', {
                  required: 'El nombre es obligatorio',
                  minLength: { value: 3, message: 'Debe tener al menos 3 caracteres' },
                })}
              />
              {errors.nombre && <p className="text-[var(--danger)] text-xs mt-1">{errors.nombre.message}</p>}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[var(--text)] mb-1">Categoría</label>
              <select
                className="w-full px-3 py-2 rounded-lg border-2 border-[var(--accent-soft)] bg-[var(--surface)] shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition"
                {...register('categoria', { required: 'La categoría es obligatoria' })}
              >
                <option value="">Seleccione una categoría</option>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.categoria && <p className="text-[var(--danger)] text-xs mt-1">{errors.categoria.message}</p>}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[var(--text)] mb-1">Tipo de cocina</label>
              <select
                className="w-full px-3 py-2 rounded-lg border-2 border-[var(--accent-soft)] bg-[var(--surface)] shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition"
                {...register('tipoCocina', { required: 'El tipo de cocina es obligatorio' })}
              >
                <option value="">Seleccione un tipo</option>
                {cuisineOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.tipoCocina && <p className="text-[var(--danger)] text-xs mt-1">{errors.tipoCocina.message}</p>}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[var(--text)] mb-1">Ciudad</label>
              <input
                className="w-full px-3 py-2 rounded-lg border-2 border-[var(--accent-soft)] bg-[var(--surface)] shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition"
                placeholder="Ciudad"
                {...register('ciudad', { required: 'La ciudad es obligatoria' })}
              />
              {errors.ciudad && <p className="text-[var(--danger)] text-xs mt-1">{errors.ciudad.message}</p>}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[var(--text)] mb-1">Teléfono</label>
              <input
                className="w-full px-3 py-2 rounded-lg border-2 border-[var(--accent-soft)] bg-[var(--surface)] shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition"
                placeholder="Ej. +57 300 000 0000"
                {...register('telefono', { required: 'El teléfono es obligatorio' })}
              />
              {errors.telefono && <p className="text-[var(--danger)] text-xs mt-1">{errors.telefono.message}</p>}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[var(--text)] mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded-lg border-2 border-[var(--accent-soft)] bg-[var(--surface)] shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition"
                placeholder="email@restaurante.com"
                {...register('email', { required: 'El email es obligatorio' })}
              />
              {errors.email && <p className="text-[var(--danger)] text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-[var(--text)] mb-1">Descripción</label>
              <textarea
                className="w-full px-3 py-2 rounded-lg border-2 border-[var(--accent-soft)] bg-[var(--surface)] shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition"
                placeholder="Detalles del restaurante..."
                {...register('descripcion', { required: 'La descripción es obligatoria' })}
              />
              {errors.descripcion && <p className="text-[var(--danger)] text-xs mt-1">{errors.descripcion.message}</p>}
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-[var(--text)] mb-1">Imagen del restaurante</label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-3 py-2 rounded-lg border-2 border-dashed border-[var(--accent-soft)] bg-[var(--surface)] hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition cursor-pointer"
                {...register('logo')}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                onClose()
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[var(--accent-soft)] text-[var(--text)] hover:bg-[#c1937e] transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 rounded-lg text-white font-medium transition shadow"
              style={{
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)',
                border: 'none',
              }}
            >
              {isSubmitting ? 'Guardando...' : restaurant ? 'Guardar Cambios' : 'Crear Restaurante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

RestaurantModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  restaurant: PropTypes.object,
  onSave: PropTypes.func.isRequired,
}

export default RestaurantModal
