import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

const LAST_RESTAURANT_KEY = 'customer:lastRestaurant'

export default function RestaurantViewModal({ isOpen, onClose, restaurant }) {
  const navigate = useNavigate()

  if (!isOpen || !restaurant) return null

  const name = restaurant.restaurant_name || restaurant.name || 'SIN NOMBRE'
  const address = restaurant.restaurant_direction || restaurant.address || ''
  const images = restaurant.restaurant_images || []
  const id = restaurant._id || restaurant.id

  const goTo = (path) => {
    navigate(path)
    onClose()
  }

  const setLastRestaurant = () => {
    localStorage.setItem(
      LAST_RESTAURANT_KEY,
      JSON.stringify({
        id,
        name,
        ts: Date.now(),
      })
    )
  }

  const goToCustomerMenu = () => {
    goTo(`/customer/restaurants/${id}/menu`)
  }

  const goToCustomerOrders = () => {
    setLastRestaurant()
    goTo(`/customer/restaurants/${id}/orders/new`)
  }

  const goToReservationFlow = () => {
    setLastRestaurant()
    goTo('/customer/reservations/new')
  }

  const goToMapFlow = () => {
    setLastRestaurant()
    goTo(`/customer/restaurants/${id}/map`)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-[#0a0a0a] border border-zinc-800 text-white max-w-4xl w-full rounded-none p-8 md:p-12 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-8 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
        >
          Cerrar ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2 space-y-6">
            <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
              Vista de Restaurante
            </span>

            <h3 className="text-3xl md:text-4xl font-bold tracking-tight uppercase leading-none font-sans">
              {name}
            </h3>

            {address && (
              <p className="text-sm text-zinc-400 max-w-md font-light leading-relaxed">
                {address}
              </p>
            )}

            <div className="pt-6 grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
              <button
                onClick={goToCustomerMenu}
                className="text-left text-base md:text-lg font-bold tracking-wider uppercase underline underline-offset-4 decoration-1 hover:text-zinc-300 transition-colors"
              >
                Menú Restaurante
              </button>

              <button
                onClick={goToCustomerOrders}
                className="text-left text-base md:text-lg font-bold tracking-wider uppercase underline underline-offset-4 decoration-1 hover:text-zinc-300 transition-colors"
              >
                Orden
              </button>

              <button
                onClick={() => goTo(`/loby/restaurants/${id}/tables`)}
                className="text-left text-base md:text-lg font-bold tracking-wider uppercase underline underline-offset-4 decoration-1 hover:text-zinc-300 transition-colors"
              >
                Distribución Mesas
              </button>

              <button
                onClick={() => goTo(`/loby/restaurants/${id}/reviews`)}
                className="text-left text-base md:text-lg font-bold tracking-wider uppercase underline underline-offset-4 decoration-1 hover:text-zinc-300 transition-colors"
              >
                Reseñas
              </button>

              <button
                onClick={goToReservationFlow}
                className="text-left text-base md:text-lg font-bold tracking-wider uppercase underline underline-offset-4 decoration-1 hover:text-zinc-300 transition-colors"
              >
                Reservaciones
              </button>
              <button
                onClick={goToMapFlow}
                className="text-left text-base md:text-lg font-bold tracking-wider uppercase underline underline-offset-4 decoration-1 hover:text-zinc-300 transition-colors"
              >
                Ver en mapa
              </button>
            </div>
          </div>

          <div className="md:col-span-1 flex justify-center items-center h-full min-h-[150px]">
            {images[0] ? (
              <img
                src={images[0]}
                alt={name}
                className="w-full h-40 md:h-48 object-cover opacity-80 grayscale hover:grayscale-0 transition-all duration-500 rounded-none border border-zinc-800"
              />
            ) : (
              <div className="text-center p-4 border border-dashed border-zinc-800 w-full h-40 flex items-center justify-center">
                <span className="text-[10px] uppercase tracking-widest text-zinc-600">Alta Cocina</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

RestaurantViewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  restaurant: PropTypes.object,
}
