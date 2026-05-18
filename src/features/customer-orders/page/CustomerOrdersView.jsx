import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useOrderStore from '../../orders/store/useOrderStore'
import { Spinner } from '../../../shared/components/Spinner'
import useRestaurantStore from '../../restaurant/store/useRestaurantStore'
import useMenuStore from '../../menus/store/useMenuStore'
import useCouponStore from '../../coupon/store/useCouponStore'
import OrderTimerBadge from '../components/OrderTimerBadge'

const LAST_RESTAURANT_KEY = 'customer:lastRestaurant'

const asId = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value?._id || value?.idusuario || value?.id || value?.user_id || ''
}

const getRestaurantLabel = (restaurant) =>
  restaurant?.name || restaurant?.restaurant_name || restaurant?.nombre || restaurant?.Restaurant_name || 'Restaurante sin nombre'

const getMenuLabel = (menu) =>
  menu?.name || menu?.Menu_Plate || menu?.title || menu?.menu_name || 'Menú sin nombre'

const getCouponLabel = (coupon) => {
  if (!coupon) return 'Sin cupón'

  const code = coupon?.code || coupon?.name || coupon?.coupon_code || coupon?.title || 'Cupón sin nombre'
  const description = coupon?.description ? ` - ${coupon.description}` : ''

  return `${code}${description}`
}

const CustomerOrdersView = () => {
  const navigate = useNavigate()
  const { orders, loading, error, fetchOrders, searchOrders } = useOrderStore()
  const { restaurants, fetchRestaurants } = useRestaurantStore()
  const { menus, fetchMenus } = useMenuStore()
  const { coupons, fetchCoupons } = useCouponStore()

  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    fetchRestaurants()
    fetchMenus()
    fetchCoupons()
  }, [fetchRestaurants, fetchMenus, fetchCoupons])

  const rows = useMemo(() => (Array.isArray(orders) ? orders : []), [orders])
  const restaurantOptions = useMemo(() => (Array.isArray(restaurants) ? restaurants : []), [restaurants])
  const menuOptions = useMemo(() => (Array.isArray(menus) ? menus : []), [menus])
  const couponOptions = useMemo(() => (Array.isArray(coupons) ? coupons : []), [coupons])

  const selectedRestaurantLabel = (id) => {
    const restaurant = restaurantOptions.find((item) => asId(item) === id)
    return restaurant ? getRestaurantLabel(restaurant) : 'Selecciona un restaurante'
  }

  const selectedMenuLabel = (id) => {
    const menu = menuOptions.find((item) => asId(item) === id)
    return menu ? getMenuLabel(menu) : 'Selecciona un menú'
  }

  const selectedCouponLabel = (id) => {
    const coupon = couponOptions.find((item) => asId(item) === id)
    return coupon ? getCouponLabel(coupon) : 'Sin cupón'
  }

  const goToCreateOrder = () => {
    try {
      const raw = localStorage.getItem(LAST_RESTAURANT_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.id) {
          navigate(`/customer/restaurants/${parsed.id}/orders/new`)
          return
        }
      }
    } catch {
      // ignore invalid cache
    }

    navigate('/customer/restaurants')
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await fetchOrders()
      return
    }
    await searchOrders(searchTerm.trim())
  }

  return (
    <div className="min-h-screen bg-[#2E160C] text-[#FCF0CA] p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 rounded-[2rem] border border-[#7F532C]/30 bg-[#5B300E]/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#946841]">Orders</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase italic bg-gradient-to-r from-[#FCF0CA] via-[#946841] to-[#7F532C] bg-clip-text text-transparent">
              Mis ordenes
            </h1>
          </div>

          <div className="flex w-full md:w-auto gap-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch()
                }
              }}
              className="w-full md:w-80 rounded-2xl border border-[#7F532C]/40 bg-[#2E160C]/80 px-4 py-3 text-[#FCF0CA] placeholder:text-[#946841]/80 outline-none transition focus:border-[#FCF0CA]/60 focus:ring-2 focus:ring-[#946841]/25"
              placeholder="Buscar por numero, domicilio o cupon"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="rounded-2xl bg-[#7F532C] px-5 py-3 font-bold text-[#FCF0CA] hover:bg-[#946841]"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={goToCreateOrder}
              className="rounded-2xl bg-[#946841] px-5 py-3 font-bold text-[#FCF0CA] hover:bg-[#7F532C]"
            >
              + Nueva orden
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : (
          <div className="overflow-hidden rounded-[1.75rem] border border-[#7F532C]/20 bg-[#FCF0CA] text-[#2E160C] shadow-2xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#7F532C]/20">
                <thead className="bg-[#FCF0CA]/80 text-[#7F532C]">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Orden</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Domicilio</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Estado</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Temporizador</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Restaurant/Menu/User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#7F532C]/10 bg-white/80">
                  {rows.map((order) => {
                    const id = asId(order)
                    return (
                      <tr key={id} className="hover:bg-[#FCF0CA]/50 transition">
                        <td className="px-4 py-4">
                          <div className="font-bold text-[#2E160C]">#{order?.Orders_number}</div>
                          <div className="text-xs text-[#7F532C]">ID: {order?.Orders_id || id}</div>
                        </td>
                        <td className="px-4 py-4">{order?.Orders_domicile || '-'}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold bg-[#7F532C]/20 text-[#5B300E]">
                            {order?.Orders_status || 'en_preparacion'}
                          </span>
                        </td>
                        <td className="px-4 py-4 w-40">
                          <OrderTimerBadge orderId={id} />
                        </td>
                        <td className="px-4 py-4 text-xs">
                          <div>R: {selectedRestaurantLabel(asId(order?.Restaurant_id))}</div>
                          <div>M: {selectedMenuLabel(asId(order?.Menu_id))}</div>
                          <div>U: {asId(order?.User_id) || 'Sin usuario'}</div>
                          <div>C: {selectedCouponLabel(asId(order?.Orders_cupon))}</div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {!rows.length && (
              <div className="p-8 text-center text-[#7F532C]">No hay ordenes para mostrar.</div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-500/15 border border-red-300/40 p-3 text-sm text-red-100">
            {error}
          </div>
        )}
      </main>
    </div>
  )
}

export default CustomerOrdersView
