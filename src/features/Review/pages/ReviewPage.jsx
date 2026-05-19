import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { useReviewStore } from '../store/useReviewStore'
import { ReviewCard } from '../components/ReviewCard'
import { ReviewModal } from '../components/ReviewModal'
import { restaurantService } from '../../restaurant/services/restaurantService'
import { getAssignedRestaurantId, isPrivilegedRole } from '../../../shared/utils/roles'

const StarSummary = ({ label, value, accent = 'bg-[#1f2937]' }) => (
  <div className="rounded-2xl border border-[#f8fafc] bg-white p-4 shadow-sm">
    <p className="text-sm font-medium text-[#6b7280]">{label}</p>
    <div className="mt-2 flex items-end justify-between gap-3">
      <span className="text-3xl font-black text-[#111111]">{value}</span>
      <span className={`${accent} h-2.5 flex-1 rounded-full`} />
    </div>
  </div>
)

export default function ReviewPage() {
  const { id: restaurantIdParam } = useParams()
  const user = useAuthStore((state) => state.user)
  const isAdmin = isPrivilegedRole(user?.rol)
  const assignedRestaurantId = getAssignedRestaurantId(user)
  const activeRestaurantId = restaurantIdParam || assignedRestaurantId
  const currentUserId = user?._id || user?.id || user?.user_id || ''
  const { reviews, loading, fetchReviews, removeReview } = useReviewStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [restaurantNameInput, setRestaurantNameInput] = useState('')
  const [ratingSortOrder, setRatingSortOrder] = useState('')
  const [restaurants, setRestaurants] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const safeReviews = Array.isArray(reviews) ? reviews : []

  useEffect(() => {
    fetchReviews(activeRestaurantId || '')
  }, [fetchReviews, activeRestaurantId])

  useEffect(() => {
    const loadRestaurants = async () => {
      const result = await restaurantService.getRestaurants()
      if (result.success) {
        const list = Array.isArray(result.data) ? result.data : []
        if (assignedRestaurantId && !restaurantIdParam) {
          setRestaurants(list.filter((restaurant) => (restaurant._id || restaurant.id) === assignedRestaurantId))
        } else {
          setRestaurants(list)
        }

        if (restaurantIdParam) {
          const match = list.find((restaurant) => (restaurant._id || restaurant.id) === restaurantIdParam)
          setSelectedRestaurant(match || null)
        } else if (assignedRestaurantId) {
          const match = list.find((restaurant) => (restaurant._id || restaurant.id) === assignedRestaurantId)
          setSelectedRestaurant(match || null)
        } else {
          setSelectedRestaurant(null)
        }
      }
    }

    loadRestaurants()
  }, [restaurantIdParam])

  const activeRestaurantName = selectedRestaurant?.restaurant_name || selectedRestaurant?.name || ''

  const filteredReviews = useMemo(() => {
    const byRestaurantId = restaurantIdParam
      ? safeReviews.filter((review) => {
          const restaurant = review.restaurant_id || {}
          const reviewRestaurantId = restaurant?._id || restaurant?.id || review.restaurant_id
          return String(reviewRestaurantId || '') === String(restaurantIdParam)
        })
      : safeReviews

    if (!restaurantNameInput.trim()) return byRestaurantId
    const query = restaurantNameInput.trim().toLowerCase()

    return byRestaurantId.filter((review) => {
      const restaurant = review.restaurant_id || {}
      const restaurantName = restaurant?.restaurant_name || restaurant?.name || ''
      return restaurantName.toLowerCase().includes(query)
    })
  }, [safeReviews, restaurantNameInput, restaurantIdParam])

  const sortedReviews = useMemo(() => {
    const reviewsToSort = [...filteredReviews]

    if (ratingSortOrder === 'desc') {
      return reviewsToSort.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
    }

    if (ratingSortOrder === 'asc') {
      return reviewsToSort.sort((a, b) => (Number(a.rating) || 0) - (Number(b.rating) || 0))
    }

    return reviewsToSort
  }, [filteredReviews, ratingSortOrder])

  const stats = useMemo(() => {
    const total = sortedReviews.length
    const average = total
      ? (sortedReviews.reduce((accumulator, review) => accumulator + (Number(review.rating) || 0), 0) / total).toFixed(1)
      : '0.0'
    const fiveStars = sortedReviews.filter((review) => Number(review.rating) === 5).length

    return { total, average, fiveStars }
  }, [sortedReviews])

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

  const handleDelete = async (id) => {
    if (window.confirm('¿Deseas eliminar esta reseña?')) {
      await removeReview(id)
    }
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-[#f8fafc] bg-gradient-to-br from-[#FFF8E4] via-[#FFFFFF] to-[#e5e7eb] p-6 shadow-[0_24px_70px_rgba(46,22,12,0.12)]">
        <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[#9ca3af]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-[#1f2937]/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-[#6b7280]/20 bg-[#f8fafc] px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#1f2937]">
              Review
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-[#111111]">
              {activeRestaurantName
                ? `Reseñas de ${activeRestaurantName}`
                : 'Opiniones y calificaciones de restaurantes'}
            </h1>
            <p className="mt-3 text-base leading-7 text-[#6b7280]">
              {activeRestaurantName
                ? 'Aquí puedes ver todas las reseñas registradas para este restaurante.'
                : 'Crea, edita y revisa reseñas conectadas directamente al backend. El formulario usa tu sesión activa y el restaurante se identifica por su ID.'}
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center rounded-2xl bg-[#1f2937] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1f2937]/20 transition hover:-translate-y-0.5 hover:bg-[#111111]"
          >
            + Nueva reseña
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StarSummary label="Reseñas visibles" value={stats.total} accent="bg-[#1f2937]" />
        <StarSummary label="Promedio" value={stats.average} accent="bg-zinc-500" />
        <StarSummary label="5 estrellas" value={stats.fiveStars} accent="bg-emerald-500" />
      </section>

      <section className="rounded-[28px] border border-[#f8fafc] bg-white p-6 shadow-[0_18px_44px_rgba(46,22,12,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold !text-[#111111]">Filtrar por restaurante</h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              {activeRestaurantName
                ? 'Esta vista ya está enfocada en un restaurante específico. Si quieres refinar por nombre, puedes hacerlo aquí.'
                : 'Escribe el nombre del restaurante para ver sus reseñas. Si lo dejas vacío, se muestran todas.'}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <input
              value={restaurantNameInput}
              onChange={(event) => setRestaurantNameInput(event.target.value)}
              placeholder="Nombre del restaurante"
              className="min-w-[260px] rounded-xl border border-[#E8D8B5] bg-[#ffffff] px-4 py-3 !text-[#111111] placeholder:text-[#111111] caret-[#111111] outline-none transition focus:border-[#1f2937] focus:ring-2 focus:ring-[#9ca3af]/20"
            />
            <select
              value={ratingSortOrder}
              onChange={(event) => setRatingSortOrder(event.target.value)}
              className="min-w-[240px] rounded-xl border border-[#E8D8B5] bg-[#ffffff] px-4 py-3 text-[#111111] outline-none transition focus:border-[#1f2937] focus:ring-2 focus:ring-[#9ca3af]/20"
            >
              <option value="">Filtrar por valoración</option>
              <option value="desc">Mayor a menor</option>
              <option value="asc">Menor a mayor</option>
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f8fafc] border-t-[#1f2937]" />
        </div>
      ) : sortedReviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {sortedReviews.map((review) => {
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
          <p className="text-xl font-semibold text-[#111111]">Lo sentimos no hay reseñas registradas</p>
          <p className="mt-2 text-sm text-[#6b7280]">
            {activeRestaurantName
              ? 'Este restaurante aún no tiene opiniones registradas.'
              : 'Crea una nueva reseña o limpia el filtro para ver los registros obtenidos del backend.'}
          </p>
        </div>
      )}

      {isModalOpen && (
        <ReviewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          review={editingReview}
          restaurants={restaurants}
        />
      )}
    </div>
  )
}