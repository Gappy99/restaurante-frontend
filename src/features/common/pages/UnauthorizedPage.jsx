/**
 * Página de no autorizado
 */
const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--text)]">403</h1>
        <p className="text-2xl text-[var(--muted)] mt-4">No autorizado</p>
        <p className="text-[var(--muted)] mt-2">No tienes permiso para acceder a esta página</p>
        <a
          href="/"
          className="mt-6 inline-block px-6 py-2 bg-[var(--primary)] hover:bg-[#000000] text-[var(--surface)] rounded-lg font-semibold transition"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  )
}

export default UnauthorizedPage
