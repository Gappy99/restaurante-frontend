import { FiStar } from 'react-icons/fi'

const buildStars = (rating) => {
  const safeRating = Number(rating) || 0
  return Array.from({ length: 5 }, (_, index) => index < safeRating)
}

export const ReviewCard = ({ review, onEdit, onDelete, canManage }) => {
  const user = review.user_id || review.user || {}
  const restaurant = review.restaurant_id || review.restaurant || {}
  const reviewId = review._id || review.id
  const stars = buildStars(review.rating)
  const createdAt = review.created_at || review.createdAt

  return (
    <article className="group flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[#f8fafc] bg-white shadow-[0_14px_36px_rgba(46,22,12,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(46,22,12,0.16)]">
      <div className="border-b border-[#f8fafc] bg-gradient-to-r from-[#111111] via-[#1f2937] to-[#6b7280] p-5 text-[#f8fafc]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f8fafc]/75">Reseña</p>
            <h3 className="mt-2 text-lg font-bold leading-tight">
              {restaurant.restaurant_name || restaurant.name || 'Restaurante sin nombre'}
            </h3>
            <p className="mt-1 text-sm text-[#f8fafc]/80">
              {restaurant.restaurant_direction || restaurant.direction || review.restaurant_id || 'Sin restaurante asociado'}
            </p>
          </div>
          {canManage && (
            <div className="rounded-full border border-[#f8fafc]/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f8fafc]">
              Editable
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-zinc-500" aria-label={`Calificación ${review.rating} de 5`}>
            {stars.map((filled, index) => (
              <span key={index} className={filled ? 'text-zinc-500' : 'text-zinc-300'}>
                <FiStar aria-hidden="true" />
              </span>
            ))}
          </div>
          <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-bold text-[#1f2937]">
            {review.rating}/5
          </span>
        </div>

        <p className="min-h-[72px] whitespace-pre-wrap text-sm leading-6 text-[#111111]">
          {review.comment || 'Sin comentario'}
        </p>

        <div className="space-y-2 rounded-2xl bg-[#f8fafc]/50 p-4 text-sm text-[#1f2937]">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold">Usuario</span>
            <span className="truncate text-right font-medium text-[#111111]">
              {user.nombre || user.email || review.user_id || 'Usuario anónimo'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold">Creada</span>
            <span className="text-right text-[#111111]">
              {createdAt ? new Date(createdAt).toLocaleDateString('es-ES') : 'Sin fecha'}
            </span>
          </div>
        </div>
      </div>

      {canManage && (
        <div className="flex gap-3 border-t border-[#f8fafc] bg-[#f9fafb] p-5">
          <button
            type="button"
            onClick={() => onEdit(review)}
            className="flex-1 rounded-xl bg-[#1f2937] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#111111]"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(reviewId)}
            className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Eliminar
          </button>
        </div>
      )}
    </article>
  )
}