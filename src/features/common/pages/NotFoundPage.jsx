/**
 * Página 404 - No encontrada
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--text)]">404</h1>
        <p className="text-2xl text-[var(--muted)] mt-4">Página no encontrada</p>
        <a
          href="/"
          className="mt-6 inline-block px-6 py-2 bg-[var(--primary)] hover:bg-[#446b5b] text-[var(--surface)] rounded-lg font-semibold transition"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  )
}

export default NotFoundPage
