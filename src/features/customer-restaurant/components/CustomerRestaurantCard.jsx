import PropTypes from 'prop-types'

export default function CustomerRestaurantCard({ restaurant, onView }) {
  const name = restaurant.restaurant_name || restaurant.name || 'Sin nombre'
  const address = restaurant.restaurant_direction || restaurant.address || ''
  const time = `${restaurant.restaurant_time_start || ''} - ${restaurant.restaurant_time_close || ''}`
  const price = restaurant.restaurant_mean_price || restaurant.mean_price || ''

  return (
    <div className="bg-[#9ca3af]/20 backdrop-blur-sm border border-[#9ca3af]/40 rounded-3xl overflow-hidden transition-shadow hover:shadow-2xl">
      <div className="relative h-44 bg-[#9ca3af]">
        {restaurant.restaurant_images?.[0] ? (
          <img
            src={restaurant.restaurant_images[0]}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-medium italic">Sin imagen</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#9ca3af] via-transparent to-transparent opacity-60" />
      </div>

      <div className="p-5 bg-[#f8fafc]">
        <div className="flex justify-between items-start">
          <h3 className="text-black text-lg font-bold truncate">{name}</h3>
        </div>

        <p className="mt-3 text-sm text-[#1f2937] truncate">{address}</p>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-[#1f2937]">{time}</div>
          <div className="text-sm font-semibold text-[#1f2937]">{price ? `$${price}` : ''}</div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => onView(restaurant)}
            className="w-full py-2 rounded-lg bg-[#6b7280] text-[#f8fafc] font-bold"
          >
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  )
}

CustomerRestaurantCard.propTypes = {
  restaurant: PropTypes.object.isRequired,
  onView: PropTypes.func.isRequired,
}
