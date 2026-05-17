import { Link, useParams } from 'react-router-dom'

const RestaurantMiniMenu = ({ restaurant }) => {
  const { id } = useParams()

  return (
    <div className="max-w-md mx-auto bg-[#2E160C] text-[#FCF0CA] rounded-2xl p-6 border border-[#7F532C]/30 shadow-lg">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{restaurant?.restaurant_name || restaurant?.name || 'Restaurante'}</h2>
        <p className="text-sm text-[#946841]">Opciones rápidas</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          className="text-center py-3 px-2 rounded-lg bg-[#5B300E]/20 opacity-60 cursor-not-allowed"
          disabled
        >
          Menú
        </button>
        <Link to={`/loby/restaurants/${id}/tables`} className="text-center py-3 px-2 rounded-lg bg-[#7F532C] text-[#FCF0CA] font-semibold hover:bg-[#946841]">
          Mesas
        </Link>
        <Link to={`/loby/restaurants/${id}/reviews`} className="text-center py-3 px-2 rounded-lg bg-[#946841] text-[#FCF0CA] font-semibold hover:bg-[#7F532C]">
          Reseñas
        </Link>
        <button
          type="button"
          className="text-center py-3 px-2 rounded-lg bg-[#5B300E]/20 opacity-60 cursor-not-allowed"
          disabled
        >
          Reservación
        </button>
      </div>
    </div>
  )
}

export default RestaurantMiniMenu
