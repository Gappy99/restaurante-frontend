import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useOrderStore from '../../orders/store/useOrderStore'
import { Spinner } from '../../../shared/components/Spinner'
import useRestaurantStore from '../../restaurant/store/useRestaurantStore'
import useMenuStore from '../../menus/store/useMenuStore'
import useCouponStore from '../../coupon/store/useCouponStore'
import OrderTimerBadge from '../components/OrderTimerBadge'
import { getDetallePedidosByOrderService } from '../../detallepedido/services/DetallePedidoService'
import { getDishByIdService } from '../../dishes/services/DishService'
import { getBeverageByIdService } from '../../beverages/services/BeverageService'

const LAST_RESTAURANT_KEY = 'customer:lastRestaurant'

const asId = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value?._id || value?.idusuario || value?.id || value?.user_id || ''
}

const resolveOrderCreatedAt = (order) =>
  order?.createdAt ||
  order?.created_at ||
  order?.fechaCreacion ||
  order?.fecha_creacion ||
  order?.fecha ||
  order?.Orders_createdAt ||
  order?.Orders_created_at ||
  order?.Orders_fecha ||
  ''

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
  // Estado para la barra de pestañas (Todas, En Proceso, Completadas)
  const [activeTab, setActiveTab] = useState('Todas')

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
    return menu ? getMenuLabel(menu) : 'Menú no encontrado'
  }

  const selectedCouponLabel = (id) => {
    const coupon = couponOptions.find((item) => asId(item) === id)
    return coupon ? getCouponLabel(coupon) : 'Sin cupón'
  }

  // Filtrado por las pestañas basándose en tu Orders_status
  const filteredOrders = useMemo(() => {
    if (activeTab === 'Todas') return rows
    if (activeTab === 'En Proceso') {
      return rows.filter(order => 
        order?.Orders_status === 'en_preparacion' || 
        order?.Orders_status === 'en_proceso' || 
        !order?.Orders_status
      )
    }
    if (activeTab === 'Completadas') {
      return rows.filter(order => order?.Orders_status === 'completada' || order?.Orders_status === 'entregada')
    }
    return rows
  }, [rows, activeTab])

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
      // ignore
    }
    navigate('/customer/restaurants')
  }

  // Mapa local con items y total por orden: { [orderId]: { items: [{name, qty, unitPrice, subtotal}], total } }
  const [orderDetailsMap, setOrderDetailsMap] = useState({})

  useEffect(() => {
    let mounted = true

    const extractDetalleList = (resp) => {
      if (!resp) return []
      if (Array.isArray(resp)) return resp
      if (Array.isArray(resp?.data)) return resp.data
      if (Array.isArray(resp?.detallePedidos)) return resp.detallePedidos
      return []
    }

    const loadDetailsForOrders = async () => {
      if (!Array.isArray(rows) || rows.length === 0) {
        setOrderDetailsMap({})
        return
      }

      const entries = await Promise.all(rows.map(async (order) => {
        const id = (order?._id || order?.id || order?.Orders_id || '')
        if (!id) return [id, { items: [], total: 0 }]

        try {
          const detallesResp = await getDetallePedidosByOrderService(id)
          const detalles = extractDetalleList(detallesResp)

          const items = await Promise.all(detalles.map(async (d) => {
            const qty = Number(d?.candidadproducto || d?.quantity || 1)
            const type = (d?.productType || d?.tipo || 'dish')
            const producto = d?.producto

            let productObj = null
            if (producto && typeof producto === 'object') {
              productObj = producto
            } else if (producto) {
              try {
                const resp = type === 'beverage'
                  ? await getBeverageByIdService(producto)
                  : await getDishByIdService(producto)
                productObj = resp?.data || resp || null
              } catch {
                productObj = null
              }
            }

            const unitPrice = Number(productObj?.Menu_Price ?? productObj?.price ?? 0)
            const name = productObj?.Menu_Plate || productObj?.Menu_Drink || productObj?.name || String(producto || '')
            const subtotal = unitPrice * qty
            return { name, qty, unitPrice, subtotal }
          }))

          const total = items.reduce((s, it) => s + Number(it.subtotal || 0), 0)
          return [id, { items, total }]
        } catch {
          return [id, { items: [], total: 0 }]
        }
      }))

      if (!mounted) return
      const map = Object.fromEntries(entries.filter(e => e && e[0]))
      setOrderDetailsMap(map)
    }

    loadDetailsForOrders()

    return () => { mounted = false }
  }, [rows])

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await fetchOrders()
      return
    }
    await searchOrders(searchTerm.trim())
  }

  // Helper dinámico para renderizar estilos de badges basados en el estado
  const getStatusBadgeStyles = (status) => {
    const s = status?.toLowerCase() || 'en_preparacion'
    if (s === 'completada' || s === 'entregada') {
        return 'bg-emerald-500 text-black'
      }
      return 'bg-zinc-300 text-black'
  }

  return (
    <div className="min-h-screen bg-[#141416] text-zinc-200 p-4 md:p-8 font-sans font-semibold">
      
      {/* HEADER DE LA VISTA */}
      <header className="max-w-7xl mx-auto mb-6 bg-[#1b1b1f] border border-zinc-800 rounded-2xl p-5 md:p-6 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Panel de Control</span>
            <h1 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase">
              Mis Órdenes
            </h1>
          </div>

          {/* BARRA DE BÚSQUEDA Y ACCIONES */}
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2.5">
            <div className="relative w-full sm:w-72">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
                className="w-full rounded-xl border border-zinc-800 bg-[#141416] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
                placeholder="Buscar número, domicilio o cupón..."
              />
            </div>
            
            <button
              type="button"
              onClick={handleSearch}
              className="rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-700 transition"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS (Estilo 'El Buen Gusto') */}
        <div className="flex bg-[#141416] p-1 rounded-xl border border-zinc-800 mt-6 max-w-md">
          {['Todas', 'En Proceso', 'Completadas'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-[#1b1b1f] text-white shadow-md border border-zinc-800'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL: GRILLA DE TARJETAS */}
      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-24"><Spinner /></div>
        ) : (
          <div>
            {filteredOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => {
                  const id = asId(order)
                  
                  // Estructuración de los ítems internos de la orden cruzando con el ID del Detalle
                  // Si viene un array en order.details o order.Detail_id lo usamos, de lo contrario fallback al Menu_id unitario
                  const orderDetails = Array.isArray(order?.Detail_id) 
                    ? order.Detail_id 
                    : Array.isArray(order?.details) 
                    ? order.details 
                    : [{ Menu_id: order?.Menu_id, quantity: 1 }]

                  return (
                    <div 
                      key={id} 
                      className="bg-[#1b1b1f] border border-zinc-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-zinc-700 transition space-y-4"
                    >
                      {/* Línea Superior: Número de Orden y Hora / Temporizador */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-mono text-lg font-bold text-white tracking-tight">
                            #{order?.Orders_number || '---'}
                          </h3>
                          <span className="text-[10px] font-mono text-zinc-500 block truncate max-w-[150px]">
                            ID: {order?.Orders_id || id.substring(0, 8)}...
                          </span>
                        </div>
                        <div className="text-right">
                          <OrderTimerBadge
                            orderId={id}
                            createdAt={resolveOrderCreatedAt(order)}
                            status={order?.Orders_status}
                          />
                        </div>
                      </div>

                      {/* Estado de la Orden */}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-md text-[10px] font-extrabold ${getStatusBadgeStyles(order?.Orders_status)}`}>
                          {order?.Orders_status || 'en_preparacion'}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium truncate">
                          {selectedRestaurantLabel(asId(order?.Restaurant_id))}
                        </span>
                      </div>

                      {/* DETALLE DINÁMICO DE PRODUCTOS (Cruza el ID del detalle de pedido para pintar nombres reales) */}
                      <div className="bg-[#141416]/70 border border-zinc-900 rounded-xl p-3 space-y-2 max-h-28 overflow-y-auto custom-scrollbar">
                        {(orderDetailsMap[id] && Array.isArray(orderDetailsMap[id].items) && orderDetailsMap[id].items.length > 0) ? (
                          orderDetailsMap[id].items.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-zinc-300 font-medium truncate max-w-[70%]">{it.name}</span>
                              <span className="text-zinc-500 font-mono text-[11px]">x{it.qty}</span>
                            </div>
                          ))
                        ) : (
                          orderDetails.map((detail, idx) => {
                            const targetMenuId = asId(detail?.Menu_id || detail);
                            const productName = selectedMenuLabel(targetMenuId);
                            const quantity = detail?.quantity || order?.Orders_quantity || 1;

                            return (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="text-zinc-300 font-medium truncate max-w-[70%]"> {productName}</span>
                                <span className="text-zinc-500 font-mono text-[11px]">x{quantity}</span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Info de Entrega, Cupón y el Gran Total en la base */}
                      <div className="border-t border-zinc-800/60 pt-3 flex flex-col space-y-1 text-xs text-zinc-500">
                        <div className="flex justify-between">
                          <span>Domicilio:</span>
                          <span className="text-zinc-300 truncate max-w-[180px] font-medium">{order?.Orders_domicile || 'En Salón'}</span>
                        </div>
                        {order?.Orders_cupon && (
                          <div className="flex justify-between text-[11px] text-zinc-200/80">
                            <span>Cupón:</span>
                            <span className="truncate max-w-[180px] font-mono">{selectedCouponLabel(asId(order?.Orders_cupon))}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-2 border-t border-zinc-900 mt-1">
                          <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">Total de la Orden</span>
                          <span className="text-base font-mono font-bold text-white">
                            Q{Number((orderDetailsMap[id]?.total ?? order?.Orders_total ?? 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>

                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-12 text-center bg-[#1b1b1f] border border-zinc-800 rounded-2xl text-zinc-500 text-sm italic">
                No hay órdenes disponibles para este estado o búsqueda.
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-medium text-red-400">
            ⚠ {error}
          </div>
        )}
      </main>
    </div>
  )
}

export default CustomerOrdersView
