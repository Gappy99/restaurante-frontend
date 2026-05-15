import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

/**
 * Layout de pantalla completa con sidebar y botón flotante
 * Usado para la página de Restaurantes y otras vistas de pantalla completa
 */
const FullLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  return (
    <div className="w-full h-screen bg-[var(--bg)] overflow-hidden relative">
      {/* Sidebar — se superpone sobre el contenido (z-[2000]) */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Backdrop semitransparente al abrir el sidebar — cierra al hacer clic */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[1999]"
          onClick={handleToggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Botón flotante fijo — no se mueve cuando abre el sidebar */}
      <button
        type="button"
        onClick={handleToggleSidebar}
        className="fixed top-6 left-6 z-[2001] inline-flex items-center justify-center w-12 h-12 rounded-lg border-2 border-gray-400 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white transition-all duration-300 font-bold text-lg"
        aria-label={isSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
        title={isSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
      >
        {isSidebarOpen ? '⟩' : '⟨'}
      </button>

      {/* Página a pantalla completa — nunca se desplaza con el sidebar */}
      <main className="w-full h-full overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default FullLayout
