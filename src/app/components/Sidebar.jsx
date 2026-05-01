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
    <aside className="w-72 bg-[var(--surface)] border-r border-[var(--accent-soft)] text-[var(--text)] flex flex-col">
      <div className="p-6">
        <div className="rounded-3xl overflow-hidden bg-[var(--accent-soft)] shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1541544180-2a4c2b2aec51?auto=format&fit=crop&w=600&q=80"
            alt="Restaurante"
            className="w-full h-48 object-cover"
          />
        </div>

        <div className="mt-5">
          <h1 className="text-2xl font-bold text-[var(--text)]">Restaurantes</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Gestión de restaurantes</p>
        </div>
      </div>

      <nav className="flex-1 px-6 pb-6 space-y-3">
        <Link
          to="/information"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--primary)] text-[var(--surface)] hover:bg-[#446b5b] transition"
        >
          <span className="text-xl">🍽️</span>
          <span className="font-medium">Restaurantes</span>
        </Link>

        <Link
          to="/tables"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <span>🪑</span>
          <span>Mesas</span>
        </Link>

        <Link
          to="/profile"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <span>🙍‍♂️</span>
          <span>Mi Perfil</span>
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
