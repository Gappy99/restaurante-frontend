import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import PropTypes from 'prop-types'

const getDateTimeLocalValue = (value) => {
  if (!value) return ''
  const date = new Date(value)
  const timezoneOffset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - timezoneOffset * 60000)
  return localDate.toISOString().slice(0, 16)
}

const CouponForm = ({ coupon, restaurants = [], onSubmit, onCancel, loading }) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      expiration_date: '',
      max_uses: '',
      max_uses_per_user: '',
      min_order_amount: '',
      restaurant_ids: '',
      active: true,
    },
  })

  useEffect(() => {
    if (!coupon) {
      reset({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        expiration_date: '',
        max_uses: '',
        max_uses_per_user: '',
        min_order_amount: '',
        restaurant_ids: '',
        active: true,
      })
      return
    }

    const restaurantIds = Array.isArray(coupon.restaurant_ids)
      ? coupon.restaurant_ids.map((restaurant) => restaurant?._id || restaurant?.id || restaurant)
      : []

    reset({
      code: coupon.code || '',
      description: coupon.description || '',
      discount_type: coupon.discount_type || 'percentage',
      discount_value: coupon.discount_value ?? '',
      expiration_date: getDateTimeLocalValue(coupon.expiration_date),
      max_uses: coupon.max_uses ?? '',
      max_uses_per_user: coupon.max_uses_per_user ?? '',
      min_order_amount: coupon.min_order_amount ?? '',
      restaurant_ids: restaurantIds[0] || '',
      active: coupon.active ?? true,
    })
  }, [coupon, reset])

  const discount_type = useWatch({ control, name: 'discount_type' })

  const onFormSubmit = (data) => {
    const submitData = {
      ...data,
      discount_value: parseFloat(data.discount_value),
      max_uses: data.max_uses ? parseInt(data.max_uses, 10) : null,
      max_uses_per_user: data.max_uses_per_user ? parseInt(data.max_uses_per_user, 10) : null,
      min_order_amount: data.min_order_amount ? parseFloat(data.min_order_amount) : null,
      restaurant_ids: data.restaurant_ids ? [data.restaurant_ids] : [],
      expiration_date: new Date(data.expiration_date).toISOString(),
      active: Boolean(data.active),
    }

    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Código del cupón */}
        <div>
          <label className="block text-sm font-medium text-[#5B300E] mb-2">
            Código del Cupón *
          </label>
          <input
            type="text"
            {...register('code', {
              required: 'El código es requerido',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: DESC10"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-[#5B300E] mb-2">
            Descripción *
          </label>
          <input
            type="text"
            {...register('description', {
              required: 'La descripción es requerida',
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción del cupón"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Tipo de descuento */}
        <div>
          <label className="block text-sm font-medium text-[#5B300E] mb-2">
            Tipo de Descuento *
          </label>
          <select
            {...register('discount_type', { required: 'Selecciona un tipo' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="percentage">Porcentaje</option>
            <option value="amount">Monto fijo</option>
          </select>
          {errors.discount_type && (
            <p className="mt-1 text-sm text-red-600">{errors.discount_type.message}</p>
          )}
        </div>

        {/* Valor del descuento */}
        <div>
          <label className="block text-sm font-medium text-[#5B300E] mb-2">
            Valor del Descuento *
          </label>
          <input
            type="number"
            step={discount_type === 'percentage' ? '0.01' : '0.01'}
            {...register('discount_value', {
              required: 'El valor es requerido',
              min: { value: 0, message: 'Debe ser mayor a 0' },
              max: discount_type === 'percentage' ? { value: 100, message: 'Máximo 100%' } : undefined,
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={discount_type === 'percentage' ? '10' : '50'}
          />
          {errors.discount_value && (
            <p className="mt-1 text-sm text-red-600">{errors.discount_value.message}</p>
          )}
        </div>

        {/* Fecha de expiración */}
        <div>
          <label className="block text-sm font-medium text-[#5B300E] mb-2">
            Fecha de Expiración *
          </label>
          <input
            type="datetime-local"
            {...register('expiration_date', { required: 'La fecha de expiración es requerida' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.expiration_date && (
            <p className="mt-1 text-sm text-red-600">{errors.expiration_date.message}</p>
          )}
        </div>

        {/* Restaurante */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#5B300E] mb-2">
            Restaurante *
          </label>
          <select
            {...register('restaurant_ids', {
              required: 'Selecciona un restaurante',
            })}
            className="w-full rounded-md border border-[#B08851]/50 bg-[#FFF8F0] px-3 py-2 text-[#2E160C] focus:outline-none focus:ring-2 focus:ring-[#946841]/30"
          >
            <option value="">Selecciona un restaurante</option>
            {restaurants.map((restaurant) => {
              const restaurantId = restaurant?._id || restaurant?.id
              return (
                <option key={restaurantId} value={restaurantId}>
                  {restaurant?.restaurant_name || restaurant?.name || restaurantId}
                </option>
              )
            })}
          </select>
          {errors.restaurant_ids && (
            <p className="mt-1 text-sm text-red-600">{errors.restaurant_ids.message}</p>
          )}
        </div>

        {/* Máximo por usuario */}
        <div>
          <label className="block text-sm font-medium text-[#5B300E] mb-2">
            Usos máximos por usuario *
          </label>
          <input
            type="number"
            {...register('max_uses_per_user', {
              required: 'Este valor es requerido',
              min: { value: 1, message: 'Debe ser mayor a 0' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 1"
          />
          {errors.max_uses_per_user && (
            <p className="mt-1 text-sm text-red-600">{errors.max_uses_per_user.message}</p>
          )}
        </div>

        {/* Monto mínimo */}
        <div>
          <label className="block text-sm font-medium text-[#5B300E] mb-2">
            Monto mínimo de compra
          </label>
          <input
            type="number"
            step="0.01"
            {...register('min_order_amount', {
              min: { value: 0, message: 'Debe ser mayor o igual a 0' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 100"
          />
          {errors.min_order_amount && (
            <p className="mt-1 text-sm text-red-600">{errors.min_order_amount.message}</p>
          )}
        </div>

        {/* Activo */}
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('active')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-[#5B300E]">
            Activo
          </label>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-[#5B300E] bg-[#FEF5E5] border border-[#D4B27C] rounded-md hover:bg-[#FCE9C6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#946841]/30"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-[#5B300E] border border-transparent rounded-md hover:bg-[#4C2E0C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#946841]/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : coupon ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  )
}

CouponForm.propTypes = {
  coupon: PropTypes.object,
  restaurants: PropTypes.array,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

export default CouponForm