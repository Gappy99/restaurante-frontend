import { lazy, Suspense, useEffect, useState } from 'react'
import { useRef } from 'react'
import { useRestaurantForm } from '../hooks/useRestaurants.jsx'
import { validateRestaurantForm, formatRestaurantData } from '../utils/restaurantUtils.js'
import {
  RESTAURANT_TYPES,
  GASTRONOMIC_TYPES,
  RESTAURANT_MESSAGES,
  DEFAULT_TIME_START,
  DEFAULT_TIME_CLOSE,
} from '../constants/restaurantConstants.js'
import toast from 'react-hot-toast'
import { FiX } from 'react-icons/fi'

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
  <div className="flex h-full w-full items-center justify-center bg-zinc-900/70 text-zinc-300 text-sm">
    Cargando selector de mapa...
  </div>
)

/* eslint-disable react/prop-types */
const RestaurantModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const { handleCreate, handleUpdate, loading, error, clearError } = useRestaurantForm()

  const [formData, setFormData] = useState(buildInitialFormData(initialData))

  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState(initialData?.restaurant_images?.[0] || null)
  const [geocoding, setGeocoding] = useState(false)
  const geocodeTimer = useRef(null)
  const fileInputRef = useRef(null)

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

  const geocodeAddress = async (address) => {
    if (!address || !address.trim()) return null

    try {
      setGeocoding(true)
      const q = encodeURIComponent(address.trim())
      const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&addressdetails=0`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Geocoding API error')

      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) return null

      const first = data[0]
      const lat = Number(first.lat)
      const lng = Number(first.lon)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

      return { lat, lng }
    } catch (err) {
      console.error('Geocoding error', err)
      return null
    } finally {
      setGeocoding(false)
    }
  }

  const handleAddressBlur = async () => {
    const address = formData.address
    if (!address || !address.trim()) return

    const coords = await geocodeAddress(address)
    if (coords) {
      setFormData((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }))
      setErrors((prev) => ({ ...prev, location: '' }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]

    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)
      return
    }

    // Si el usuario canceló la selección, conservar la imagen existente o eliminar la vista previa
    setFormData((prev) => ({ ...prev, image: null }))
    setPreview(initialData?.restaurant_images?.[0] || null)
  }

  const handleClearImage = () => {
    setFormData((prev) => ({ ...prev, image: null }))
    setPreview(initialData?.restaurant_images?.[0] || null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const reverseGeocode = async (lat, lng) => {
    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return null
    try {
      setGeocoding(true)
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=json&addressdetails=0`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Reverse geocoding API error')
      const data = await res.json()
      return data?.display_name || null
    } catch (err) {
      console.error('Reverse geocoding error', err)
      return null
    } finally {
      setGeocoding(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return

    const hasCoordinates = Number.isFinite(Number(initialData?.lat)) && Number.isFinite(Number(initialData?.lng))
    const hasAddress = Boolean(initialData?.restaurant_direction && initialData.restaurant_direction.trim())

    if (!initialData || !hasAddress || hasCoordinates) return

    if (geocodeTimer.current) clearTimeout(geocodeTimer.current)

    geocodeTimer.current = setTimeout(async () => {
      const coords = await geocodeAddress(initialData.restaurant_direction)
      if (coords) {
        setFormData((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }))
      }
    }, 500)

    return () => {
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current)
    }
  }, [isOpen, initialData])

  const handleLocationSelect = ({ lat, lng }) => {
    setFormData((prev) => ({ ...prev, lat, lng }))

    // Intentar obtener dirección a partir de las coordenas seleccionadas
    ;(async () => {
      try {
        const addr = await reverseGeocode(lat, lng)
        if (addr) setFormData((prev) => ({ ...prev, address: addr }))
      } catch (err) {
        // noop
      }
    })()

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

  const inputStyles = "w-full bg-white border border-zinc-300 rounded-xl px-4 py-2.5 text-zinc-900 focus:border-zinc-900 focus:outline-none transition-all placeholder:text-zinc-400"

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-zinc-950 border border-zinc-700 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-700/60 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">
            {initialData ? 'Editar Restaurante' : 'Nuevo Restaurante'}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl" aria-label="Cerrar">
            <FiX aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 max-h-[80vh] overflow-y-auto space-y-6 flex flex-col">
          {error && <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm">{error}</div>}

          {/* Nombre */}
          <div className="w-full flex flex-col items-start"> 
            <label className="text-zinc-400 text-[10px] font-bold uppercase mb-1 ml-1">
            </label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              placeholder="Escribe el nombre aquí"
              className={`${inputStyles} ${errors.name ? 'border-red-500' : ''}`} 
            />
            {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* Tipo */}
            <div className="flex flex-col">
              <label className="text-zinc-400 text-[10px] font-bold uppercase mb-2 ml-1 text-left">
              </label>
              <select name="type" value={formData.type} onChange={handleInputChange} className={inputStyles}>
                <option value="">Selecciona</option>
                {RESTAURANT_TYPES.map(t => <option key={t} value={t} className="bg-white text-zinc-900">{t}</option>)}
              </select>
            </div>

            {/* Tipo Gastronómico */}
            <div className="flex flex-col">
              <label className="text-zinc-400 text-[10px] font-bold uppercase mb-2 ml-1 text-left">
              </label>
              <select name="gastronomicType" value={formData.gastronomicType} onChange={handleInputChange} className={inputStyles}>
                <option value="">Selecciona</option>
                {GASTRONOMIC_TYPES.map(t => <option key={t} value={t} className="bg-white text-zinc-900">{t}</option>)}
              </select>
            </div>
          </div>

          {/* Dirección */}
          <div className="w-full flex flex-col items-start">
            <label className="text-zinc-400 text-[10px] font-bold uppercase mb-1 ml-1">
            </label>
            <input 
              name="address" 
              value={formData.address} 
              onChange={handleInputChange} 
              onBlur={handleAddressBlur}
              placeholder="Ej. Zona 15, Ciudad de Guatemala"
              className={inputStyles} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            {/* Apertura */}
            <div className="flex flex-col">
              <label className="text-zinc-400 text-[10px] font-bold uppercase mb-2 ml-1 text-center">
              </label>
              <input type="time" name="timeStart" value={formData.timeStart} onChange={handleInputChange} className={inputStyles} />
            </div>

            {/* Cierre */}
            <div className="flex flex-col">
              <label className="text-zinc-400 text-[10px] font-bold uppercase mb-2 ml-1 text-center">
              </label>
              <input type="time" name="timeClose" value={formData.timeClose} onChange={handleInputChange} className={inputStyles} />
            </div>
          </div>

          {/* Precio y Imagen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end w-full">
            <div className="flex flex-col">
              <label className="text-zinc-400 text-[10px] font-bold uppercase mb-2 ml-1 text-left">
              </label>
              <input type="number" name="meanPrice" value={formData.meanPrice} onChange={handleInputChange} className={inputStyles} />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-zinc-400 text-[10px] font-bold uppercase ml-1 text-left">
                Imagen del restaurante
              </label>
              <div className="relative flex items-center gap-4 bg-zinc-900 p-3 rounded-2xl border border-zinc-700 overflow-hidden">
                {preview && (
                  <img
                    src={preview}
                    className="w-12 h-12 rounded-lg object-cover border border-zinc-600 flex-shrink-0"
                    alt="Vista previa de imagen"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = ''
                    }}
                  />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1 text-[10px] text-zinc-300 cursor-pointer
                    file:mr-3 file:py-1 file:px-3
                    file:rounded-full file:border-0
                    file:bg-zinc-200 file:text-zinc-900
                    file:font-bold file:text-[10px]"
                />
              </div>
              {preview && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="self-start text-xs text-zinc-300 hover:text-white transition-colors"
                >
                  Quitar imagen
                </button>
              )}
            </div>
          </div>

          {/* Mapa de ubicación */}
          <div className="hidden lg:flex gap-4 w-full">
            <div className="w-[360px] bg-zinc-950 border border-zinc-700 border-r-0 rounded-l-3xl rounded-r-none shadow-2xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-zinc-700/60">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Ubicación en mapa *
                </h3>
              </div>

              <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-900/50 flex-1 min-h-[320px]">
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

                <span className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1 text-zinc-200 text-xs self-start">
                  {formData.lat !== null && formData.lng !== null
                    ? `Lat ${formData.lat.toFixed(6)} · Lng ${formData.lng.toFixed(6)}`
                    : 'Haz clic en el mapa para fijar la sede'}
                </span>

                {errors.location && <p className="text-red-400 text-xs">{errors.location}</p>}
              </div>
            </div>
          </div>

          <div className="lg:hidden space-y-3 w-full">
            <label className="block text-zinc-400 text-[10px] font-bold uppercase ml-1">
              Ubicación en mapa *
            </label>
            <div className="rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-900/50 h-[240px]">
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
            <span className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1 text-zinc-200 text-xs inline-block">
              {formData.lat !== null && formData.lng !== null
                ? `Lat ${formData.lat.toFixed(6)} · Lng ${formData.lng.toFixed(6)}`
                : 'Haz clic en el mapa para fijar la sede'}
            </span>
            {errors.location && <p className="text-red-400 text-xs ml-1">{errors.location}</p>}
          </div>

          {/* Footer */}
          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl border border-zinc-500 text-zinc-100 font-medium hover:bg-zinc-800 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-zinc-800 to-black text-white font-bold shadow-xl shadow-black/30 hover:scale-[1.02] active:scale-95 transition-all">
              {loading ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RestaurantModal