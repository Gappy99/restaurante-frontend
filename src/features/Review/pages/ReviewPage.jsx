import { useEffect, useMemo, useState } from 'react'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { useReviewStore } from '../store/useReviewStore'
import { ReviewCard } from '../components/ReviewCard'
import { ReviewModal } from '../components/ReviewModal'

const StarSummary = ({ label, value, accent = 'bg-[#5B300E]' }) => (
  <div className="rounded-2xl border border-[#FCF0CA] bg-white p-4 shadow-sm">
    <p className="text-sm font-medium text-[#7F532C]">{label}</p>
    <div className="mt-2 flex items-end justify-between gap-3">
      <span className="text-3xl font-black text-[#2E160C]">{value}</span>
      <span className={`${accent} h-2.5 flex-1 rounded-full`} />
    </div>
  </div>
)

export default function ReviewPage() {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.rol === 'ADMIN'
  const currentUserId = user?._id || user?.id || user?.user_id || ''
  const { reviews, loading, fetchReviews, removeReview } = useReviewStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [restaurantIdInput, setRestaurantIdInput] = useState('')

  useEffect(() => {
    fetchReviews('')
  }, [fetchReviews])

  const filteredReviews = useMemo(() => {
    if (!restaurantIdInput.trim()) return reviews
    return reviews.filter((review) => {
      const restaurant = review.restaurant_id || {}
      const reviewRestaurantId = restaurant?._id || restaurant?.id || review.restaurant_id
      return String(reviewRestaurantId || '').includes(restaurantIdInput.trim())
    })
  }, [reviews, restaurantIdInput])

  const stats = useMemo(() => {
    const total = filteredReviews.length
    const average = total
      ? (filteredReviews.reduce((accumulator, review) => accumulator + (Number(review.rating) || 0), 0) / total).toFixed(1)
      : '0.0'
    const fiveStars = filteredReviews.filter((review) => Number(review.rating) === 5).length

    return { total, average, fiveStars }
  }, [filteredReviews])

  const handleOpenCreate = () => {
    setEditingReview(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (review) => {
    setEditingReview(review)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingReview(null)
    setIsModalOpen(false)
  }

  const handleSearch = async (event) => {
    event.preventDefault()
    await fetchReviews(restaurantIdInput.trim())
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Deseas eliminar esta reseña?')) {
      await removeReview(id)
    }
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-[#FCF0CA] bg-gradient-to-br from-[#FFF8E4] via-[#FFFFFF] to-[#F8E5C5] p-6 shadow-[0_24px_70px_rgba(46,22,12,0.12)]">
        <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[#946841]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-[#5B300E]/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-[#7F532C]/20 bg-[#FCF0CA] px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#5B300E]">
              Review
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-[#2E160C]">
              Opiniones y calificaciones de restaurantes
            </h1>
            <p className="mt-3 text-base leading-7 text-[#7F532C]">
              Crea, edita y revisa reseñas conectadas directamente al backend. El formulario usa tu sesión activa y el restaurante se identifica por su ID.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center rounded-2xl bg-[#5B300E] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#5B300E]/20 transition hover:-translate-y-0.5 hover:bg-[#2E160C]"
          >
            + Nueva reseña
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StarSummary label="Reseñas visibles" value={stats.total} accent="bg-[#5B300E]" />
        <StarSummary label="Promedio" value={stats.average} accent="bg-amber-400" />
        <StarSummary label="5 estrellas" value={stats.fiveStars} accent="bg-emerald-500" />
      </section>

      <section className="rounded-[28px] border border-[#FCF0CA] bg-white p-6 shadow-[0_18px_44px_rgba(46,22,12,0.08)]">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-[#2E160C]">Filtrar por restaurante</h2>
            <p className="mt-1 text-sm text-[#7F532C]">
              Puedes escribir el ID del restaurante para ver solo sus reseñas. Si lo dejas vacío, se muestran todas las cargadas.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <input
              value={restaurantIdInput}
              onChange={(event) => setRestaurantIdInput(event.target.value)}
              placeholder="ID del restaurante"
              className="min-w-[260px] rounded-xl border border-[#E8D8B5] bg-[#FFFDF8] px-4 py-3 text-[#2E160C] outline-none transition focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/20"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#FCF0CA] px-5 py-3 font-semibold text-[#5B300E] transition hover:bg-[#F3D9A0]"
            >
              Buscar
            </button>
          </div>
        </form>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#FCF0CA] border-t-[#5B300E]" />
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {filteredReviews.map((review) => {
            const reviewId = review._id || review.id
            const ownerId = review.user_id?._id || review.user_id?.id || review.user_id
            const canManage = isAdmin || String(ownerId || '') === String(currentUserId || '')

            return (
              <ReviewCard
                key={reviewId}
                review={review}
                canManage={canManage}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            )
          })}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-[#E8D8B5] bg-white p-14 text-center shadow-[0_18px_44px_rgba(46,22,12,0.06)]">
          <p className="text-xl font-semibold text-[#2E160C]">No hay reseñas disponibles</p>
          <p className="mt-2 text-sm text-[#7F532C]">
            Crea una nueva reseña o limpia el filtro para ver los registros obtenidos del backend.
          </p>
        </div>
      )}

      {isModalOpen && (
        <ReviewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          review={editingReview}
        />
      )}
    </div>
  )
}