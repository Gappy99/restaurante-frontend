/**
 * Página de no autorizado
 */
const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">403</h1>
        <p className="text-2xl text-gray-600 mt-4">No autorizado</p>
        <p className="text-gray-600 mt-2">No tienes permiso para acceder a esta página</p>
        <a
          href="/"
          className="mt-6 inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  )
}

export default UnauthorizedPage
