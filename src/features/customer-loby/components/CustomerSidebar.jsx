import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../../shared/stores/useAuthStore'
import logoRestaurant from '../../../shared/assets/img/logo.png'

/**
 * CustomerSidebar - Menú lateral adaptado para Cliente con la UI exacta de administración
 */
const CustomerSidebar = ({ isOpen = true }) => {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()
 
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
 
  return (
    <aside
      className={`
        fixed left-0 top-0 h-full overflow-hidden bg-black text-white flex flex-col z-40
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-72 border-r border-white/10 opacity-100 translate-x-0' : 'w-72 opacity-0 -translate-x-full'}
      `}
    >
      {/* Contenedor del Logo de Omakase */}
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
          <p className="mt-2 text-sm text-white/65">Panel de Cliente</p>
        </div>
      </div>
 
      {/* Listado de Enlaces de Navegación del Cliente */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 space-y-3">
        <Link
          to="/customer"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          <span className="font-medium">Menú Principal</span>
        </Link>
 
        <Link
          to="/customer/restaurants"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          <span>Restaurantes</span>
        </Link>

        <Link
          to="/customer/mapa-general"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          <span>Mapa General</span>
        </Link>
 
        <Link
          to="/customer/tables"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          <span>Mesas</span>
        </Link>
 
        <Link
          to="/customer/menu"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          <span>Menú</span>
        </Link>

        <Link
          to="/customer/coupons"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          <span>Cupones</span>
        </Link>

        <Link
          to="/customer/orders"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          <span>Órdenes</span>
        </Link>

        <Link
          to="/customer/factura"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          <span>Factura</span>
        </Link>
 
        <Link
          to="/customer/profile"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          <span>Mi Perfil</span>
        </Link>
      </nav>
 
      {/* Bloque de Información del Usuario Conectado */}
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
 
export default CustomerSidebar