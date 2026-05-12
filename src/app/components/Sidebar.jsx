import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../shared/stores/useAuthStore'

/**
 * Componente Sidebar - Navegación lateral
 */
const Sidebar = () => {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.rol === 'ADMIN'

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">RestaurantGO</h1>
        <p className="text-sm text-gray-400 mt-1">Gestor de Restaurante</p>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 p-6 space-y-3">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <span>📊</span>
          <span>Dashboard</span>
        </Link>

        <Link
          to="/reviews"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <span>⭐</span>
          <span>Reseñas</span>
        </Link>

        {isAdmin && (
          <>
            <Link
              to="/users"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              <span>👥</span>
              <span>Usuarios</span>
            </Link>

            <Link
              to="/fields"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              <span>🏷️</span>
              <span>Campos</span>
            </Link>
          </>
        )}
      </nav>

      {/* Usuario y logout */}
      <div className="p-6 border-t border-gray-800 space-y-3">
        <div className="text-sm">
          <p className="text-gray-400">Usuario</p>
          <p className="font-semibold truncate">{user?.nombre || user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
