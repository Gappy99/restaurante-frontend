import { useState } from 'react'
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

/* eslint-disable react/prop-types */
const RestaurantModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const { handleCreate, handleUpdate, loading, error, clearError } = useRestaurantForm()

  const [formData, setFormData] = useState({
    name: initialData?.restaurant_name || '',
    type: initialData?.restaurant_type || '',
    gastronomicType: initialData?.restaurant_type_gastronomic || '',
    address: initialData?.restaurant_direction || '',
    timeStart: initialData?.restaurant_time_start || DEFAULT_TIME_START,
    timeClose: initialData?.restaurant_time_close || DEFAULT_TIME_CLOSE,
    meanPrice: initialData?.restaurant_mean_price || 0,
    image: null,
  })

  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState(initialData?.restaurant_images?.[0] || null)

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
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#2E160C] border border-[#7F532C] w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 border-b border-[#7F532C]/30 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#FCF0CA] uppercase tracking-wider">
            {initialData ? 'Editar Restaurante' : 'Nuevo Restaurante'}
          </h2>
          <button onClick={onClose} className="text-[#946841] hover:text-[#FCF0CA] text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 max-h-[80vh] overflow-y-auto space-y-6 flex flex-col">
          {error && <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm">{error}</div>}

          {/* Nombre */}
          <div className="w-full flex flex-col items-start"> 
            <label className="text-[#946841] text-[10px] font-bold uppercase mb-1 ml-1">
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
              <label className="text-[#946841] text-[10px] font-bold uppercase mb-2 ml-1 text-left">
              </label>
              <select name="type" value={formData.type} onChange={handleInputChange} className={inputStyles}>
                <option value="">Selecciona</option>
                {RESTAURANT_TYPES.map(t => <option key={t} value={t} className="bg-[#2E160C] text-[#FCF0CA]">{t}</option>)}
              </select>
            </div>

            {/* Tipo Gastronómico */}
            <div className="flex flex-col">
              <label className="text-[#946841] text-[10px] font-bold uppercase mb-2 ml-1 text-left">
              </label>
              <select name="gastronomicType" value={formData.gastronomicType} onChange={handleInputChange} className={inputStyles}>
                <option value="">Selecciona</option>
                {GASTRONOMIC_TYPES.map(t => <option key={t} value={t} className="bg-[#2E160C] text-[#FCF0CA]">{t}</option>)}
              </select>
            </div>
          </div>

          {/* Dirección */}
          <div className="w-full flex flex-col items-start">
            <label className="text-[#946841] text-[10px] font-bold uppercase mb-1 ml-1">
            </label>
            <input 
              name="address" 
              value={formData.address} 
              onChange={handleInputChange} 
              placeholder="Ej. Zona 15, Ciudad de Guatemala"
              className={inputStyles} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            {/* Apertura */}
            <div className="flex flex-col">
              <label className="text-[#946841] text-[10px] font-bold uppercase mb-2 ml-1 text-center">
              </label>
              <input type="time" name="timeStart" value={formData.timeStart} onChange={handleInputChange} className={inputStyles} />
            </div>

            {/* Cierre */}
            <div className="flex flex-col">
              <label className="text-[#946841] text-[10px] font-bold uppercase mb-2 ml-1 text-center">
              </label>
              <input type="time" name="timeClose" value={formData.timeClose} onChange={handleInputChange} className={inputStyles} />
            </div>
          </div>

          {/* Precio y Imagen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end w-full">
            <div className="flex flex-col">
              <label className="text-[#946841] text-[10px] font-bold uppercase mb-2 ml-1 text-left">
              </label>
              <input type="number" name="meanPrice" value={formData.meanPrice} onChange={handleInputChange} className={inputStyles} />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[#946841] text-[10px] font-bold uppercase ml-1 text-left">

              </label>
              <div className="relative flex items-center gap-4 bg-[#5B300E]/20 p-3 rounded-2xl border border-[#7F532C]/50 overflow-hidden">
                {preview && (
                  <img src={preview} className="w-12 h-12 rounded-lg object-cover border border-[#7F532C] flex-shrink-0" alt="Vista previa" />
                )}
                <input 
                  type="file" 
                  name="image" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="flex-1 text-[10px] text-[#946841] cursor-pointer
                    file:mr-3 file:py-1 file:px-3 
                    file:rounded-full file:border-0 
                    file:bg-[#7F532C] file:text-[#FCF0CA] 
                    file:font-bold file:text-[10px]"
                />
              </div>
            </div>
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
  )
}

export default RestaurantModal