import { useEffect, useMemo, useState } from 'react'
import useOrderStore from '../store/useOrderStore'
import { Spinner } from '../../../shared/components/Spinner'
import useRestaurantStore from '../../restaurant/store/useRestaurantStore'
import useMenuStore from '../../menus/store/useMenuStore'

const couponOptions = [
  '',
  'Cupon_30_Quetzales',
  'Cupon_20%_Descuento',
  'Dos_Por_Uno',
  'Envio_Gratis',
  'Primera_Compra',
  'Descuento_10%',
  'Cupon_50_Quetzales',
  'Cupon_15%_Descuento',
]

const statusOptions = ['en_preparacion', 'listo', 'entregado', 'cancelado']

const emptyOrder = {
  Orders_domicile: '',
  Orders_cupon: '',
  Orders_status: 'en_preparacion',
  Restaurant_id: '',
  Menu_id: '',
  User_id: '',
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

const OrdersPage = () => {
  const {
    orders,
    loading,
    error,
    fetchOrders,
    searchOrders,
    saveOrder,
    removeOrder,
  } = useOrderStore()

  const { restaurants, fetchRestaurants } = useRestaurantStore()
  const { menus, fetchMenus } = useMenuStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOrderId, setEditingOrderId] = useState(null)
  const [formData, setFormData] = useState(emptyOrder)

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    fetchRestaurants()
    fetchMenus()
  }, [fetchRestaurants, fetchMenus])

  const rows = useMemo(() => (Array.isArray(orders) ? orders : []), [orders])

  const restaurantOptions = useMemo(() => (Array.isArray(restaurants) ? restaurants : []), [restaurants])
  const menuOptions = useMemo(() => (Array.isArray(menus) ? menus : []), [menus])

  const filteredMenuOptions = useMemo(() => {
    if (!formData.Restaurant_id) return []

    return menuOptions.filter((menu) => {
      const menuRestaurantId = asId(menu?.restaurant_id || menu?.Restaurant_id)
      return menuRestaurantId === formData.Restaurant_id
    })
  }, [menuOptions, formData.Restaurant_id])

  const selectedRestaurantLabel = (id) => {
    const restaurant = restaurantOptions.find((item) => asId(item) === id)
    return restaurant ? getRestaurantLabel(restaurant) : 'Selecciona un restaurante'
  }

  const selectedMenuLabel = (id) => {
    const menu = menuOptions.find((item) => asId(item) === id)
    return menu ? getMenuLabel(menu) : 'Selecciona un menú'
  }

  const selectedUserLabel = (id) => id || 'Sin usuario'

  const openCreate = () => {
    setEditingOrderId(null)
    setFormData(emptyOrder)
    setIsModalOpen(true)
  }

  const openEdit = (order) => {
    setEditingOrderId(asId(order))
    setFormData({
      Orders_domicile: order?.Orders_domicile || '',
      Orders_cupon: order?.Orders_cupon || '',
      Orders_status: order?.Orders_status || 'en_preparacion',
      Restaurant_id: asId(order?.Restaurant_id),
      Menu_id: asId(order?.Menu_id),
      User_id: asId(order?.User_id),
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingOrderId(null)
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await fetchOrders()
      return
    }
    await searchOrders(searchTerm.trim())
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    // Sanitizar valores: convertir a string y limpiar, rechazar arrays
    const sanitize = (value) => {
      if (!value) return ''
      if (Array.isArray(value)) return ''
      return String(value).trim()
    }

    const payload = {
      Orders_domicile: sanitize(formData.Orders_domicile),
      Orders_cupon: sanitize(formData.Orders_cupon) || null,
      Orders_status: sanitize(formData.Orders_status) || 'en_preparacion',
      Restaurant_id: sanitize(formData.Restaurant_id),
      Menu_id: sanitize(formData.Menu_id),
      User_id: sanitize(formData.User_id),
    }

    // Validación de campos obligatorios
    if (!payload.Orders_domicile || !payload.Restaurant_id || !payload.Menu_id || !payload.User_id) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    const result = await saveOrder(payload, editingOrderId)
    if (result?.success) {
      closeModal()
      await fetchOrders()
    }
  }

  const handleDelete = async (order) => {
    const id = asId(order)
    if (!id) return

    const confirmed = window.confirm(`Eliminar la orden ${order?.Orders_number || id}?`)
    if (!confirmed) return

    await removeOrder(id)
  }

  return (
    <div className="min-h-screen bg-[#2E160C] text-[#FCF0CA] p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 rounded-[2rem] border border-[#7F532C]/30 bg-[#5B300E]/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#946841]">Orders</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase italic bg-gradient-to-r from-[#FCF0CA] via-[#946841] to-[#7F532C] bg-clip-text text-transparent">
              Gestion de ordenes
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
              onClick={openCreate}
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
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Restaurant/Menu/User</th>
                    <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-widest">Acciones</th>
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
                        <td className="px-4 py-4 text-xs">
                          <div>R: {selectedRestaurantLabel(asId(order?.Restaurant_id))}</div>
                          <div>M: {selectedMenuLabel(asId(order?.Menu_id))}</div>
                          <div>U: {selectedUserLabel(asId(order?.User_id))}</div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(order)}
                              className="rounded-xl border border-[#7F532C]/30 px-4 py-2 text-sm font-semibold text-[#2E160C] hover:bg-[#FCF0CA]"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(order)}
                              className="rounded-xl bg-[#5B300E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E160C]"
                            >
                              Eliminar
                            </button>
                          </div>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-[#7F532C]/20 bg-[#FCF0CA] text-[#2E160C] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#7F532C]/10 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#7F532C]">Formulario</p>
                <h2 className="text-2xl font-black uppercase italic">
                  {editingOrderId ? 'Editar orden' : 'Nueva orden'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-[#7F532C]/30 px-3 py-1 text-sm font-semibold hover:bg-[#FCF0CA]"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              <label className="space-y-1 text-sm md:col-span-2">
                <span>Domicilio *</span>
                <input
                  required
                  value={formData.Orders_domicile}
                  onChange={(e) => setFormData((prev) => ({ ...prev, Orders_domicile: e.target.value }))}
                  className="w-full rounded-xl border border-[#7F532C]/30 bg-white px-3 py-2"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span>Cupon</span>
                <select
                  value={formData.Orders_cupon}
                  onChange={(e) => setFormData((prev) => ({ ...prev, Orders_cupon: e.target.value }))}
                  className="w-full rounded-xl border border-[#7F532C]/30 bg-white px-3 py-2"
                >
                  {couponOptions.map((coupon) => (
                    <option key={coupon || 'none'} value={coupon}>
                      {coupon || 'Sin cupon'}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span>Estado</span>
                <select
                  value={formData.Orders_status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, Orders_status: e.target.value }))}
                  className="w-full rounded-xl border border-[#7F532C]/30 bg-white px-3 py-2"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span>Restaurant *</span>
                <select
                  required
                  value={formData.Restaurant_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      Restaurant_id: e.target.value,
                      Menu_id: '',
                    }))
                  }
                  className="w-full rounded-xl border border-[#7F532C]/30 bg-white px-3 py-2"
                >
                  <option value="">Selecciona un restaurante</option>
                  {restaurantOptions.map((restaurant) => {
                    const id = asId(restaurant)
                    return (
                      <option key={id} value={id}>
                        {getRestaurantLabel(restaurant)}
                      </option>
                    )
                  })}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span>Menú *</span>
                <select
                  required
                  value={formData.Menu_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, Menu_id: e.target.value }))}
                  disabled={!formData.Restaurant_id}
                  className="w-full rounded-xl border border-[#7F532C]/30 bg-white px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">
                    {formData.Restaurant_id ? 'Selecciona un menú' : 'Selecciona primero un restaurante'}
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
              </label>

              <label className="space-y-1 text-sm md:col-span-2">
                <span>User ID *</span>
                <input
                  required
                  value={formData.User_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, User_id: e.target.value }))}
                  placeholder="Ingresa manualmente el User_id"
                  className="w-full rounded-xl border border-[#7F532C]/30 bg-white px-3 py-2"
                />
              </label>

              <div className="md:col-span-2 rounded-xl border border-[#7F532C]/20 bg-[#7F532C]/10 px-4 py-3 text-sm text-[#5B300E]">
                El número de orden y el ID se generan automáticamente en el backend.
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-[#7F532C]/30 px-4 py-2 font-semibold hover:bg-[#FCF0CA]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#7F532C] px-5 py-2 font-bold text-[#FCF0CA] hover:bg-[#946841]"
                >
                  {editingOrderId ? 'Guardar cambios' : 'Crear orden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage
