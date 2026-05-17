import { lazy, Suspense, useEffect, useState } from 'react'
import { useRestaurantForm } from '../hooks/useRestaurants.js'
import { validateRestaurantForm, formatRestaurantData } from '../utils/restaurantUtils.js'
import {
  RESTAURANT_TYPES,
  GASTRONOMIC_TYPES,
  RESTAURANT_MESSAGES,
  DEFAULT_TIME_START,
  DEFAULT_TIME_CLOSE,
} from '../constants/restaurantConstants.js'
import toast from 'react-hot-toast'

const LocationPickerMap = lazy(() => import('../../mapa/components/LocationPickerMap.jsx'))
const DEFAULT_GUATEMALA_LOCATION = {
  lat: 14.6349,
  lng: -90.5069,
}

const buildInitialFormData = (initialData) => ({
  name: initialData?.restaurant_name || '',
  type: initialData?.restaurant_type || '',
  gastronomicType: initialData?.restaurant_type_gastronomic || '',
  address: initialData?.restaurant_direction || '',
  timeStart: initialData?.restaurant_time_start || DEFAULT_TIME_START,
  timeClose: initialData?.restaurant_time_close || DEFAULT_TIME_CLOSE,
  meanPrice: initialData?.restaurant_mean_price || 0,
  image: null,
  lat: Number.isFinite(Number(initialData?.lat))
    ? Number(initialData?.lat)
    : (initialData ? null : DEFAULT_GUATEMALA_LOCATION.lat),
  lng: Number.isFinite(Number(initialData?.lng))
    ? Number(initialData?.lng)
    : (initialData ? null : DEFAULT_GUATEMALA_LOCATION.lng),
})

const MapLoader = () => (
  <div className="flex h-full w-full items-center justify-center bg-[#2E160C]/50 text-[#946841] text-sm">
    Cargando selector de mapa...
  </div>
)

/* eslint-disable react/prop-types */
const RestaurantModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const { handleCreate, handleUpdate, loading, error, clearError } = useRestaurantForm()

  const [formData, setFormData] = useState(buildInitialFormData(initialData))

  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState(initialData?.restaurant_images?.[0] || null)

  useEffect(() => {
    if (!isOpen) return

    setFormData(buildInitialFormData(initialData))
    setPreview(initialData?.restaurant_images?.[0] || null)
    setErrors({})
    clearError()
  }, [isOpen, initialData, clearError])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleLocationSelect = ({ lat, lng }) => {
    setFormData((prev) => ({ ...prev, lat, lng }))
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    const { isValid, errors: validationErrors } = validateRestaurantForm(formData)

    if (!isValid) {
      setErrors(validationErrors)
      toast.error(RESTAURANT_MESSAGES.VALIDATION_ERROR)
      return
    }

    try {
      const payload = formatRestaurantData(formData)
      let result = initialData ? await handleUpdate(initialData._id, payload) : await handleCreate(payload)

      if (result.success) {
        toast.success(initialData ? RESTAURANT_MESSAGES.UPDATE_SUCCESS : RESTAURANT_MESSAGES.CREATE_SUCCESS)
        onSuccess?.()
        onClose()
      } else {
        toast.error(result.error || RESTAURANT_MESSAGES.CREATE_ERROR)
      }
    } catch (err) {
      toast.error(err.message || RESTAURANT_MESSAGES.CREATE_ERROR)
    }
  }

  if (!isOpen) return null

  const inputStyles = "w-full bg-[#5B300E]/20 border border-[#7F532C]/50 rounded-xl px-4 py-2.5 text-[#FCF0CA] focus:border-[#FCF0CA] focus:outline-none transition-all placeholder:text-[#946841]/50"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="flex w-full max-w-[1220px] items-stretch justify-center" onClick={e => e.stopPropagation()}>
        <div className="w-[360px] bg-[#2E160C] border border-[#7F532C] border-r-0 rounded-l-3xl rounded-r-none shadow-2xl overflow-hidden hidden lg:flex flex-col">
          <div className="p-6 border-b border-[#7F532C]/30">
            <h3 className="text-sm font-bold text-[#FCF0CA] uppercase tracking-wider">
              Ubicación en mapa *
            </h3>
          </div>

          <div className="p-4 flex-1 flex flex-col gap-3">
            <div className="rounded-2xl overflow-hidden border border-[#7F532C]/50 bg-[#5B300E]/25 flex-1 min-h-[320px]">
              <Suspense fallback={<MapLoader />}>
                <LocationPickerMap
                  selectedPosition={{
                    lat: formData.lat,
                    lng: formData.lng,
                  }}
                  onSelectPosition={handleLocationSelect}
                />
              </Suspense>
            </div>

            <span className="rounded-full border border-[#7F532C]/50 bg-[#2E160C]/70 px-3 py-1 text-[#FCF0CA]/80 text-xs self-start">
              {formData.lat !== null && formData.lng !== null
                ? `Lat ${formData.lat.toFixed(6)} · Lng ${formData.lng.toFixed(6)}`
                : 'Haz clic en el mapa para fijar la sede'}
            </span>

            {errors.location && <p className="text-red-400 text-xs">{errors.location}</p>}
          </div>
        </div>

        <div className="bg-[#2E160C] border border-[#7F532C] w-full max-w-2xl rounded-3xl lg:rounded-l-none lg:rounded-r-3xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-[#7F532C]/30 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#FCF0CA] uppercase tracking-wider">
              {initialData ? 'Editar Restaurante' : 'Nuevo Restaurante'}
            </h2>
            <button onClick={onClose} className="text-[#946841] hover:text-[#FCF0CA] text-xl">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 max-h-[80vh] overflow-y-auto space-y-6">
            {error && <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm">{error}</div>}

            {/* Nombre */}
            <div>
              <label className="block text-[#946841] text-[10px] font-bold uppercase mb-2 ml-1">Nombre del Restaurante *</label>
              <input name="name" value={formData.name} onChange={handleInputChange} className={`${inputStyles} ${errors.name ? 'border-red-500' : ''}`} />
              {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo */}
              <div>
                <label className="block text-[#946841] text-[10px] font-bold uppercase mb-2 ml-1">Tipo *</label>
                <select name="type" value={formData.type} onChange={handleInputChange} className={inputStyles}>
                  <option value="">Selecciona</option>
                  {RESTAURANT_TYPES.map(t => <option key={t} value={t} className="bg-[#2E160C] text-[#FCF0CA]">{t}</option>)}
                </select>
              </div>

              {/* Tipo Gastronómico */}
              <div>
                <label className="block text-[#946841] text-[10px] font-bold uppercase mb-2 ml-1">Tipo Gastronómico *</label>
                <select name="gastronomicType" value={formData.gastronomicType} onChange={handleInputChange} className={inputStyles}>
                  <option value="">Selecciona</option>
                  {GASTRONOMIC_TYPES.map(t => <option key={t} value={t} className="bg-[#2E160C] text-[#FCF0CA]">{t}</option>)}
                </select>
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-[#946841] text-[10px] font-bold uppercase mb-2 ml-1">Dirección *</label>
              <input name="address" value={formData.address} onChange={handleInputChange} className={inputStyles} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Apertura */}
              <div>
                <label className="block text-[#946841] text-[10px] font-bold uppercase mb-2 ml-1 text-center">Apertura</label>
                <input type="time" name="timeStart" value={formData.timeStart} onChange={handleInputChange} className={inputStyles} />
              </div>

              {/* Cierre */}
              <div>
                <label className="block text-[#946841] text-[10px] font-bold uppercase mb-2 ml-1 text-center">Cierre</label>
                <input type="time" name="timeClose" value={formData.timeClose} onChange={handleInputChange} className={inputStyles} />
              </div>
            </div>

            {/* Precio y Imagen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-[#946841] text-[10px] font-bold uppercase mb-2 ml-1">Precio Promedio</label>
                <input type="number" name="meanPrice" value={formData.meanPrice} onChange={handleInputChange} className={inputStyles} />
              </div>

              <div className="relative">
                <label className="block text-[#946841] text-[10px] font-bold uppercase mb-2 ml-1">Imagen</label>
                <div className="flex items-center gap-3 bg-[#5B300E]/30 p-2 rounded-xl border border-[#7F532C]/50">
                  {preview && <img src={preview} className="w-10 h-10 rounded object-cover" />}
                  <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="text-[10px] text-[#946841] file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-[#7F532C] file:text-[#FCF0CA]" />
                </div>
              </div>
            </div>

            {/* Mapa en móvil */}
            <div className="lg:hidden space-y-3">
              <label className="block text-[#946841] text-[10px] font-bold uppercase ml-1">Ubicación en mapa *</label>
              <div className="rounded-2xl overflow-hidden border border-[#7F532C]/50 bg-[#5B300E]/25 h-[240px]">
                <Suspense fallback={<MapLoader />}>
                  <LocationPickerMap
                    selectedPosition={{
                      lat: formData.lat,
                      lng: formData.lng,
                    }}
                    onSelectPosition={handleLocationSelect}
                  />
                </Suspense>
              </div>
              <span className="rounded-full border border-[#7F532C]/50 bg-[#2E160C]/70 px-3 py-1 text-[#FCF0CA]/80 text-xs inline-block">
                {formData.lat !== null && formData.lng !== null
                  ? `Lat ${formData.lat.toFixed(6)} · Lng ${formData.lng.toFixed(6)}`
                  : 'Haz clic en el mapa para fijar la sede'}
              </span>
              {errors.location && <p className="text-red-400 text-xs ml-1">{errors.location}</p>}
            </div>

            {/* Footer */}
            <div className="flex gap-4 pt-6">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl border border-[#7F532C] text-[#FCF0CA] font-medium hover:bg-[#5B300E]/20 transition-all">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#7F532C] to-[#5B300E] text-[#FCF0CA] font-bold shadow-xl shadow-black/30 hover:scale-[1.02] active:scale-95 transition-all">
                {loading ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RestaurantModal