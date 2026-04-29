import useAuthStore from '../../shared/stores/useAuthStore'

/**
 * Componente Navbar - Barra superior
 */
const Navbar = () => {
  const { user } = useAuthStore()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Bienvenido, {user?.nombre || 'Usuario'}
        </h2>
        <p className="text-sm text-gray-500">
          Rol: <span className="font-semibold">{user?.rol || 'Usuario'}</span>
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
          {user?.nombre?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  )
}

export default Navbar
