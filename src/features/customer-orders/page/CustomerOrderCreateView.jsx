import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import useAuthStore from '../../../shared/stores/useAuthStore'
import useRestaurantStore from '../../restaurant/store/useRestaurantStore'
import useMenuStore from '../../menus/store/useMenuStore'
import useCouponStore from '../../coupon/store/useCouponStore'
import useOrderStore from '../../orders/store/useOrderStore'

const LAST_RESTAURANT_KEY = 'customer:lastRestaurant'

const emptyOrder = {
  Orders_domicile: '',
  Orders_cupon: '',
  Orders_status: 'en_preparacion',
  Menu_id: '',
}

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

const isCouponValidForOrder = (coupon) => {
  if (!coupon) return false
  if (coupon.active === false) return false

  if (coupon.expiration_date) {
    const expirationDate = new Date(coupon.expiration_date)
    if (!Number.isNaN(expirationDate.getTime()) && expirationDate < new Date()) return false
  }

  if (typeof coupon.current_uses === 'number' && typeof coupon.max_uses === 'number') {
    if (coupon.current_uses >= coupon.max_uses) return false
  }

  return true
}

export default function CustomerOrderCreateView() {
  const navigate = useNavigate()
  const { restaurantId: routeRestaurantId } = useParams()
  const user = useAuthStore((state) => state.user)
  const { restaurants, fetchRestaurants } = useRestaurantStore()
  const { menus, fetchMenus } = useMenuStore()
  const { coupons, fetchCoupons } = useCouponStore()
  const { saveOrder } = useOrderStore()

  const [formData, setFormData] = useState(emptyOrder)
  const [restaurantContext, setRestaurantContext] = useState({ id: '', name: '' })

  useEffect(() => {
    fetchRestaurants()
    fetchMenus()
    fetchCoupons()
  }, [fetchRestaurants, fetchMenus, fetchCoupons])

  useEffect(() => {
    if (routeRestaurantId) {
      setRestaurantContext((prev) => ({
        ...prev,
        id: String(routeRestaurantId),
      }))
      return
    }

    try {
      const raw = localStorage.getItem(LAST_RESTAURANT_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.id) {
        setRestaurantContext({
          id: String(parsed.id),
          name: parsed?.name || '',
        })
      }
    } catch {
      // ignore invalid cache
    }
  }, [routeRestaurantId])

  const restaurantOptions = useMemo(() => (Array.isArray(restaurants) ? restaurants : []), [restaurants])
  const menuOptions = useMemo(() => (Array.isArray(menus) ? menus : []), [menus])
  const couponOptions = useMemo(() => (Array.isArray(coupons) ? coupons : []), [coupons])
  const validCouponOptions = useMemo(() => couponOptions.filter(isCouponValidForOrder), [couponOptions])

  const selectedRestaurantId = restaurantContext.id
  const selectedRestaurantName = useMemo(() => {
    if (restaurantContext.name) return restaurantContext.name
    const found = restaurantOptions.find((item) => asId(item) === String(selectedRestaurantId))
    return found ? getRestaurantLabel(found) : ''
  }, [restaurantContext.name, restaurantOptions, selectedRestaurantId])

  const selectedUserId = user?._id || user?.id || ''
  const selectedUserName = user?.nombre || user?.name || user?.username || 'Cliente'

  const filteredMenuOptions = useMemo(() => {
    if (!selectedRestaurantId) return []

    return menuOptions.filter((menu) => {
      const menuRestaurantId = asId(menu?.restaurant_id || menu?.Restaurant_id)
      return menuRestaurantId === selectedRestaurantId
    })
  }, [menuOptions, selectedRestaurantId])

  const userDisplayName = useMemo(
    () => user?.nombre || user?.name || user?.username || 'Cliente',
    [user]
  )

  const handleSubmit = async (event) => {
    event.preventDefault()

    const sanitize = (value) => {
      if (!value) return ''
      if (Array.isArray(value)) return ''
      return String(value).trim()
    }

    const payload = {
      Orders_domicile: sanitize(formData.Orders_domicile),
      Orders_cupon: sanitize(formData.Orders_cupon) || null,
      Orders_status: sanitize(formData.Orders_status) || 'en_preparacion',
      Restaurant_id: sanitize(selectedRestaurantId),
      Menu_id: sanitize(formData.Menu_id),
      User_id: sanitize(selectedUserId),
      client_name: userDisplayName,
    }

    if (payload.Orders_cupon) {
      const coupon = couponOptions.find((item) => asId(item) === payload.Orders_cupon)
      if (!isCouponValidForOrder(coupon)) {
        toast.error('El cupón seleccionado está expirado, inactivo o ya no tiene usos disponibles')
        return
      }
    }

    if (!payload.Orders_domicile || !payload.Restaurant_id || !payload.Menu_id || !payload.User_id) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    const result = await saveOrder(payload)
    if (result?.success) {
      toast.success('Orden creada con éxito')
      
      // Guardar datos de la orden en sessionStorage para el detallepedido
      const orderId = result?.data?._id || result?.data?.id
      if (orderId) {
        sessionStorage.setItem(
          `order:${orderId}`,
          JSON.stringify({
            id: orderId,
            restaurant_id: payload.Restaurant_id,
            user_id: payload.User_id,
            domicile: payload.Orders_domicile,
          })
        )
        // Redirigir a detallepedido
        navigate(`/customer/orders/${orderId}/details`)
      } else {
        // Fallback si no viene orderId
        navigate('/customer/orders')
      }
    }
  }

  const goBack = () => navigate('/customer/orders')

  return (
    <div className="min-h-screen bg-[#2E160C] text-[#FCF0CA] p-4 md:p-8">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#7F532C]/30 bg-[#5B300E]/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="flex flex-col gap-3 border-b border-[#FCF0CA]/10 pb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#946841]">Customer Orders</p>
          <h1 className="text-3xl md:text-5xl font-black uppercase italic bg-gradient-to-r from-[#FCF0CA] via-[#946841] to-[#7F532C] bg-clip-text text-transparent">
            Crear orden
          </h1>
          <p className="text-sm text-[#F5D9A5]/80">
            El restaurante y el usuario se asignan automáticamente desde el flujo del cliente.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2 rounded-xl border border-[#7F532C]/20 bg-[#7F532C]/10 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#FCF0CA]/70">Restaurante asignado</p>
            <p className="mt-1 text-sm font-bold text-[#FCF0CA]">{selectedRestaurantName || 'Se tomará del último restaurante visitado'}</p>
            <p className="mt-1 text-xs text-[#F5D9A5]/80">{selectedRestaurantId || 'Sin restaurante seleccionado'}</p>
          </div>

          <div className="md:col-span-2 rounded-xl border border-[#7F532C]/20 bg-[#7F532C]/10 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#FCF0CA]/70">Usuario asignado</p>
            <p className="mt-1 text-sm font-bold text-[#FCF0CA]">{selectedUserName}</p>
            <p className="mt-1 text-xs text-[#F5D9A5]/80">{selectedUserId || 'Sin usuario logeado'}</p>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[#F5D9A5]/70">Domicilio</p>
            <input
              required
              value={formData.Orders_domicile}
              onChange={(e) => setFormData((prev) => ({ ...prev, Orders_domicile: e.target.value }))}
              placeholder="Domicilio de la orden *"
              className="mt-2 w-full rounded-xl border border-[#FCF0CA]/20 bg-black/20 px-4 py-3 text-[#FCF0CA] outline-none"
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#F5D9A5]/70">Cupón</p>
            <select
              value={formData.Orders_cupon}
              onChange={(e) => setFormData((prev) => ({ ...prev, Orders_cupon: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-[#FCF0CA]/20 bg-black/20 px-4 py-3 text-[#FCF0CA] outline-none"
            >
              <option value="">Sin cupón</option>
              {validCouponOptions.map((coupon) => {
                const id = asId(coupon)
                return (
                  <option key={id} value={id}>
                    {getCouponLabel(coupon)}
                  </option>
                )
              })}
            </select>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#F5D9A5]/70">Estado</p>
            <select
              value={formData.Orders_status}
              onChange={(e) => setFormData((prev) => ({ ...prev, Orders_status: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-[#FCF0CA]/20 bg-black/20 px-4 py-3 text-[#FCF0CA] outline-none"
            >
              <option value="en_preparacion">en_preparacion</option>
              <option value="listo">listo</option>
              <option value="entregado">entregado</option>
              <option value="cancelado">cancelado</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[#F5D9A5]/70">Menú</p>
            <select
              required
              value={formData.Menu_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, Menu_id: e.target.value }))}
              disabled={!selectedRestaurantId}
              className="mt-2 w-full rounded-xl border border-[#FCF0CA]/20 bg-black/20 px-4 py-3 text-[#FCF0CA] outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {selectedRestaurantId ? 'Selecciona un menú *' : 'Selecciona primero un restaurante'}
              </option>
              {filteredMenuOptions.map((menu) => {
                const id = asId(menu)
                return (
                  <option key={id} value={id}>
                    {getMenuLabel(menu)}
                  </option>
                )
              })}
            </select>
          </div>

          <div className="md:col-span-2 rounded-xl border border-[#7F532C]/20 bg-[#7F532C]/10 px-4 py-3 text-sm text-[#F5D9A5]/80">
            El restaurante y el usuario se asignan automáticamente desde el flujo del cliente.
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={goBack}
              className="rounded-xl border border-[#FCF0CA]/20 px-4 py-2 font-semibold text-[#FCF0CA] hover:bg-black/20"
            >
              Volver
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#7F532C] px-5 py-2 font-bold text-[#FCF0CA] hover:bg-[#946841]"
            >
              Crear orden
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
