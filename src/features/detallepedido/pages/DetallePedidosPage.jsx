import { useEffect, useMemo, useState } from 'react'
import useDetallePedidoStore from '../store/useDetallePedidoStore'
import { Spinner } from '../../../shared/components/Spinner'
import useDishStore from '../../dishes/store/useDishStore'
import useBeverageStore from '../../beverages/store/useBeverageStore'

const createEmptyItem = () => ({
  producto: '',
  productType: 'dish',
  candidadproducto: 1,
})

const emptyDetail = {
  orders_id: '',
  restaurant_id: '',
  producto: '',
  productType: 'dish',
  candidadproducto: 1,
  items: [createEmptyItem()],
}

const asId = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value?._id || value?.id || ''
}

const asPrice = (product) => Number(product?.price ?? product?.Menu_Price ?? 0)

const getProductLabel = (product) =>
  product?.name || product?.Menu_Plate || product?.Menu_Drink || asId(product) || 'Producto sin nombre'

const DetallePedidosPage = () => {
  const {
    detallePedidos,
    loading,
    error,
    fetchDetallePedidos,
    fetchDetallePedidosByOrder,
    saveDetallePedido,
    removeDetallePedido,
  } = useDetallePedidoStore()
  const { dishes, fetchDishesByRestaurant } = useDishStore()
  const { beverages, fetchBeveragesByRestaurant } = useBeverageStore()

  const [orderIdFilter, setOrderIdFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyDetail)

  useEffect(() => {
    fetchDetallePedidos()
  }, [fetchDetallePedidos])

  useEffect(() => {
    if (!isModalOpen || !formData.restaurant_id) return

    fetchDishesByRestaurant(formData.restaurant_id)
    fetchBeveragesByRestaurant(formData.restaurant_id)
  }, [formData.restaurant_id, isModalOpen, fetchDishesByRestaurant, fetchBeveragesByRestaurant])

  const rows = useMemo(() => (Array.isArray(detallePedidos) ? detallePedidos : []), [detallePedidos])
  const dishOptions = useMemo(() => (Array.isArray(dishes) ? dishes : []), [dishes])
  const beverageOptions = useMemo(() => (Array.isArray(beverages) ? beverages : []), [beverages])

  const openCreate = () => {
    setEditingId(null)
    setFormData({ ...emptyDetail, items: [createEmptyItem()] })
    setIsModalOpen(true)
  }

  const openEdit = (detail) => {
    setEditingId(asId(detail))
    setFormData({
      orders_id: asId(detail?.orders_id),
      restaurant_id: asId(detail?.restaurant_id),
      producto: asId(detail?.producto),
      productType: detail?.productType || 'dish',
      candidadproducto: Number(detail?.candidadproducto ?? 1),
      items: [createEmptyItem()],
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
  }

  const handleFilterByOrder = async () => {
    if (!orderIdFilter.trim()) {
      await fetchDetallePedidos()
      return
    }
    await fetchDetallePedidosByOrder(orderIdFilter.trim())
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const normalizeQuantity = (value) => Math.max(1, Number(value) || 1)

    if (!editingId) {
      const ordersId = String(formData.orders_id || '').trim()
      const items = (Array.isArray(formData.items) ? formData.items : [])
        .map((item) => ({
          producto: String(item?.producto || '').trim(),
          productType: item?.productType === 'beverage' ? 'beverage' : 'dish',
          candidadproducto: normalizeQuantity(item?.candidadproducto),
        }))
        .filter((item) => item.producto)

      if (!ordersId || !items.length) {
        return
      }

      const payload = {
        orders_id: ordersId,
        items,
      }

      const result = await saveDetallePedido(payload, null)
      if (result?.success) {
        closeModal()
        if (orderIdFilter.trim()) {
          await fetchDetallePedidosByOrder(orderIdFilter.trim())
        } else {
          await fetchDetallePedidos()
        }
      }
      return
    }

    const payload = {
      orders_id: formData.orders_id,
      producto: formData.producto,
      productType: formData.productType,
      candidadproducto: Number(formData.candidadproducto),
    }

    const result = await saveDetallePedido(payload, editingId)
    if (result?.success) {
      closeModal()
      if (orderIdFilter.trim()) {
        await fetchDetallePedidosByOrder(orderIdFilter.trim())
      } else {
        await fetchDetallePedidos()
      }
    }
  }

  const handleDelete = async (detail) => {
    const id = asId(detail)
    if (!id) return

    const confirmed = window.confirm(`Eliminar este detalle de pedido?`)
    if (!confirmed) return

    await removeDetallePedido(id)
  }

  const getOptionsByType = (type) => (type === 'beverage' ? beverageOptions : dishOptions)

  const getItemUnitPrice = (type, productId) => {
    const options = getOptionsByType(type)
    const product = options.find((item) => asId(item) === productId)
    return asPrice(product)
  }

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...(Array.isArray(prev.items) ? prev.items : []), createEmptyItem()],
    }))
  }

  const removeItemRow = (index) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.items) ? prev.items : []
      if (current.length <= 1) return prev
      return {
        ...prev,
        items: current.filter((_, idx) => idx !== index),
      }
    })
  }

  const updateItemRow = (index, patch) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.items) ? prev.items : []
      return {
        ...prev,
        items: current.map((item, idx) => {
          if (idx !== index) return item
          return { ...item, ...patch }
        }),
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#111111] text-[#f8fafc] p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 rounded-[2rem] border border-[#6b7280]/30 bg-[#1f2937]/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#9ca3af]">Detalles de Pedidos</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase italic bg-gradient-to-r from-[#f8fafc] via-[#9ca3af] to-[#6b7280] bg-clip-text text-transparent">
              Gestión de detalles
            </h1>
          </div>

          <div className="flex w-full md:w-auto gap-3">
            <input
              value={orderIdFilter}
              onChange={(e) => setOrderIdFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleFilterByOrder()
                }
              }}
              className="w-full md:w-80 rounded-2xl border border-[#6b7280]/40 bg-[#111111]/80 px-4 py-3 text-[#f8fafc] placeholder:text-[#9ca3af]/80 outline-none transition focus:border-[#f8fafc]/60 focus:ring-2 focus:ring-[#9ca3af]/25"
              placeholder="ID de orden"
            />
            <button
              type="button"
              onClick={handleFilterByOrder}
              className="rounded-2xl bg-[#6b7280] px-5 py-3 font-bold text-[#f8fafc] hover:bg-[#9ca3af]"
            >
              Filtrar
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="rounded-2xl bg-[#9ca3af] px-5 py-3 font-bold text-[#f8fafc] hover:bg-[#6b7280]"
            >
              + Nuevo detalle
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : (
          <div className="overflow-hidden rounded-[1.75rem] border border-[#6b7280]/20 bg-[#f8fafc] text-[#111111] shadow-2xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#6b7280]/20">
                <thead className="bg-[#f8fafc]/80 text-[#6b7280]">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Orden</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Producto</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Tipo</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Cantidad</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Precio Unit.</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Total</th>
                    <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#6b7280]/10 bg-white/80">
                  {rows.map((detail) => {
                    const id = asId(detail)
                    const quantity = Number(detail?.candidadproducto || 0)
                    const productPrice = asPrice(detail?.producto)
                    const total = Number(detail?.total ?? productPrice * quantity)
                    const unitPrice = quantity > 0 ? total / quantity : productPrice
                    return (
                      <tr key={id} className="hover:bg-[#f8fafc]/50 transition">
                        <td className="px-4 py-4">
                          <div className="text-xs text-[#6b7280]">{asId(detail?.orders_id) || '-'}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-xs text-[#6b7280]">{getProductLabel(detail?.producto)}</div>
                          <div className="text-[10px] text-[#9ca3af]">{asId(detail?.producto) || '-'}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold bg-[#6b7280]/20 text-[#1f2937]">
                            {detail?.productType || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-semibold">{quantity}</td>
                        <td className="px-4 py-4">Q{Number(unitPrice || 0).toFixed(2)}</td>
                        <td className="px-4 py-4 font-semibold">${total.toFixed(2)}</td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(detail)}
                              className="rounded-xl border border-[#6b7280]/30 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f8fafc]"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(detail)}
                              className="rounded-xl bg-[#1f2937] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111111]"
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
              <div className="p-8 text-center text-[#6b7280]">No hay detalles de pedidos para mostrar.</div>
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
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-[#6b7280]/20 bg-[#f8fafc] text-[#111111] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#6b7280]/10 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#6b7280]">Formulario</p>
                <h2 className="text-2xl font-black uppercase italic">
                  {editingId ? 'Editar detalle' : 'Nuevo detalle de pedido'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-[#6b7280]/30 px-3 py-1 text-sm font-semibold hover:bg-[#f8fafc]"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              <div className="space-y-1 text-sm">
                <input
                  required
                  value={formData.orders_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, orders_id: e.target.value }))}
                  placeholder="Orden ID *"
                  className="w-full rounded-xl border border-[#6b7280]/30 bg-white px-3 py-2"
                />
              </div>

              <div className="space-y-1 text-sm">
                <input
                  required
                  value={formData.restaurant_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, restaurant_id: e.target.value }))}
                  placeholder="Restaurant ID *"
                  className="w-full rounded-xl border border-[#6b7280]/30 bg-white px-3 py-2"
                />
              </div>

              {!editingId && (
                <>
                  <div className="md:col-span-2 rounded-xl border border-[#6b7280]/20 bg-[#6b7280]/10 px-4 py-3 text-sm text-[#1f2937]">
                    El precio unitario se toma automáticamente del producto seleccionado (dish o beverage).
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    {formData.items.map((item, idx) => {
                      const options = getOptionsByType(item.productType)
                      const unitPrice = getItemUnitPrice(item.productType, item.producto)
                      const subtotal = unitPrice * Number(item.candidadproducto || 0)

                      return (
                        <div key={`item-${idx}`} className="rounded-2xl border border-[#6b7280]/20 bg-white/80 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-bold text-[#1f2937]">Producto {idx + 1}</p>
                            <button
                              type="button"
                              onClick={() => removeItemRow(idx)}
                              className="rounded-lg border border-[#6b7280]/30 px-3 py-1 text-xs font-semibold hover:bg-[#f8fafc]"
                            >
                              Quitar
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1 text-sm">
                              <select
                                required
                                aria-label="Tipo de producto"
                                value={item.productType}
                                onChange={(e) => updateItemRow(idx, { productType: e.target.value, producto: '' })}
                                className="w-full rounded-xl border border-[#6b7280]/30 bg-white px-3 py-2"
                              >
                                <option value="dish">Dish</option>
                                <option value="beverage">Beverage</option>
                              </select>
                            </div>

                            <div className="space-y-1 text-sm md:col-span-2">
                              <select
                                required
                                aria-label="Producto"
                                value={item.producto}
                                onChange={(e) => updateItemRow(idx, { producto: e.target.value })}
                                className="w-full rounded-xl border border-[#6b7280]/30 bg-white px-3 py-2"
                              >
                                <option value="">Selecciona un producto</option>
                                {options.map((option) => {
                                  const optionId = asId(option)
                                  return (
                                    <option key={optionId} value={optionId}>
                                      {getProductLabel(option)} - Q{asPrice(option).toFixed(2)}
                                    </option>
                                  )
                                })}
                              </select>
                            </div>

                            <div className="space-y-1 text-sm">
                              <input
                                required
                                type="number"
                                min="1"
                                aria-label="Cantidad"
                                value={item.candidadproducto}
                                onChange={(e) => updateItemRow(idx, { candidadproducto: e.target.value })}
                                className="w-full rounded-xl border border-[#6b7280]/30 bg-white px-3 py-2"
                              />
                            </div>

                            <div className="space-y-1 text-sm">
                              <span>Precio Unitario</span>
                              <div className="w-full rounded-xl border border-[#6b7280]/20 bg-[#f8fafc] px-3 py-2 font-semibold text-[#1f2937]">
                                Q{unitPrice.toFixed(2)}
                              </div>
                            </div>

                            <div className="space-y-1 text-sm">
                              <span>Total</span>
                              <div className="w-full rounded-xl border border-[#6b7280]/20 bg-[#f8fafc] px-3 py-2 font-semibold text-[#1f2937]">
                                Q{subtotal.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    <button
                      type="button"
                      onClick={addItemRow}
                      className="rounded-xl border border-[#6b7280]/30 px-4 py-2 text-sm font-semibold hover:bg-[#f8fafc]"
                    >
                      + Agregar otro producto
                    </button>
                  </div>
                </>
              )}

              {editingId && (
                <>
                  <div className="space-y-1 text-sm">
                    <select
                      required
                      aria-label="Tipo de Producto"
                      value={formData.productType}
                      onChange={(e) => setFormData((prev) => ({ ...prev, productType: e.target.value, producto: '' }))}
                      className="w-full rounded-xl border border-[#6b7280]/30 bg-white px-3 py-2"
                    >
                      <option value="dish">Dish</option>
                      <option value="beverage">Beverage</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-sm">
                    <select
                      required
                      aria-label="Producto"
                      value={formData.producto}
                      onChange={(e) => setFormData((prev) => ({ ...prev, producto: e.target.value }))}
                      className="w-full rounded-xl border border-[#6b7280]/30 bg-white px-3 py-2"
                    >
                      <option value="">Selecciona un producto</option>
                      {getOptionsByType(formData.productType).map((option) => {
                        const optionId = asId(option)
                        return (
                          <option key={optionId} value={optionId}>
                            {getProductLabel(option)} - Q{asPrice(option).toFixed(2)}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  <div className="space-y-1 text-sm">
                    <input
                      required
                      type="number"
                      min="1"
                      aria-label="Cantidad"
                      value={formData.candidadproducto}
                      onChange={(e) => setFormData((prev) => ({ ...prev, candidadproducto: e.target.value }))}
                      className="w-full rounded-xl border border-[#6b7280]/30 bg-white px-3 py-2"
                    />
                  </div>

                  <div className="space-y-1 text-sm">
                    <span>Total estimado</span>
                    <div className="w-full rounded-xl border border-[#6b7280]/20 bg-[#f8fafc] px-3 py-2 font-semibold text-[#1f2937]">
                      Q{(
                        getItemUnitPrice(formData.productType, formData.producto) * Number(formData.candidadproducto || 0)
                      ).toFixed(2)}
                    </div>
                  </div>
                </>
              )}

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-[#6b7280]/30 px-4 py-2 font-semibold hover:bg-[#f8fafc]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#6b7280] px-5 py-2 font-bold text-[#f8fafc] hover:bg-[#9ca3af]"
                >
                  {editingId ? 'Guardar cambios' : 'Crear detalles'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DetallePedidosPage
