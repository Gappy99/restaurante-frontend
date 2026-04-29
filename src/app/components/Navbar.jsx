import useAuthStore from '../../shared/stores/useAuthStore'

/**
 * Componente Navbar - Barra superior
 */
const Navbar = () => {
  const { user } = useAuthStore()

  return (
    <header className="bg-[var(--surface)] border-b border-[var(--accent-soft)] px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">
          Bienvenido, {user?.nombre || 'Usuario'}
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Rol: <span className="font-semibold text-[var(--text)]">{user?.rol || 'Usuario'}</span>
        </p>
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
