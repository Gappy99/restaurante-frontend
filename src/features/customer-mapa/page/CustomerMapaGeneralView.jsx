import { lazy, Suspense, useEffect, useState } from 'react'
import { restaurantService } from '../../restaurant/services/restaurantService'
import { FiAlertTriangle, FiMap, FiMapPin, FiSearch } from 'react-icons/fi'
import { RiStore2Line } from 'react-icons/ri'
import PropTypes from 'prop-types'

const GeneralMap = lazy(() => import('../../mapa/components/GeneralMap'))

const MapLoader = () => (
  <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40">
    <div className="w-10 h-10 border-4 border-white/20 border-t-white/70 rounded-full animate-spin" />
    <span className="text-sm">Cargando mapa…</span>
  </div>
)

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4">
    <Icon className="text-2xl" aria-hidden="true" />
    <div>
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
      <p className="text-xs text-white/50 mt-0.5">{label}</p>
    </div>
  </div>
)

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.elementType.isRequired,
}

const CustomerMapaGeneralView = () => {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true)
      setError(null)

      const result = await restaurantService.getRestaurants()

      if (result.success) {
        setRestaurants(result.data)
      } else {
        setError(result.error || 'No se pudieron cargar los restaurantes.')
      }

      setLoading(false)
    }

    fetchRestaurants()
  }, [])

  const ubicados = restaurants.filter((r) => r.hasLocation)

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <header className="px-6 pt-6 pb-3 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <FiMap className="text-2xl" aria-hidden="true" />
          <h1 className="text-2xl font-bold tracking-tight">Mapa General</h1>
        </div>
        <p className="text-sm text-white/50">
          Visualiza la ubicación de todos los restaurantes disponibles para el cliente.
        </p>
      </header>

      <section className="px-6 py-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={RiStore2Line} label="Total registrados" value={restaurants.length} />
        <StatCard icon={FiMapPin} label="Con ubicación" value={ubicados.length} />
        <StatCard icon={FiSearch} label="Sin ubicación" value={restaurants.length - ubicados.length} />
      </section>

      <section className="flex-1 px-6 pb-6 pt-2 h-full min-h-0">
        <div
          className="relative w-full h-full rounded-xl overflow-hidden border border-white/10 z-0"
          style={{ zIndex: 0 }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10 rounded-xl">
              <MapLoader />
            </div>
          )}

          {error && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 rounded-xl gap-3">
              <FiAlertTriangle className="text-4xl" aria-hidden="true" />
              <p className="text-white/70 text-sm text-center max-w-xs">{error}</p>
            </div>
          )}

          {!error && (
            <Suspense fallback={<MapLoader />}>
              <GeneralMap restaurants={restaurants} />
            </Suspense>
          )}

          {!loading && !error && ubicados.length === 0 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[500] bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 text-center">
              Ningún restaurante tiene ubicación registrada aún.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default CustomerMapaGeneralView
