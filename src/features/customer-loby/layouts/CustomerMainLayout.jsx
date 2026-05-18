import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import CustomerSidebar from '../components/CustomerSidebar'
import CustomerNavbarBlack from '../components/CustomerNavbarBlack'

/**
 * Layout principal del Cliente - Réplica exacta de MainLayout de administración
 */
const CustomerMainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden w-full relative">
      {/* Sidebar del Cliente */}
      <CustomerSidebar isOpen={isSidebarOpen} />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        {/* NavbarBlack del Cliente */}
        <CustomerNavbarBlack isSidebarOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar} />

        {/* Área de renderizado de la página a pantalla completa */}
        <main className="flex-1 overflow-auto relative w-full h-full bg-black">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default CustomerMainLayout