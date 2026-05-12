import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useReviewStore } from '../store/useReviewStore'
import useAuthStore from '../../../shared/stores/useAuthStore'

const StarSelector = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`rounded-full px-3 py-2 text-lg font-black transition ${
            star <= value
              ? 'bg-amber-400 text-[#2E160C] shadow-sm'
              : 'bg-[#FCF0CA] text-[#7F532C] hover:bg-[#F6E3B5]'
          }`}
          aria-label={`Seleccionar ${star} estrellas`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export const ReviewModal = ({ isOpen, onClose, review, restaurants = [] }) => {
  const currentUser = useAuthStore((state) => state.user)
  const currentUserId = currentUser?._id || currentUser?.id || currentUser?.user_id || ''
  const saveReview = useReviewStore((state) => state.saveReview)
  const loading = useReviewStore((state) => state.loading)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      restaurant_id: '',
      rating: 5,
      comment: '',
    },
  })

  const rating = watch('rating')

  useEffect(() => {
    if (!isOpen) return

    if (review) {
      reset({
        restaurant_id: review.restaurant_id?._id || review.restaurant_id?.id || review.restaurant_id || '',
        rating: review.rating || 5,
        comment: review.comment || '',
      })
      return
    }

    reset({
      restaurant_id: '',
      rating: 5,
      comment: '',
    })
  }, [isOpen, review, reset])

  const onSubmit = async (data) => {
    const payload = {
      rating: Number(data.rating),
      comment: data.comment?.trim() || '',
    }

    if (!review) {
      payload.user_id = currentUserId
      payload.restaurant_id = data.restaurant_id.trim()
    }

    const result = await saveReview(payload, review?._id || review?.id)

    if (result.success) {
      onClose()
      reset()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2E160C]/65 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[#FCF0CA] bg-white shadow-[0_30px_80px_rgba(46,22,12,0.35)]">
        <div className="bg-gradient-to-r from-[#2E160C] via-[#5B300E] to-[#7F532C] p-6 text-[#FCF0CA]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FCF0CA]/75">Review</p>
          <h2 className="mt-2 text-2xl font-bold">
            {review ? 'Editar reseña' : 'Nueva reseña'}
          </h2>
          <p className="mt-1 text-sm text-[#FCF0CA]/80">
            {review
              ? 'Ajusta tu calificación o comentario.'
              : 'Registra tu experiencia en un restaurante.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
          {!review && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#5B300E]">Restaurante</label>
              <select
                className="w-full rounded-xl border border-[#E8D8B5] bg-[#FFFDF8] px-4 py-3 text-[#2E160C] outline-none transition focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/20"
                {...register('restaurant_id', {
                  required: 'Selecciona un restaurante',
                })}
              >
                <option value="">Selecciona un restaurante</option>
                {restaurants.map((restaurant) => {
                  const restaurantId = restaurant?._id || restaurant?.id
                  return (
                    <option key={restaurantId} value={restaurantId}>
                      {restaurant?.restaurant_name || restaurant?.name || `Restaurante ${restaurantId}`}
                    </option>
                  )
                })}
              </select>
              {errors.restaurant_id && (
                <p className="text-sm text-red-600">{errors.restaurant_id.message}</p>
              )}
            </div>
          )}

          {review && (
            <div className="grid grid-cols-1 gap-4 rounded-2xl bg-[#FCF0CA]/40 p-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7F532C]">Restaurante</p>
                <p className="mt-1 text-sm font-semibold text-[#2E160C]">
                  {review.restaurant_id?.restaurant_name || review.restaurant_id?.name || review.restaurant_id || 'Sin nombre'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7F532C]">Usuario</p>
                <p className="mt-1 text-sm font-semibold text-[#2E160C]">
                  {review.user_id?.nombre || review.user_id?.email || review.user_id || 'Sin usuario'}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#5B300E]">Calificación</label>
            <StarSelector value={Number(rating) || 5} onChange={(value) => setValue('rating', value, { shouldValidate: true })} />
            <input type="hidden" {...register('rating', { required: true, valueAsNumber: true, min: 1, max: 5 })} />
            {errors.rating && <p className="text-sm text-red-600">Selecciona una calificación válida</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#5B300E]">Comentario</label>
            <textarea
              rows={5}
              placeholder="Cuéntanos qué te pareció el restaurante"
              className="w-full rounded-xl border border-[#E8D8B5] bg-[#FFFDF8] px-4 py-3 text-[#2E160C] outline-none transition placeholder:text-[#946841]/70 focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/20"
              {...register('comment', {
                maxLength: { value: 500, message: 'Máximo 500 caracteres' },
              })}
            />
            {errors.comment && <p className="text-sm text-red-600">{errors.comment.message}</p>}
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#E8D8B5] bg-white px-5 py-3 text-sm font-semibold text-[#5B300E] transition hover:bg-[#FCF0CA]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#5B300E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2E160C] disabled:cursor-not-allowed disabled:bg-[#946841]"
            >
              {loading ? 'Guardando...' : review ? 'Actualizar reseña' : 'Crear reseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}