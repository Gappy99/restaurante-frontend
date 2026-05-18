import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMenuStore } from '../../menus/store/useMenuStore'
import useRestaurantStore from '../../restaurant/store/useRestaurantStore'
import { MenuViewModal } from '../components/MenuViewModal'
import CustomerMenuList from '../components/CustomerMenuList'

export default function CustomerRestaurantMenuView() {
  const { restaurantId } = useParams()
  const { menus, fetchMenus, loading } = useMenuStore()
  const { restaurants, fetchRestaurants } = useRestaurantStore()
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [restaurantName, setRestaurantName] = useState('')

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  useEffect(() => {
    if (!Array.isArray(restaurants) || restaurants.length === 0) {
      fetchRestaurants()
    }
  }, [restaurants, fetchRestaurants])

  useEffect(() => {
    if (!restaurantId) {
      setRestaurantName('')
      return
    }

    const found = Array.isArray(restaurants)
      ? restaurants.find((r) => String(r._id || r.id) === String(restaurantId))
      : null

    setRestaurantName(found?.restaurant_name || found?.name || '')
  }, [restaurantId, restaurants])

  const availableMenus = useMemo(() => {
    if (!Array.isArray(menus)) return []

    return menus.filter((menu) => {
      const isAvailable = menu.available ?? menu.Menu_available ?? menu.Available ?? true
      return isAvailable === true
    })
  }, [menus])

  const filteredMenus = useMemo(() => {
    if (!restaurantId) return []

    return availableMenus.filter((menu) => {
      const menuRestaurantId =
        menu?.Restaurant_id ||
        menu?.restaurant_id ||
        menu?.restaurantId ||
        menu?.Restaurant?._id ||
        menu?.restaurant?._id ||
        null

      return String(menuRestaurantId) === String(restaurantId)
    })
  }, [availableMenus, restaurantId])

  const handleView = (menu) => {
    setSelectedMenu(menu)
    setIsViewModalOpen(true)
  }

  return (
    <div className="min-h-full bg-[#111111] text-[#f8fafc] px-4 py-8 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-7xl rounded-[2.5rem] border border-[#6b7280]/30 bg-[#1f2937]/20 px-6 py-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 border-b border-[#f8fafc]/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#9ca3af]">
              Menú del restaurante
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#f8fafc] sm:text-5xl">
              {restaurantName || 'Platillos y bebidas del restaurante'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[#d1d5db]/80">
              Esta vista solo muestra los menús asociados al restaurante seleccionado.
            </p>
          </div>

          <div className="rounded-2xl border border-[#f8fafc]/10 bg-black/20 px-4 py-3 text-right">
            <div className="text-2xl font-black text-[#f8fafc]">{filteredMenus.length}</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#9ca3af]">menús del restaurante</div>
          </div>
        </div>

        <div className="mt-8">
          <CustomerMenuList
            menus={filteredMenus}
            loading={loading}
            onView={handleView}
          />
        </div>
      </section>

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
