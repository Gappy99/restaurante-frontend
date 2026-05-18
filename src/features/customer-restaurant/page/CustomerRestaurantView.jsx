import { useEffect, useState } from 'react'
import useRestaurantStore from '../../restaurant/store/useRestaurantStore'
import CustomerRestaurantList from '../components/CustomerRestaurantList'
import RestaurantViewModal from '../components/RestaurantViewModal'

const LAST_RESTAURANT_KEY = 'customer:lastRestaurant'

export default function CustomerRestaurantView() {
  const { restaurants, fetchRestaurants, loading } = useRestaurantStore()
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchRestaurants()
  }, [fetchRestaurants])

  const handleView = (restaurant) => {
    const id = restaurant?._id || restaurant?.id || null
    if (id) {
      localStorage.setItem(
        LAST_RESTAURANT_KEY,
        JSON.stringify({
          id,
          name: restaurant?.restaurant_name || restaurant?.name || '',
          ts: Date.now(),
        })
      )
    }
    setSelected(restaurant)
    setOpen(true)
  }

  return (
    <div className="min-h-full bg-[#111111] text-[#f8fafc] px-4 py-8 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-7xl rounded-[2.5rem] border border-[#6b7280]/30 bg-[#1f2937]/20 px-6 py-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#9ca3af]">Restaurantes</p>
            <h1 className="mt-2 text-3xl font-black">Explora nuestros locales</h1>
          </div>
          <div className="text-sm text-[#f8fafc]">{restaurants?.length || 0} locales</div>
        </div>

        <CustomerRestaurantList restaurants={restaurants} loading={loading} onView={handleView} />
      </section>

      {open && (
        <RestaurantViewModal isOpen={open} onClose={() => setOpen(false)} restaurant={selected} />
      )}
    </div>
  )
}
