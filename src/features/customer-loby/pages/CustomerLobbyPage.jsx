import { useNavigate } from 'react-router-dom'

/**
 * CustomerLobbyPage - Contenedor Hero con URL externa para la imagen de fondo
 */
const CustomerLobbyPage = () => {
  const navigate = useNavigate()

  // URL externa de la imagen del restaurante proporcionada
  const externalBackgroundImage = 'https://static.wixstatic.com/media/00fb00_858f44146f614385a542ac5de52678a4~mv2.jpg'

  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${externalBackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Filtro sutil oscuro sobre la imagen para resaltar las tipografías */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* Bloque Central de Título y Llamada a la acción */}
      <div className="relative z-10 space-y-6">
        <h1 className="text-white text-6xl md:text-8xl font-extrabold tracking-tight drop-shadow-lg select-none">
          Omakase
        </h1>
        
        <div>
          <button
            type="button"
            onClick={() => navigate('/customer/menu')}
            className="bg-white text-black text-xs md:text-sm font-bold tracking-widest uppercase px-8 py-4 shadow-2xl hover:bg-gray-200 active:scale-95 transition-all duration-200"
          >
            Ver Menú
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerLobbyPage