import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../shared/stores/useAuthStore'
import logoRestaurant from '../../shared/assets/img/logo.png'
import {
  FiArchive,
  FiBarChart2,
  FiBell,
  FiBook,
  FiCalendar,
  FiClipboard,
  FiFileText,
  FiGrid,
  FiHome,
  FiInfo,
  FiMapPin,
  FiMenu,
  FiMessageSquare,
  FiPieChart,
  FiShoppingCart,
  FiTag,
  FiUser,
} from 'react-icons/fi'
import { isPrivilegedRole } from '../../shared/utils/roles'
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
 
  const isAdmin = isPrivilegedRole(user?.rol)
 
  return (
    <aside
      className={`

        fixed left-0 top-0 h-full overflow-hidden bg-black text-white flex flex-col z-40
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-72 border-r border-white/10 opacity-100 translate-x-0' : 'w-72 opacity-0 -translate-x-full'}
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
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          <FiHome size={17} aria-hidden="true" />
          <span className="font-medium">Menú Principal</span>
        </Link>
 
        <Link
          to="/loby/restaurants"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          <FiGrid size={17} aria-hidden="true" />
          <span>Restaurantes</span>
        </Link>
 
        <Link
          to="/loby/tables"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          <FiPieChart size={17} aria-hidden="true" />
          <span>Mesas</span>
        </Link>
 
        <Link
          to="/loby/menu"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          <FiMenu size={17} aria-hidden="true" />
          <span>Menú</span>
        </Link>
 
        <Link
          to="/loby/recipes"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition"
        >
          <FiFileText size={17} aria-hidden="true" />
          <span>Recetas</span>
        </Link>

        <Link
          to="/loby/orders"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition"
        >
          <FiShoppingCart size={17} aria-hidden="true" />
          <span>Órdenes</span>
        </Link>

        <Link
          to="/loby/inventory"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition"
        >
          <FiArchive size={17} aria-hidden="true" />
          <span>Inventario</span>
        </Link>

        <Link
          to="/loby/detallePedidos"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition"
        >
          <FiClipboard size={17} aria-hidden="true" />
          <span>Detalles Pedidos</span>
        </Link>

        <Link
          to="/loby/events"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition"
        >
          <FiCalendar size={17} aria-hidden="true" />
          <span>Eventos</span>
        </Link>

        <Link
          to="/loby/information"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          <FiInfo size={17} aria-hidden="true" />
          <span>Información</span>
        </Link>

        <Link
          to="/loby/reviews"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition"
        >
          <FiMessageSquare size={17} aria-hidden="true" />
          <span>Reseñas</span>
        </Link>

        <Link
          to="/loby/coupons"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition"
        >
          <FiTag size={17} aria-hidden="true" />
          <span>Cupones</span>
        </Link>
 
        <Link
          to="/loby/mapa-de-sedes"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition"
        >
          <FiMapPin size={17} aria-hidden="true" />
          <span>Mapa de Sedes</span>
        </Link>

        <Link
          to="/loby/profile"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          <FiUser size={17} aria-hidden="true" />
          <span>Mi Perfil</span>
        </Link>
        <Link
          to="/loby/reservations"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <FiCalendar size={17} aria-hidden="true" />
          <span>Reservaciones</span>
        </Link>
        <Link
          to="/loby/notifications"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <FiBell size={17} aria-hidden="true" />
          <span>Notificaciones</span>
        </Link>
        {isAdmin && (
          <>
            <Link
              to="/loby/users"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
            >
              <FiBook size={17} aria-hidden="true" />
              <span>Contactos</span>
            </Link>
            <Link
              to="/loby/reports"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
            >
              <FiBarChart2 size={17} aria-hidden="true" />
              <span>Reportes</span>
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
          className="mt-4 w-full px-4 py-2 bg-[var(--accent)] text-[var(--surface)] rounded-xl hover:bg-[#4b5563] transition"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}
 
export default Sidebar
 
 