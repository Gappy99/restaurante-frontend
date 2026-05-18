import { useEffect, useMemo, useState } from 'react'
import { useMenuStore } from '../../menus/store/useMenuStore'
import useRestaurantStore from '../../restaurant/store/useRestaurantStore'
import { MenuViewModal } from '../components/MenuViewModal'
import CustomerMenuList from '../components/CustomerMenuList'

export default function CustomerMenuView() {
  const { menus, fetchMenus, loading } = useMenuStore()
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [searchRestaurant, setSearchRestaurant] = useState('')

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  const { restaurants, fetchRestaurants } = useRestaurantStore()

  useEffect(() => {
    if (!Array.isArray(restaurants) || restaurants.length === 0) {
      fetchRestaurants()
    }
  }, [restaurants, fetchRestaurants])

  const availableMenus = useMemo(() => {
    if (!Array.isArray(menus)) return []

    return menus.filter((menu) => {
      const isAvailable = menu.available ?? menu.Menu_available ?? menu.Available ?? true
      return isAvailable === true
    })
  }, [menus])

  const filteredMenus = useMemo(() => {
    const q = (searchRestaurant || '').toString().trim().toLowerCase()

    if (!q) return availableMenus

    return availableMenus.filter((menu) => {
      // Resolver nombre del restaurante preferentemente desde la referencia al restaurante
      const restaurantId = menu?.Restaurant_id || menu?.restaurant_id || menu?.restaurantId || menu?.Restaurant?._id || menu?.restaurant?._id || null

      let restaurantNameCandidate = ''
      if (menu?.Restaurant?.restaurant_name) restaurantNameCandidate = menu.Restaurant.restaurant_name
      else if (menu?.restaurant?.restaurant_name) restaurantNameCandidate = menu.restaurant.restaurant_name
      else if (menu?.Restaurant_name) restaurantNameCandidate = menu.Restaurant_name
      else if (menu?.restaurant_name) restaurantNameCandidate = menu.restaurant_name
      else if (menu?.restaurant?.name) restaurantNameCandidate = menu.restaurant.name
      else if (menu?.Restaurant?.name) restaurantNameCandidate = menu.Restaurant.name

      // Si no viene en el objeto `menu`, buscar en el store de restaurantes por id
      if (!restaurantNameCandidate && restaurantId && Array.isArray(restaurants)) {
        const found = restaurants.find((r) => (r._id || r.id) == restaurantId)
        if (found) restaurantNameCandidate = found.restaurant_name || found.name || ''
      }

      const restaurantName = (restaurantNameCandidate || '').toString().toLowerCase()
      return restaurantName.includes(q)
    })
  }, [availableMenus, searchRestaurant])

  const handleView = (menu) => {
    setSelectedMenu(menu)
    setIsViewModalOpen(true)
  }

  return (
    <div className="min-h-full bg-[#2E160C] text-[#FCF0CA] px-4 py-8 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-7xl rounded-[2.5rem] border border-[#7F532C]/30 bg-[#5B300E]/20 px-6 py-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 border-b border-[#FCF0CA]/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#946841]">
              Menú del cliente
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#FCF0CA] sm:text-5xl">
              Explora los platillos y bebidas
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[#F5D9A5]/80">
              La vista usa el mismo origen de datos que el menú de administración, pero sin acciones de edición.
            </p>
          </div>

          <div className="rounded-2xl border border-[#FCF0CA]/10 bg-black/20 px-4 py-3 text-right">
            <div className="text-2xl font-black text-[#FCF0CA]">{availableMenus.length}</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#946841]">menús disponibles</div>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-6">
            <input
              aria-label="Buscar por restaurante"
              value={searchRestaurant}
              onChange={(e) => setSearchRestaurant(e.target.value)}
              placeholder="Buscar por restaurante..."
              className="w-full max-w-md px-4 py-2 rounded-md text-black"
            />
          </div>
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