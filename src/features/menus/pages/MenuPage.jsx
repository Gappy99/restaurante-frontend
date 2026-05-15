import { useEffect, useState } from 'react'
import { useMenuStore } from '../store/useMenuStore'
import { MenuCard } from '../components/MenuCard'
import { MenuModal } from '../components/MenuModal'
import { MenuViewModal } from '../components/MenuViewModal'

export default function MenuPage() {
  const { menus, fetchMenus, loading, removeMenu } = useMenuStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState(null)

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  const handleEditClick = (menu) => {
    setSelectedMenu(menu)
    setIsModalOpen(true)
  }

  const handleViewClick = (menu) => {
    setSelectedMenu(menu)
    setIsViewModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#2E160C] text-[#FCF0CA] p-4 md:p-8 font-sans">
      
      {/* Header con estilo sofisticado y bordes bronce */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-16 p-8 rounded-[2.5rem] bg-[#5B300E]/20 border border-[#7F532C]/30 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-[#FCF0CA] via-[#946841] to-[#7F532C] bg-clip-text text-transparent">
            Gestión de Menús
          </h1>
          <p className="text-[#946841] mt-2 font-medium tracking-widest text-xs uppercase">
            Personaliza la oferta de hoy
          </p>
        </div>

        <button 
          onClick={() => { setSelectedMenu(null); setIsModalOpen(true); }}
          className="mt-8 md:mt-0 px-10 py-4 bg-[#7F532C] hover:bg-[#946841] text-[#FCF0CA] hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl font-bold shadow-lg shadow-black/20 flex items-center gap-3 border border-[#FCF0CA]/10"
          disabled={loading}
        >
          <span className="text-xl">+</span> Nuevo Platillo
        </button>
      </header>

      <main className="max-w-7xl mx-auto relative">

        {/* Sección de visualización */}
        <section className="relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 border-4 border-[#7F532C] border-t-[#FCF0CA] rounded-full animate-spin"></div>
              <p className="text-[#946841] font-mono text-sm animate-pulse">CARGANDO BASE DE DATOS...</p>
            </div>
          ) : menus && menus.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menus.map((menu) => (
                <MenuCard 
                  key={menu._id || menu.id} 
                  menu={menu} 
                  onEdit={() => handleEditClick(menu)}
                  onDelete={() => removeMenu(menu._id || menu.id)}
                  onView={() => handleViewClick(menu)}
                  isAdmin={true}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-[#5B300E]/10 rounded-[3rem] border-2 border-dashed border-[#7F532C]/30 text-center">
              <div className="text-5xl mb-6 grayscale opacity-50">🍽️</div>
              <h3 className="text-[#FCF0CA] text-lg font-bold mb-2">No hay menús registrados</h3>
              <p className="text-[#946841] text-sm">Crea el primer menú haciendo clic en el botón "Nuevo Platillo"</p>
            </div>
          )}
        </section>

        {/* Decoración de fondo sutil para dar profundidad */}
        <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#5B300E]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#7F532C]/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      </main>

      {isModalOpen && (
        <MenuModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          menu={selectedMenu}
        />
      )}

      {isViewModalOpen && (
        <MenuViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          menu={selectedMenu}
        />
      )}
    </div>
  )
}
