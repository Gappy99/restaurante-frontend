import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
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

L.Marker.prototype.options.icon = DEFAULT_ICON

/* Centro por defecto: Guatemala City */
const DEFAULT_CENTER = [14.6349, -90.5069]
const DEFAULT_ZOOM = 12

/**
 * Mapa general de sedes.
 * Solo renderiza restaurantes donde hasLocation === true.
 */
const GeneralMap = ({ restaurants = [] }) => {
  const ubicados = restaurants.filter((r) => r.hasLocation && r.lat && r.lng)

  /* Si hay restaurantes con coordenadas, centrar en el primero */
  const center =
    ubicados.length > 0
      ? [ubicados[0].lat, ubicados[0].lng]
      : DEFAULT_CENTER

  return (
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

      {ubicados.map((restaurante) => (
        <Marker
          key={restaurante._id}
          position={[restaurante.lat, restaurante.lng]}
        >
          <Popup className="leaflet-popup-dark">
            <div className="min-w-[180px] space-y-1">
              <p className="font-bold text-sm text-gray-900 leading-tight">
                {restaurante.restaurant_name}
              </p>

              {restaurante.restaurant_direction && (
                <p className="text-xs text-gray-500 flex items-start gap-1">
                  <span>📍</span>
                  <span>{restaurante.restaurant_direction}</span>
                </p>
              )}

              {restaurante.restaurant_type && (
                <p className="text-xs text-gray-400">
                  {restaurante.restaurant_type}
                  {restaurante.restaurant_type_gastronomic
                    ? ` · ${restaurante.restaurant_type_gastronomic}`
                    : ''}
                </p>
              )}

              {restaurante.restaurant_time_start && restaurante.restaurant_time_close && (
                <p className="text-xs text-gray-400">
                  🕐 {restaurante.restaurant_time_start} – {restaurante.restaurant_time_close}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default GeneralMap
