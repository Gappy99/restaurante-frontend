import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

/**
 * Layout principal con Sidebar y Navbar
 * Usado en rutas protegidas
 */
const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  return (
    <div className="flex h-screen bg-[var(--bg)]">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar isSidebarOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar} />

        {/* Página */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
