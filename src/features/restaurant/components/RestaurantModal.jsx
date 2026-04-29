import { useState } from 'react'
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

/* eslint-disable react/prop-types */
const RestaurantModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
}) => {
  const { handleCreate, handleUpdate, loading, error, clearError } =
    useRestaurantForm()

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }))

      // Preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()

    // Validar
    const { isValid, errors: validationErrors } = validateRestaurantForm(formData)

    if (!isValid) {
      setErrors(validationErrors)
      toast.error(RESTAURANT_MESSAGES.VALIDATION_ERROR)
      return
    }

    try {
      const payload = formatRestaurantData(formData)

      let result
      if (initialData) {
        result = await handleUpdate(initialData._id, payload)
      } else {
        result = await handleCreate(payload)
      }

      if (result.success) {
        const message = initialData
          ? RESTAURANT_MESSAGES.UPDATE_SUCCESS
          : RESTAURANT_MESSAGES.CREATE_SUCCESS

        toast.success(message)
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? 'Editar Restaurante' : 'Crear Restaurante'}</h2>
          <button
            className="btn-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="restaurant-form">
          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="name">Nombre del Restaurante *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ej: La Pizzería del Centro"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          {/* Tipo y Tipo Gastronómico */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Tipo de Restaurante *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={errors.type ? 'input-error' : ''}
              >
                <option value="">Selecciona un tipo</option>
                {RESTAURANT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.type && (
                <span className="error-message">{errors.type}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="gastronomicType">Tipo Gastronómico *</label>
              <select
                id="gastronomicType"
                name="gastronomicType"
                value={formData.gastronomicType}
                onChange={handleInputChange}
                className={errors.gastronomicType ? 'input-error' : ''}
              >
                <option value="">Selecciona un tipo</option>
                {GASTRONOMIC_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.gastronomicType && (
                <span className="error-message">{errors.gastronomicType}</span>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div className="form-group">
            <label htmlFor="address">Dirección *</label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Ej: Calle Principal 123"
              className={errors.address ? 'input-error' : ''}
            />
            {errors.address && (
              <span className="error-message">{errors.address}</span>
            )}
          </div>

          {/* Horarios */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="timeStart">Hora de Apertura *</label>
              <input
                id="timeStart"
                type="time"
                name="timeStart"
                value={formData.timeStart}
                onChange={handleInputChange}
                className={errors.timeStart ? 'input-error' : ''}
              />
              {errors.timeStart && (
                <span className="error-message">{errors.timeStart}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="timeClose">Hora de Cierre *</label>
              <input
                id="timeClose"
                type="time"
                name="timeClose"
                value={formData.timeClose}
                onChange={handleInputChange}
                className={errors.timeClose ? 'input-error' : ''}
              />
              {errors.timeClose && (
                <span className="error-message">{errors.timeClose}</span>
              )}
            </div>
          </div>

          {/* Precio Promedio */}
          <div className="form-group">
            <label htmlFor="meanPrice">Precio Promedio *</label>
            <input
              id="meanPrice"
              type="number"
              name="meanPrice"
              value={formData.meanPrice}
              onChange={handleInputChange}
              placeholder="Ej: 45.50"
              min="0"
              step="0.01"
              className={errors.meanPrice ? 'input-error' : ''}
            />
            {errors.meanPrice && (
              <span className="error-message">{errors.meanPrice}</span>
            )}
          </div>

          {/* Imagen */}
          <div className="form-group">
            <label htmlFor="image">Imagen del Restaurante</label>
            <div className="image-upload">
              {preview && (
                <div className="image-preview">
                  <img src={preview} alt="Preview" />
                </div>
              )}
              <input
                id="image"
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RestaurantModal
