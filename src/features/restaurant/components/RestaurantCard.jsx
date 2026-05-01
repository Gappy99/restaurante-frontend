import { getRestaurantStatusLabel } from '../utils/restaurantUtils.js'
import { Link } from 'react-router-dom'

/* eslint-disable react/prop-types */
const RestaurantCard = ({ restaurant, onEdit, onDelete }) => {
  const handleDelete = async () => {
    if (
      window.confirm(
        `¿Estás seguro que deseas eliminar "${restaurant.restaurant_name}"?`
      )
    ) {
      const result = await onDelete(restaurant._id)
      if (result.success) {
        // Lógica de éxito mantenida
      }
    }
  }

  return (
    <div className="bg-[#946841]/30 backdrop-blur-md border border-[#946841]/60 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-black/60 transition-all duration-500 group">
      {/* Sección de Imagen */}
      <div className="relative h-48 overflow-hidden bg-[#946841]">
        {restaurant.restaurant_images?.[0] ? (
          <img
            src={restaurant.restaurant_images[0] + '?t=' + (restaurant.updatedAt || Date.now())}
            alt={restaurant.restaurant_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-medium italic">
            Sin imagen
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#946841] via-transparent to-transparent opacity-70" />
      </div>

      {/* Contenido */}
      <div className="p-6 bg-[#FCF0CA]">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-black text-xl font-bold truncate">{restaurant.restaurant_name}</h3>
          <span className="bg-[#946841] text-[#FCF0CA] text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter">
            {getRestaurantStatusLabel(restaurant.estado)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-[10px] text-black border border-[#946841] px-2 py-0.5 rounded italic">
            {restaurant.restaurant_type}
          </span>
          <span className="text-[10px] text-black border border-[#946841] px-2 py-0.5 rounded italic">
            {restaurant.restaurant_type_gastronomic}
          </span>
        </div>

        <div className="space-y-2 text-sm text-black font-light border-t border-[#946841]/20 pt-4">
          <p className="truncate"><span className="text-[#946841] mr-1">📍</span> {restaurant.restaurant_direction}</p>
          <p><span className="text-[#946841] mr-1">🕐</span> {restaurant.restaurant_time_start} - {restaurant.restaurant_time_close}</p>
          <p className="text-black font-semibold"><span className="text-[#946841] mr-1">💰</span> ${restaurant.restaurant_mean_price}</p>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => onEdit(restaurant)}
            className="flex-1 py-2 rounded-xl bg-[#946841] hover:bg-[#7F532C] text-[#FCF0CA] text-sm font-medium transition-colors"
          >
            ✏️ Editar
          </button>
          <Link
            to={`/restaurants/${restaurant._id || restaurant.id}`}
            className="px-3 py-2 rounded-xl border border-[#946841]/60 bg-[#946841]/10 text-black hover:bg-[#946841]/20 transition-all flex items-center justify-center font-medium"
          >
            🍽️ Ver
          </Link>
          <button
            onClick={handleDelete}
            className="px-3 py-2 rounded-xl border border-red-400/60 hover:bg-red-400/20 text-red-600 transition-all font-medium"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

export default RestaurantCard