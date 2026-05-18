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
    <div className="bg-[#9ca3af]/30 backdrop-blur-md border border-[#9ca3af]/60 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-black/60 transition-all duration-500 group">
      {/* Sección de Imagen */}
      <div className="relative h-48 overflow-hidden bg-[#9ca3af]">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#9ca3af] via-transparent to-transparent opacity-70" />
      </div>

      {/* Contenido */}
      <div className="p-6 bg-[#f8fafc]">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-black text-xl font-bold truncate">{restaurant.restaurant_name}</h3>
          <span className="bg-[#9ca3af] text-[#f8fafc] text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter">
            {getRestaurantStatusLabel(restaurant.estado)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-[10px] text-black border border-[#9ca3af] px-2 py-0.5 rounded italic">
            {restaurant.restaurant_type}
          </span>
          <span className="text-[10px] text-black border border-[#9ca3af] px-2 py-0.5 rounded italic">
            {restaurant.restaurant_type_gastronomic}
          </span>
        </div>

        <div className="space-y-2 text-sm text-black font-light border-t border-[#9ca3af]/20 pt-4">
          <p className="truncate">{restaurant.restaurant_direction}</p>
          <p>{restaurant.restaurant_time_start} - {restaurant.restaurant_time_close}</p>
          <p className="text-black font-semibold">${restaurant.restaurant_mean_price}</p>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => onEdit(restaurant)}
            className="flex-1 py-2 rounded-xl bg-[#9ca3af] hover:bg-[#6b7280] text-[#f8fafc] text-sm font-medium transition-colors"
          >
            Editar
          </button>
          <Link
            to={`/loby/restaurants/${restaurant._id || restaurant.id}`}
            className="px-3 py-2 rounded-xl border border-[#9ca3af]/60 bg-[#9ca3af]/10 text-black hover:bg-[#9ca3af]/20 transition-all flex items-center justify-center font-medium"
          >
            Ver
          </Link>
          <button
            onClick={handleDelete}
            className="px-3 py-2 rounded-xl border border-red-400/60 hover:bg-red-400/20 text-red-600 transition-all font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default RestaurantCard