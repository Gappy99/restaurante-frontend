import { lazy, Suspense, useEffect, useState } from 'react'
import { restaurantService } from '../../restaurant/services/restaurantService'

/**
 * GeneralMap se carga de forma diferida para evitar errores de SSR/window
 * con Leaflet y mantener el bundle principal liviano.
 */
const GeneralMap = lazy(() => import('../components/GeneralMap'))

/* ──────────────────────────────────────────────────────────
   Componente de carga mientras el mapa inicializa
────────────────────────────────────────────────────────── */
const MapLoader = () => (
  <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40">
    <div className="w-10 h-10 border-4 border-white/20 border-t-white/70 rounded-full animate-spin" />
    <span className="text-sm">Cargando mapa…</span>
  </div>
)

/* ──────────────────────────────────────────────────────────
   Tarjeta de estadística rápida
────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4">
    <span className="text-2xl">{icon}</span>
    <div>
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
      <p className="text-xs text-white/50 mt-0.5">{label}</p>
    </div>
  </div>
)

/* ──────────────────────────────────────────────────────────
   Página principal
────────────────────────────────────────────────────────── */
const MapaDeSedePage = () => {
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

  /* Restaurantes que tienen coordenadas registradas */
  const ubicados = restaurants.filter((r) => r.hasLocation)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* ── Encabezado ── */}
      <header className="px-8 pt-8 pb-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🗺️</span>
          <h1 className="text-2xl font-bold tracking-tight">Mapa de Sedes</h1>
        </div>
        <p className="text-sm text-white/50">
          Visualiza la ubicación geográfica de los restaurantes registrados.
        </p>
      </header>

      {/* ── Estadísticas rápidas ── */}
      <section className="px-8 py-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon="🏢" label="Total registrados" value={restaurants.length} />
        <StatCard icon="📍" label="Con ubicación" value={ubicados.length} />
        <StatCard
          icon="🔍"
          label="Sin ubicación"
          value={restaurants.length - ubicados.length}
        />
      </section>

      {/* ── Contenedor del mapa ── */}
      <section className="flex-1 px-8 pb-8 pt-2">
        <div
          className="relative w-full rounded-2xl overflow-hidden border border-white/10"
          style={{ height: 'calc(100vh - 260px)', minHeight: '400px' }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10 rounded-2xl">
              <MapLoader />
            </div>
          )}

          {error && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 rounded-2xl gap-3">
              <span className="text-4xl">⚠️</span>
              <p className="text-white/70 text-sm text-center max-w-xs">{error}</p>
            </div>
          )}

          {!error && (
            <Suspense fallback={<MapLoader />}>
              <GeneralMap restaurants={restaurants} />
            </Suspense>
          )}

          {/* Aviso cuando ningún restaurante tiene coordenadas aún */}
          {!loading && !error && ubicados.length === 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3 text-sm text-white/60 text-center">
              Ningún restaurante tiene ubicación registrada aún.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default MapaDeSedePage
