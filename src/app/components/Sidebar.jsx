import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../shared/stores/useAuthStore'
import logoRestaurant from '../../shared/assets/img/logo-restaurant.jpeg'

/**
 * Componente Sidebar - Navegación lateral
 */
const Sidebar = ({ isOpen = true }) => {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.rol === 'ADMIN'

  return (
    <aside
      className={`
        shrink-0 h-full overflow-hidden bg-black text-white flex flex-col
        transition-all duration-300
        ${isOpen ? 'w-72 border-r border-white/10 opacity-100' : 'w-0 border-r-0 opacity-0'}
      `}
    >
      <div className="p-6">
        <div className="rounded-3xl overflow-hidden bg-white/5 shadow-sm">
          <img
            src={logoRestaurant}
            alt="Restaurante"
            className="w-full h-48 object-cover"
          />
        </div>

        <div className="mt-5">
          <h1 className="text-2xl font-bold text-white">Restaurantes</h1>
          <p className="mt-2 text-sm text-white/65">Gestión de restaurantes</p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 space-y-3">
        <Link
          to="/loby"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white text-black hover:bg-white/90 transition"
        >
          <span className="text-xl">🏠</span>
          <span className="font-medium">Menú Principal</span>
        </Link>

        <Link
          to="/loby/restaurants"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition"
        >
          <span className="text-xl">🍽️</span>
          <span>Restaurantes</span>
        </Link>

        <Link
          to="/loby/tables"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition"
        >
          <span>🪑</span>
          <span>Mesas</span>
        </Link>

        <Link
          to="/loby/menu"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition"
        >
          <span>📋</span>
          <span>Menú</span>
        </Link>

        <Link
          to="/loby/information"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition"
        >
          <span>ℹ️</span>
          <span>Información</span>
        </Link>

        <Link
          to="/loby/profile"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition"
        >
          <span>🙍‍♂️</span>
          <span>Mi Perfil</span>
        </Link>

        <Link
          to="/loby/reservations"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <span>📅</span>
          <span>Reservaciones</span>
        </Link>

        <Link
          to="/loby/notifications"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <span>🔔</span>
          <span>Notificaciones</span>
        </Link>

        {isAdmin && (
          <>
            <Link
              to="/loby/users"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition"
            >
              <span>👥</span>
              <span>Contactos</span>
            </Link>
          </>
        )}
      </nav>

      <div className="px-6 pb-6">
        <div className="rounded-2xl bg-[var(--bg)] p-4 border border-[var(--accent-soft)]">
          <p className="text-xs text-[var(--muted)]">Usuario conectado</p>
          <p className="mt-2 font-semibold text-[var(--text)] truncate">{user?.nombre || user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 w-full px-4 py-2 bg-[var(--accent)] text-[var(--surface)] rounded-xl hover:bg-[#8a5c4f] transition"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
