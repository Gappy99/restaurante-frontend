import { Link } from 'react-router-dom'

// Datos del Menú Principal
const menuItems = [
    { id: 1, label: 'Restaurantes', path: '/loby/restaurants', specialClass: 'font-bold text-lg' },
    { id: 2, label: 'Mesas', path: '/loby/tables' },
    { id: 3, label: 'Todas las Mesas', path: '/loby/tables/all' },
    { id: 4, label: 'Información', path: '/loby/information', specialClass: 'italic' },
    { id: 5, label: 'Menú', path: '/loby/menu', specialClass: 'italic' },
    { id: 6, label: 'Mi Perfil', path: '/loby/profile' },
    { id: 7, label: 'Contactos', path: '/loby/users', specialClass: 'italic' },
]

// Texto fijo del navbar
const NAVBAR_TITLE = 'Conozca nuestras ramas'

/**
 * Componente NavbarBlack - Barra de navegación negra
 */
const NavbarBlack = ({ isSidebarOpen = true, onToggleSidebar }) => {
    return (
        <header className="border-b border-gray-800 py-6 px-6 bg-black">
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

                    <span className="text-gray-400 text-xs uppercase ">
                        {NAVBAR_TITLE}
                    </span>
                </div>

                {/* Fila de Menús */}
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

export default NavbarBlack
