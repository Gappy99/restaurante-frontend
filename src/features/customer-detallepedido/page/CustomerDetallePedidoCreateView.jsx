import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import useDetallePedidoStore from '../../detallepedido/store/useDetallePedidoStore'
import useDishStore from '../../dishes/store/useDishStore'
import useBeverageStore from '../../beverages/store/useBeverageStore'
import useOrderStore from '../../orders/store/useOrderStore'

const createEmptyItem = () => ({
  producto: '',
  productType: 'dish',
  candidadproducto: 1,
})

const emptyDetail = {
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

export default function CustomerDetallePedidoCreateView() {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const { saveDetallePedido } = useDetallePedidoStore()
  const { removeOrder } = useOrderStore()
  const { dishes, fetchDishesByRestaurant } = useDishStore()
  const { beverages, fetchBeveragesByRestaurant } = useBeverageStore()

  const [formData, setFormData] = useState(emptyDetail)
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cargar datos de la orden al montar
  useEffect(() => {
    const loadOrderData = async () => {
      try {
        // Aquí irías a buscar la orden por ID desde el backend
        // Por ahora asumimos que viene en sessionStorage o localStorage
        const stored = sessionStorage.getItem(`order:${orderId}`)
        if (stored) {
          const orderInfo = JSON.parse(stored)
          setOrderData(orderInfo)
          
          // Cargar platos y bebidas del restaurante
          if (orderInfo.restaurant_id) {
            await Promise.all([
              fetchDishesByRestaurant(orderInfo.restaurant_id),
              fetchBeveragesByRestaurant(orderInfo.restaurant_id),
            ])
          }
        }
      } catch (error) {
        console.error('Error loading order data:', error)
        toast.error('No se pudo cargar la información de la orden')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      loadOrderData()
    }
  }, [orderId, fetchDishesByRestaurant, fetchBeveragesByRestaurant])

  const dishOptions = useMemo(() => (Array.isArray(dishes) ? dishes : []), [dishes])
  const beverageOptions = useMemo(() => (Array.isArray(beverages) ? beverages : []), [beverages])

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

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!orderId || !orderData?.restaurant_id) {
      toast.error('Información de orden incompleta')
      return
    }

    const normalizeQuantity = (value) => Math.max(1, Number(value) || 1)

    const items = (Array.isArray(formData.items) ? formData.items : [])
      .map((item) => ({
        producto: String(item?.producto || '').trim(),
        productType: item?.productType === 'beverage' ? 'beverage' : 'dish',
        candidadproducto: normalizeQuantity(item?.candidadproducto),
      }))
      .filter((item) => item.producto)

    if (!items.length) {
      toast.error('Debes agregar al menos un producto')
      return
    }

    const payload = {
      orders_id: String(orderId),
      items,
    }

    const result = await saveDetallePedido(payload, null)
    if (result?.success) {
      toast.success('Pedido completado con éxito')
      sessionStorage.removeItem(`order:${orderId}`)
      navigate('/customer/orders')
    }
  }

  const handleCancel = async () => {
    const confirmed = window.confirm(
      '¿Estás seguro que deseas cancelar? Se eliminará la orden creada.'
    )
    if (!confirmed) return

    try {
      await removeOrder(orderId)
      toast.success('Orden cancelada y eliminada')
      sessionStorage.removeItem(`order:${orderId}`)
      navigate('/customer/orders')
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error('Error al cancelar la orden')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] text-[#f8fafc] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg">Cargando información de la orden...</p>
        </div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#111111] text-[#f8fafc] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg">No se encontró información de la orden</p>
          <button
            onClick={() => navigate('/customer/orders')}
            className="mt-4 rounded-xl bg-[#6b7280] px-5 py-2 font-bold text-[#f8fafc] hover:bg-[#9ca3af]"
          >
            Volver a órdenes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111111] text-[#f8fafc] p-4 md:p-8">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#6b7280]/30 bg-[#1f2937]/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="flex flex-col gap-3 border-b border-[#f8fafc]/10 pb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9ca3af]">Detalles del Pedido</p>
          <h1 className="text-3xl md:text-5xl font-black uppercase italic bg-gradient-to-r from-[#f8fafc] via-[#9ca3af] to-[#6b7280] bg-clip-text text-transparent">
            Completar pedido
          </h1>
          <p className="text-sm text-[#d1d5db]/80">
            Agrega los productos que deseas incluir en tu orden.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-4">
          <div className="md:col-span-2 rounded-xl border border-[#6b7280]/20 bg-[#6b7280]/10 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#f8fafc]/70">Información de la orden</p>
            <p className="mt-1 text-sm font-bold text-[#f8fafc]">Orden ID: {orderId}</p>
            <p className="mt-1 text-xs text-[#d1d5db]/80">Los productos se cargarán automáticamente del restaurante.</p>
          </div>

          <div className="rounded-xl border border-[#6b7280]/20 bg-[#6b7280]/10 px-4 py-3 text-sm text-[#1f2937]">
            El precio unitario se toma automáticamente del producto seleccionado (dish o beverage).
          </div>

          <div className="space-y-3">
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

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-red-500/50 px-4 py-2 font-semibold text-red-200 hover:bg-red-500/20"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#6b7280] px-5 py-2 font-bold text-[#f8fafc] hover:bg-[#9ca3af]"
            >
              Guardar pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
