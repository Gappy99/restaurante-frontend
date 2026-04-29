import { useEffect, useState } from 'react'
import { useMenuStore } from '../store/useMenuStore'
import { MenuCard } from '../components/MenuCard'
import { MenuModal } from '../components/MenuModal'

export default function MenuPage() {
  const { menus, fetchMenus, loading, removeMenu } = useMenuStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
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
    setIsModalOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2F2F2F]">Gestión de Menús</h1>
          <p className="text-[#A66F5B]">Personaliza la oferta de hoy</p>
        </div>
        
        <button 
          onClick={() => { setSelectedMenu(null); setIsModalOpen(true); }}
          className="bg-[#517360] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#2F2F2F] transition-all"
        >
          + Nuevo Platillo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#517360]"></div>
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
        <div className="text-center py-20">
          <p className="text-[#A66F5B] text-lg">No hay menús disponibles</p>
        </div>
      )}

      {isModalOpen && (
        <MenuModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          menu={selectedMenu}
        />
      )}
    </div>
  )
}
