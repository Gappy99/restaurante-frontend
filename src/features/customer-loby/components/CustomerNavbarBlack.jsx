import { Link } from 'react-router-dom'

// Datos del Menú Principal del Cliente
const menuItems = [
  { id: 1, label: 'Restaurantes', path: '/customer/restaurants', specialClass: 'font-bold text-lg' },
  { id: 2, label: 'Mesas', path: '/customer/tables' },
  { id: 3, label: 'Mis Reservaciones', path: '/customer/reservations' },
  { id: 4, label: 'Menú', path: '/customer/menu', specialClass: 'italic' },
  { id: 5, label: 'Mi Perfil', path: '/customer/profile' },
  { id: 6, label: 'Cupones', path: '/customer/coupons', specialClass: 'italic' },
]

const NAVBAR_TITLE = 'Conozca nuestras ramas'

/**
 * CustomerNavbarBlack - Barra superior idéntica a NavbarBlack con rutas de cliente
 */
const CustomerNavbarBlack = ({ isSidebarOpen = true, onToggleSidebar }) => {
  return (
    <header className="border-b border-gray-800 py-6 px-6 bg-black z-30">
      <nav className="flex flex-col gap-6">
        {/* Botón toggle y título superior */}
        <div className="flex items-center justify-center px-0 relative">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="absolute left-0 z-50 inline-flex items-center justify-center w-12 h-12 rounded-lg border-2 border-gray-400 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white transition-all duration-300 font-bold text-lg"
            style={{
              marginLeft: isSidebarOpen ? '288px' : '0px'
            }}
            aria-label={isSidebarOpen ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
            title={isSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
          >
            {isSidebarOpen ? '⟨' : '⟩'}
          </button>

          <span className="text-gray-400 text-xs uppercase tracking-wider">
            {NAVBAR_TITLE}
          </span>
        </div>

        {/* Fila de Menús Horizontales */}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`text-gray-200 hover:text-white transition-colors duration-200 ${item.specialClass || 'text-sm'}`}
            >
              <span className="tracking-wider uppercase">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default CustomerNavbarBlack