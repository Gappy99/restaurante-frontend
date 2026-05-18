import PropTypes from 'prop-types'

export default function CustomerRestaurantCard({ restaurant, onView }) {
  const name = restaurant.restaurant_name || restaurant.name || 'Sin nombre'
  const address = restaurant.restaurant_direction || restaurant.address || ''
  const time = `${restaurant.restaurant_time_start || ''} - ${restaurant.restaurant_time_close || ''}`
  const price = restaurant.restaurant_mean_price || restaurant.mean_price || ''

  return (
    <div className="bg-[#946841]/20 backdrop-blur-sm border border-[#946841]/40 rounded-3xl overflow-hidden transition-shadow hover:shadow-2xl">
      <div className="relative h-44 bg-[#946841]">
        {restaurant.restaurant_images?.[0] ? (
          <img
            src={restaurant.restaurant_images[0]}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-medium italic">Sin imagen</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#946841] via-transparent to-transparent opacity-60" />
      </div>

      <div className="p-5 bg-[#FCF0CA]">
        <div className="flex justify-between items-start">
          <h3 className="text-black text-lg font-bold truncate">{name}</h3>
        </div>

        <p className="mt-3 text-sm text-[#5B300E] truncate">{address}</p>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-[#5B300E]">{time}</div>
          <div className="text-sm font-semibold text-[#5B300E]">{price ? `$${price}` : ''}</div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => onView(restaurant)}
            className="w-full py-2 rounded-lg bg-[#7F532C] text-[#FCF0CA] font-bold"
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
