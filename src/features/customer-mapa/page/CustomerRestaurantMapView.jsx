import { useEffect, useState, Suspense, lazy } from 'react'
import { useParams } from 'react-router-dom'
import { restaurantService } from '../../restaurant/services/restaurantService'

const GeneralMap = lazy(() => import('../../mapa/components/GeneralMap'))

const MapLoader = () => (
  <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40">
    <div className="w-10 h-10 border-4 border-white/20 border-t-white/70 rounded-full animate-spin" />
    <span className="text-sm">Cargando mapa…</span>
  </div>
)

export default function CustomerRestaurantMapView() {
  const { restaurantId } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      const res = await restaurantService.getRestaurantById(restaurantId)
      if (res.success) setRestaurant(res.data)
      else setError(res.error || 'No se encontró el restaurante')
      setLoading(false)
    }

    if (restaurantId) load()
  }, [restaurantId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2E160C] text-[#FCF0CA] flex items-center justify-center p-4">
        <MapLoader />
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-[#2E160C] text-[#FCF0CA] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg">{error || 'Restaurante no encontrado'}</p>
        </div>
      </div>
    )
  }

  // Pasar un array con el restaurante para que GeneralMap lo centre
  const restaurants = [
    {
      ...restaurant,
      lat: Number(restaurant?.lat),
      lng: Number(restaurant?.lng),
      hasLocation: Boolean(restaurant?.hasLocation && restaurant?.lat && restaurant?.lng),
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto rounded-2xl overflow-hidden border border-white/10 bg-black p-4" style={{height: 'calc(100vh - 120px)'}}>
        <Suspense fallback={<MapLoader />}>
          <GeneralMap restaurants={restaurants} />
        </Suspense>
      </div>
    </div>
  )
}
