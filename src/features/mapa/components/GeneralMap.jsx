import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Corrección del ícono de marcador por defecto de Leaflet con Vite.
 * Vite no resuelve las URLs de imágenes de Leaflet automáticamente,
 * por eso se redefine manualmente el ícono.
 */
const DEFAULT_ICON = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const PIN_STYLE_ID = 'restaurant-map-pin-animation'

const RESTAURANT_ICON = L.divIcon({
  className: 'restaurant-pin-wrapper',
  html: `
    <div class="restaurant-pin">
      <span class="restaurant-pin__pulse"></span>
      <span class="restaurant-pin__core">🍽️</span>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -36],
})

L.Marker.prototype.options.icon = DEFAULT_ICON

/* Centro por defecto: Guatemala City */
const DEFAULT_CENTER = [14.6349, -90.5069]
const DEFAULT_ZOOM = 12

const USER_ICON = L.divIcon({
  className: 'user-map-pin-wrapper',
  html: `
    <div class="user-map-pin">
      <span class="user-map-pin__dot"></span>
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -10],
})

const RouteViewportController = ({ routeCoords }) => {
  const map = useMap()

  useEffect(() => {
    if (!Array.isArray(routeCoords) || routeCoords.length < 2) return

    const latlngs = routeCoords
      .filter((coord) => Array.isArray(coord) && coord.length === 2)
      .map((coord) => [Number(coord[0]), Number(coord[1])])
      .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng))

    if (latlngs.length < 2) return

    const bounds = L.latLngBounds(latlngs)
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [map, routeCoords])

  return null
}

/**
 * Mapa general de sedes.
 * Solo renderiza restaurantes donde hasLocation === true.
 */
const GeneralMap = ({ restaurants = [] }) => {
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null)
  const [rutaCoords, setRutaCoords] = useState([])
  const [infoRuta, setInfoRuta] = useState(null)
  const [cargandoRuta, setCargandoRuta] = useState(false)
  const [restauranteRutaId, setRestauranteRutaId] = useState(null)

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (document.getElementById(PIN_STYLE_ID)) return

    const style = document.createElement('style')
    style.id = PIN_STYLE_ID
    style.textContent = `
      .restaurant-pin {
        position: relative;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .restaurant-pin__pulse {
        position: absolute;
        width: 42px;
        height: 42px;
        border-radius: 9999px;
        background: rgba(127, 83, 44, 0.35);
        box-shadow: 0 0 0 0 rgba(127, 83, 44, 0.5);
        animation: restaurantPinPulse 2s ease-out infinite;
      }

      .restaurant-pin__core {
        position: relative;
        z-index: 2;
        width: 34px;
        height: 34px;
        border-radius: 9999px;
        background: linear-gradient(135deg, #7F532C 0%, #5B300E 100%);
        border: 2px solid #FCF0CA;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transform: translateY(-2px);
        animation: restaurantPinFloat 2.2s ease-in-out infinite;
      }

      @keyframes restaurantPinPulse {
        0% {
          transform: scale(0.78);
          opacity: 0.85;
          box-shadow: 0 0 0 0 rgba(127, 83, 44, 0.45);
        }
        70% {
          transform: scale(1.15);
          opacity: 0.12;
          box-shadow: 0 0 0 14px rgba(127, 83, 44, 0);
        }
        100% {
          transform: scale(1.22);
          opacity: 0;
          box-shadow: 0 0 0 0 rgba(127, 83, 44, 0);
        }
      }

      @keyframes restaurantPinFloat {
        0%, 100% {
          transform: translateY(-2px);
        }
        50% {
          transform: translateY(-5px);
        }
      }

      .user-map-pin {
        position: relative;
        width: 26px;
        height: 26px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(37, 99, 235, 0.18);
        border: 1px solid rgba(147, 197, 253, 0.6);
      }

      .user-map-pin__dot {
        width: 14px;
        height: 14px;
        border-radius: 9999px;
        background: #2563eb;
        border: 2px solid #dbeafe;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.3);
      }
    `

    document.head.appendChild(style)
  }, [])

  const limpiarRuta = () => {
    setRutaCoords([])
    setInfoRuta(null)
    setRestauranteRutaId(null)
  }

  const trazarRuta = (restaurante) => {
    setCargandoRuta(true)
    setRestauranteRutaId(restaurante?._id || restaurante?.id || null)

    if (!navigator.geolocation) {
      window.alert('Tu navegador no soporta geolocalización.')
      setCargandoRuta(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = Number(position?.coords?.latitude)
        const userLng = Number(position?.coords?.longitude)

        if (!Number.isFinite(userLat) || !Number.isFinite(userLng)) {
          window.alert('No fue posible obtener una ubicación válida.')
          setCargandoRuta(false)
          return
        }

        setUbicacionUsuario([userLat, userLng])

        try {
          // OSRM usa longitud,latitud
          const url = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${restaurante.lng},${restaurante.lat}?overview=full&geometries=geojson`
          const respuesta = await fetch(url)

          if (!respuesta.ok) {
            throw new Error('La API de rutas no respondió correctamente.')
          }

          const data = await respuesta.json()
          const ruta = data?.routes?.[0]

          if (!ruta?.geometry?.coordinates?.length) {
            throw new Error('No se encontró una ruta para este destino.')
          }

          // OSRM -> [lng, lat] ; Leaflet -> [lat, lng]
          const coordenadasLeaflet = ruta.geometry.coordinates
            .map((coord) => [Number(coord?.[1]), Number(coord?.[0])])
            .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng))

          if (coordenadasLeaflet.length < 2) {
            throw new Error('La ruta recibida no es válida.')
          }

          setRutaCoords(coordenadasLeaflet)
          setInfoRuta({
            distancia: (Number(ruta.distance) / 1000).toFixed(1),
            tiempo: Math.max(1, Math.round(Number(ruta.duration) / 60)),
          })
        } catch (routeError) {
          console.error('Error al obtener la ruta:', routeError)
          window.alert('No se pudo calcular la ruta en este momento.')
          limpiarRuta()
        } finally {
          setCargandoRuta(false)
        }
      },
      () => {
        window.alert('Debes dar permiso de ubicación para trazar la ruta.')
        setCargandoRuta(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  }

  const ubicados = restaurants
    .map((r) => {
      const lat = Number(r?.lat)
      const lng = Number(r?.lng)
      const hasLocation = Boolean(r?.hasLocation) && Number.isFinite(lat) && Number.isFinite(lng)
      return hasLocation ? { ...r, lat, lng } : null
    })
    .filter(Boolean)

  /* Si hay restaurantes con coordenadas, centrar en el primero */
  const center =
    ubicados.length > 0
      ? [ubicados[0].lat, ubicados[0].lng]
      : DEFAULT_CENTER

  return (
    <div className="relative w-full h-full">
      {infoRuta && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] rounded-xl border border-[#7F532C]/70 bg-[#2E160C]/95 px-4 py-3 text-[#FCF0CA] shadow-2xl shadow-black/40 backdrop-blur-md">
          <div className="flex items-center gap-4 text-sm">
            <p>🚗 <b>{infoRuta.tiempo} min</b> de viaje</p>
            <p>📏 <b>{infoRuta.distancia} km</b> de distancia</p>
            <button
              type="button"
              onClick={limpiarRuta}
              className="rounded-md border border-red-400/60 px-2 py-1 text-red-300 hover:bg-red-400/20"
            >
              ✕ Cerrar ruta
            </button>
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full rounded-2xl"
        style={{ minHeight: '100%' }}
      >
        {/* Tema oscuro CartoDB Dark Matter */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        <RouteViewportController routeCoords={rutaCoords} />

        {ubicacionUsuario && (
          <Marker position={ubicacionUsuario} icon={USER_ICON}>
            <Popup>Tu ubicación actual</Popup>
          </Marker>
        )}

        {rutaCoords.length > 0 && (
          <Polyline positions={rutaCoords} color="#3b82f6" weight={5} opacity={0.85} />
        )}

        {ubicados.map((restaurante) => (
          <Marker
            key={restaurante._id}
            position={[restaurante.lat, restaurante.lng]}
            icon={RESTAURANT_ICON}
          >
            <Popup className="leaflet-popup-dark">
              <div className="min-w-[255px] max-w-[290px] rounded-2xl bg-[#FCF0CA] p-4 border-2 border-[#7F532C]/25 shadow-[0_14px_30px_rgba(46,22,12,0.22)]">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-black text-sm text-[#2E160C] leading-tight tracking-wide uppercase">
                    {restaurante.restaurant_name}
                  </p>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-gradient-to-r from-[#7F532C] to-[#5B300E] text-[#FCF0CA] font-semibold shadow-sm">
                    Sede
                  </span>
                </div>

                <div className="mt-3 h-px bg-[#7F532C]/20" />

                {restaurante.restaurant_direction && (
                  <div className="mt-3 flex items-start gap-2">
                    <span className="text-[#7F532C]">📍</span>
                    <p className="text-xs text-[#5B300E] leading-snug">
                      {restaurante.restaurant_direction}
                    </p>
                  </div>
                )}

                {(restaurante.restaurant_type || restaurante.restaurant_type_gastronomic) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {restaurante.restaurant_type && (
                      <span className="text-[10px] px-2.5 py-1 rounded-full border border-[#7F532C]/40 text-[#5B300E] font-semibold bg-white/70">
                        {restaurante.restaurant_type}
                      </span>
                    )}
                    {restaurante.restaurant_type_gastronomic && (
                      <span className="text-[10px] px-2.5 py-1 rounded-full border border-[#7F532C]/40 text-[#5B300E] font-semibold bg-white/70">
                        {restaurante.restaurant_type_gastronomic}
                      </span>
                    )}
                  </div>
                )}

                {restaurante.restaurant_time_start && restaurante.restaurant_time_close && (
                  <p className="mt-2 text-xs text-[#5B300E] font-medium">
                    🕐 {restaurante.restaurant_time_start} – {restaurante.restaurant_time_close}
                  </p>
                )}

                {restaurante.restaurant_mean_price !== undefined && restaurante.restaurant_mean_price !== null && (
                  <p className="mt-1 text-xs text-[#2E160C] font-bold">
                    💵 Precio promedio: Q{restaurante.restaurant_mean_price}
                  </p>
                )}

                <div className="mt-2 text-[10px] text-[#7F532C]/80 font-medium">
                  Coordenadas: {restaurante.lat.toFixed(5)}, {restaurante.lng.toFixed(5)}
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href={`https://waze.com/ul?ll=${restaurante.lat},${restaurante.lng}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-[#7F532C]/50 bg-[#FCF0CA] px-3 py-2 text-center text-xs font-bold text-[#5B300E] no-underline hover:bg-[#f5e6bf]"
                  >
                    🧭 Abrir en Waze
                  </a>
                  <button
                    type="button"
                    onClick={() => trazarRuta(restaurante)}
                    disabled={cargandoRuta}
                    className="rounded-xl bg-gradient-to-r from-[#7F532C] to-[#5B300E] px-3 py-2 text-xs font-bold text-[#FCF0CA] shadow-[0_8px_18px_rgba(46,22,12,0.28)] hover:brightness-110 disabled:opacity-60"
                  >
                    {cargandoRuta && restauranteRutaId === (restaurante._id || restaurante.id)
                      ? 'Calculando...'
                      : 'Ver ruta en mapa'}
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default GeneralMap
