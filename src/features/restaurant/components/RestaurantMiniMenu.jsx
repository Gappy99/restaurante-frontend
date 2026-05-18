import { Link, useParams } from 'react-router-dom'

const RestaurantMiniMenu = ({ restaurant }) => {
  const { id } = useParams()

  return (
    <div className="max-w-md mx-auto bg-[#111111] text-[#f8fafc] rounded-2xl p-6 border border-[#6b7280]/30 shadow-lg">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{restaurant?.restaurant_name || restaurant?.name || 'Restaurante'}</h2>
        <p className="text-sm text-[#9ca3af]">Opciones rápidas</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          className="text-center py-3 px-2 rounded-lg bg-[#1f2937]/20 opacity-60 cursor-not-allowed"
          disabled
        >
          Menú
        </button>
        <Link to={`/loby/restaurants/${id}/tables`} className="text-center py-3 px-2 rounded-lg bg-[#6b7280] text-[#f8fafc] font-semibold hover:bg-[#9ca3af]">
          Mesas
        </Link>
        <Link to={`/loby/restaurants/${id}/reviews`} className="text-center py-3 px-2 rounded-lg bg-[#9ca3af] text-[#f8fafc] font-semibold hover:bg-[#6b7280]">
          Reseñas
        </Link>
        <button
          type="button"
          className="text-center py-3 px-2 rounded-lg bg-[#1f2937]/20 opacity-60 cursor-not-allowed"
          disabled
        >
          Reservación
        </button>
      </div>
    </div>
  )
}

export default RestaurantMiniMenu
