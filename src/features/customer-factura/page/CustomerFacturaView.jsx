import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useOrderStore from '../../orders/store/useOrderStore'
import { getDetallePedidosByOrderService } from '../../detallepedido/services/DetallePedidoService'
import { getDishByIdService } from '../../dishes/services/DishService'
import { getBeverageByIdService } from '../../beverages/services/BeverageService'

const asId = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value?._id || value?.id || value?.Orders_id || ''
}

const formatDateTime = (value) => {
  if (!value) return 'Sin fecha'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return date.toLocaleString('es-ES')
}

const extractDetalleList = (resp) => {
  if (!resp) return []
  if (Array.isArray(resp)) return resp
  if (Array.isArray(resp?.data)) return resp.data
  if (Array.isArray(resp?.detallePedidos)) return resp.detallePedidos
  return []
}

const getInvoiceStatusLabel = (status) => {
  const normalized = String(status || 'pendiente').toLowerCase()
  if (normalized === 'pagada') return 'Pagada'
  if (normalized === 'cancelada') return 'Cancelada'
  if (normalized === 'emitida') return 'Emitida'
  return 'Pendiente'
}

const getInvoiceStatusClass = (status) => {
  const normalized = String(status || 'pendiente').toLowerCase()
  if (normalized === 'pagada') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
  if (normalized === 'cancelada') return 'border-rose-500/30 bg-rose-500/10 text-rose-200'
  if (normalized === 'emitida') return 'border-sky-500/30 bg-sky-500/10 text-sky-200'
  return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-200'
}

const CustomerFacturaView = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { orders, loading, error, fetchOrders } = useOrderStore()

  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [detailItems, setDetailItems] = useState([])
  const [detailError, setDetailError] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const orderList = useMemo(() => (Array.isArray(orders) ? [...orders] : []), [orders])
  const sortedOrders = useMemo(() => {
    return [...orderList].sort((a, b) => {
      const aTime = new Date(a?.createdAt || a?.created_at || a?.fecha || 0).getTime()
      const bTime = new Date(b?.createdAt || b?.created_at || b?.fecha || 0).getTime()
      return bTime - aTime
    })
  }, [orderList])

  useEffect(() => {
    const queryOrderId = searchParams.get('orderId') || ''
    if (queryOrderId && queryOrderId !== selectedOrderId) {
      setSelectedOrderId(queryOrderId)
      return
    }

    if (!selectedOrderId && sortedOrders.length > 0) {
      setSelectedOrderId(asId(sortedOrders[0]))
    }
  }, [searchParams, selectedOrderId, sortedOrders])

  const selectedOrder = useMemo(
    () => sortedOrders.find((order) => asId(order) === selectedOrderId) || null,
    [selectedOrderId, sortedOrders]
  )

  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedOrderId) {
        setDetailItems([])
        return
      }

      setLoadingDetails(true)
      setDetailError('')

      try {
        const result = await getDetallePedidosByOrderService(selectedOrderId)
        const detalles = extractDetalleList(result)

        const items = await Promise.all(
          detalles.map(async (detail) => {
            const qty = Number(detail?.candidadproducto || detail?.quantity || 1)
            const productType = String(detail?.productType || detail?.tipo || 'dish').toLowerCase()
            const productId = detail?.producto

            let product = null
            if (productId && typeof productId === 'object') {
              product = productId
            } else if (productId) {
              try {
                const response = productType === 'beverage'
                  ? await getBeverageByIdService(productId)
                  : await getDishByIdService(productId)
                product = response?.data || response || null
              } catch {
                product = null
              }
            }

            const unitPrice = Number(product?.Menu_Price ?? product?.price ?? 0)
            const name = product?.Menu_Plate || product?.Menu_Drink || product?.name || String(productId || 'Producto')

            return {
              name,
              qty,
              unitPrice,
              subtotal: unitPrice * qty,
              type: productType,
            }
          })
        )

        setDetailItems(items)
      } catch (err) {
        setDetailItems([])
        setDetailError(err?.response?.data?.message || 'No se pudo cargar el detalle de la factura')
      } finally {
        setLoadingDetails(false)
      }
    }

    loadDetails()
  }, [selectedOrderId])

  const subtotal = useMemo(() => {
    if (typeof selectedOrder?.subtotal === 'number') return selectedOrder.subtotal
    return detailItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0)
  }, [detailItems, selectedOrder?.subtotal])

  const tax = useMemo(() => {
    if (typeof selectedOrder?.tax === 'number') return selectedOrder.tax
    return Number(selectedOrder?.tax || selectedOrder?.iva || 0)
  }, [selectedOrder?.tax, selectedOrder?.iva])

  const discount = useMemo(() => {
    if (typeof selectedOrder?.discount === 'number') return selectedOrder.discount
    return Number(selectedOrder?.discount || 0)
  }, [selectedOrder?.discount])

  const total = useMemo(() => {
    if (typeof selectedOrder?.total === 'number') return selectedOrder.total
    return Math.max(0, subtotal + tax - discount)
  }, [discount, selectedOrder?.total, subtotal, tax])

  const invoiceNumber = useMemo(() => {
    return (
      selectedOrder?.invoice_number ||
      selectedOrder?.invoice?.invoice_number ||
      selectedOrder?.Invoice_number ||
      `FAC-${asId(selectedOrder).slice(-6).toUpperCase() || 'TEMP'}`
    )
  }, [selectedOrder])

  const invoiceStatus = useMemo(() => {
    const orderStatus = String(selectedOrder?.Orders_status || '').toLowerCase()
    return (
      selectedOrder?.status ||
      selectedOrder?.invoice?.status ||
      (orderStatus === 'entregado' || orderStatus === 'completada' ? 'emitida' : 'pendiente')
    )
  }, [selectedOrder])

  const handleSelectOrder = (value) => {
    setSelectedOrderId(value)
    setSearchParams(value ? { orderId: value } : {})
  }

  return (
    <div className="min-h-full bg-[#111113] text-zinc-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-zinc-800 bg-[#17171b] p-6 md:p-10 shadow-2xl shadow-black/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-500">Panel de cliente</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white">
              Factura
            </h1>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-zinc-300 leading-relaxed">
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/customer/orders')}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-200 hover:bg-zinc-800 transition"
          >
            Ver órdenes
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-black/20 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Orden seleccionada</p>
            <p className="mt-1 text-sm text-zinc-300">
              {selectedOrder ? `#${selectedOrder?.Orders_number || '---'} · ${formatDateTime(selectedOrder?.createdAt || selectedOrder?.created_at || selectedOrder?.fecha)}` : 'No hay orden seleccionada'}
            </p>
          </div>

          <div className="w-full md:w-96">
            <select
              value={selectedOrderId}
              onChange={(e) => handleSelectOrder(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-[#111113] px-4 py-3 text-sm text-white outline-none focus:border-zinc-500"
            >
              <option value="">Selecciona una orden</option>
              {sortedOrders.map((order) => {
                const id = asId(order)
                return (
                  <option key={id} value={id}>
                    #{order?.Orders_number || '---'} · {formatDateTime(order?.createdAt || order?.created_at || order?.fecha)}
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black/30 p-6 text-sm text-zinc-400">
            Cargando órdenes del cliente...
          </div>
        )}

        {!loading && !selectedOrder && (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-700 bg-black/30 p-6 md:p-8">
            <h2 className="text-lg font-bold text-zinc-100 uppercase tracking-wide">Sin factura aún</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Aún no hay órdenes disponibles para calcular la factura.
            </p>
          </div>
        )}

        {selectedOrder && (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-2xl border border-zinc-800 bg-[#111113] p-5 md:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Invoice</p>
                  <h2 className="mt-1 text-2xl font-extrabold uppercase tracking-tight text-white">
                    {invoiceNumber}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Orden #{selectedOrder?.Orders_number || '---'}
                  </p>
                </div>

                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${getInvoiceStatusClass(invoiceStatus)}`}>
                  {getInvoiceStatusLabel(invoiceStatus)}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Descripción</p>
                  <p className="mt-1 text-sm text-zinc-200 font-semibold">
                    {selectedOrder?.invoice_description || `Factura de la orden #${selectedOrder?.Orders_number || '---'}`}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Fecha de creación</p>
                  <p className="mt-1 text-sm text-zinc-200 font-semibold">
                    {formatDateTime(selectedOrder?.createdAt || selectedOrder?.created_at || selectedOrder?.fecha)}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">ID orden</p>
                  <p className="mt-1 text-sm text-zinc-200 font-semibold break-all">
                    {asId(selectedOrder)}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Cliente</p>
                  <p className="mt-1 text-sm text-zinc-200 font-semibold">
                    {selectedOrder?.User_id?.nombre || selectedOrder?.user?.nombre || selectedOrder?.user_name || 'Cliente actual'}
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800">
                <div className="border-b border-zinc-800 bg-black/30 px-4 py-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100">Productos facturados</h3>
                </div>

                {loadingDetails ? (
                  <div className="px-4 py-6 text-sm text-zinc-400">Cargando detalle de la orden...</div>
                ) : detailItems.length > 0 ? (
                  <div className="divide-y divide-zinc-800">
                    {detailItems.map((item, index) => (
                      <div key={`${item.name}-${index}`} className="grid grid-cols-[1fr_auto_auto] gap-3 px-4 py-3 text-sm">
                        <span className="text-zinc-200 font-semibold truncate">{item.name}</span>
                        <span className="text-zinc-400 font-mono">x{item.qty}</span>
                        <span className="text-zinc-100 font-mono">Q{Number(item.subtotal || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-sm text-zinc-400">
                    No se encontraron productos para esta orden.
                  </div>
                )}
              </div>
            </section>

            <aside className="rounded-2xl border border-zinc-800 bg-[#111113] p-5 md:p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100">Resumen de factura</h3>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black/20 px-4 py-3 text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="font-mono text-zinc-100">Q{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black/20 px-4 py-3 text-sm">
                  <span className="text-zinc-400">Impuesto</span>
                  <span className="font-mono text-zinc-100">Q{tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black/20 px-4 py-3 text-sm">
                  <span className="text-zinc-400">Descuento</span>
                  <span className="font-mono text-zinc-100">Q{discount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-white px-4 py-4 text-base">
                  <span className="font-bold uppercase tracking-wider text-black">Total</span>
                  <span className="font-mono text-lg font-bold text-black">Q{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-zinc-800 bg-black/20 p-4 text-sm text-zinc-300">
                <p className="font-bold text-zinc-100 uppercase tracking-wide">Estado de la factura</p>
                <p className="mt-2 leading-relaxed">
                  {selectedOrder?.invoice?.estado === false
                    ? 'La factura está desactivada.'
                    : 'Factura emitada para la orden seleccionada. Aquí puedes revisar el detalle de los productos consumidos, así como el resumen de cargos e impuestos aplicados. Si tienes alguna duda sobre tu factura, no dudes en contactarnos.'}
                </p>
              </div>
            </aside>
          </div>
        )}

        {(error || detailError) && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-medium text-red-400">
            ⚠ {error || detailError}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerFacturaView
