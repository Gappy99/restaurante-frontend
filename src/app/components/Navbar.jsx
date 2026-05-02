import useAuthStore from '../../shared/stores/useAuthStore'

/**
 * Componente Navbar - Barra superior
 */
const Navbar = ({ isSidebarOpen = true, onToggleSidebar }) => {
  const { user } = useAuthStore()

  return (
    <header className="bg-[#5B300E] border-b border-[#7F532C] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[var(--accent-soft)] bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--accent-soft)] transition"
          aria-label={isSidebarOpen ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
          title={isSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
        >
          {isSidebarOpen ? '⟨' : '⟩'}
        </button>

        <div>
        <h2 className="text-xl font-semibold text-white">
          Bienvenido, {user?.nombre || 'Usuario'}
        </h2>
        <p className="text-sm text-[#FCF0CA]">
          Rol: <span className="font-semibold text-white">{user?.rol || 'Usuario'}</span>
        </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center text-[var(--surface)] font-semibold">
          {user?.nombre?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  )
}

export default Navbar
