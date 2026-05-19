import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import useOrderStore from '../../orders/store/useOrderStore'
import { getDetallePedidosByOrderService } from '../../detallepedido/services/DetallePedidoService'
import { getDishByIdService } from '../../dishes/services/DishService'
import { getBeverageByIdService } from '../../beverages/services/BeverageService'
import {
  asId,
  extractDetalleList,
  formatDateTime,
  getInvoiceStatusClass,
  getInvoiceStatusLabel,
} from '../utils/invoiceHelpers'

const CustomerFacturaPrintView = () => {
  const [searchParams] = useSearchParams()
  const { orders, loading, error, fetchOrders } = useOrderStore()
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [detailItems, setDetailItems] = useState([])
  const [detailError, setDetailError] = useState('')
  const [hasPrinted, setHasPrinted] = useState(false)

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

  useEffect(() => {
    if (!loading && selectedOrder && !loadingDetails && !hasPrinted) {
      setHasPrinted(true)
      const timer = window.setTimeout(() => {
        window.print()
      }, 500)

      return () => window.clearTimeout(timer)
    }

    return undefined
  }, [hasPrinted, loading, loadingDetails, selectedOrder])

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#111111] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-300 bg-white p-6 md:p-10 shadow-2xl shadow-black/10">
        <style>{`
          @media print {
            @page {
              size: auto;
              margin: 10mm; /* Reduce o aumenta el margen del papel si lo necesitas */
            }

            /* 1. Ocultamos absolutamente todo el contenido del body */
            body * {
              visibility: hidden;
            }

            /* 2. Hacemos visible únicamente la tarjeta de la factura y su contenido */
            .print-card,
            .print-card * {
              visibility: visible;
            }

            /* 3. Colocamos la factura al inicio de la página impresa eliminando contenedores fantasma */
            .print-card {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
              background: #ffffff !important;
            }

            /* 4. Forzamos al navegador a pintar los fondos de color de los recuadros internos (como bg-zinc-50) */
            html, body {
              background: #ffffff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            /* 5. Aseguramos que elementos interactivos de la propia factura no se impriman */
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        <div className="invoice-print-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between no-print">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-500">Vista de impresión</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-zinc-900">
                Factura
              </h1>
              <p className="mt-2 max-w-2xl text-sm md:text-base text-zinc-600 leading-relaxed">
                Esta vista está preparada para impresión en formato limpio y normal.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2 text-xs font-bold tracking-widest text-zinc-900 hover:bg-white transition"
              >
                Imprimir
              </button>
            </div>
          </div>

          <div className="mt-6 print-card rounded-3xl border border-zinc-300 bg-white p-6 md:p-8">
            {loading && (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600">
                Cargando órdenes del cliente...
              </div>
            )}

            {!loading && !selectedOrder && (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 md:p-8 text-zinc-700">
                <h2 className="text-lg font-bold uppercase tracking-wide">Sin factura aún</h2>
                <p className="mt-2 text-sm text-zinc-500">
                  Aún no hay órdenes disponibles para imprimir.
                </p>
              </div>
            )}

            {selectedOrder && (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between border-b border-zinc-200 pb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Invoice</p>
                    <h2 className="mt-1 text-2xl font-extrabold uppercase tracking-tight text-zinc-900">
                      {invoiceNumber}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600">Orden #{selectedOrder?.Orders_number || '---'}</p>
                  </div>

                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${getInvoiceStatusClass(invoiceStatus)}`}>
                    {getInvoiceStatusLabel(invoiceStatus)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Descripción</p>
                    <p className="mt-1 text-sm text-zinc-800 font-semibold">
                      {selectedOrder?.invoice_description || `Factura de la orden #${selectedOrder?.Orders_number || '---'}`}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Fecha de creación</p>
                    <p className="mt-1 text-sm text-zinc-800 font-semibold">
                      {formatDateTime(selectedOrder?.createdAt || selectedOrder?.created_at || selectedOrder?.fecha)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">ID orden</p>
                    <p className="mt-1 text-sm text-zinc-800 font-semibold break-all">{asId(selectedOrder)}</p>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Cliente</p>
                    <p className="mt-1 text-sm text-zinc-800 font-semibold">
                      {selectedOrder?.User_id?.nombre || selectedOrder?.user?.nombre || selectedOrder?.user_name || 'Cliente actual'}
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-zinc-200">
                  <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Productos facturados</h3>
                  </div>

                  {loadingDetails ? (
                    <div className="px-4 py-6 text-sm text-zinc-600">Cargando detalle de la orden...</div>
                  ) : detailItems.length > 0 ? (
                    <div className="divide-y divide-zinc-200">
                      {detailItems.map((item, index) => (
                        <div key={`${item.name}-${index}`} className="grid grid-cols-[1fr_auto_auto] gap-3 px-4 py-3 text-sm">
                          <span className="text-zinc-800 font-semibold truncate">{item.name}</span>
                          <span className="text-zinc-500 font-mono">x{item.qty}</span>
                          <span className="text-zinc-900 font-mono">Q{Number(item.subtotal || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-sm text-zinc-600">
                      No se encontraron productos para esta orden.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_0.75fr]">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                    <p className="font-bold text-zinc-900 uppercase tracking-wide">Estado de la factura</p>
                    <p className="mt-2 leading-relaxed">
                      {selectedOrder?.invoice?.estado === false
                        ? 'La factura está desactivada.'
                        : 'Factura emitida para la orden seleccionada.'}
                    </p>
                  </div>

                  <aside className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Resumen</h3>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                        <span className="text-zinc-600">Subtotal</span>
                        <span className="font-mono text-zinc-900">Q{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                        <span className="text-zinc-600">Impuesto</span>
                        <span className="font-mono text-zinc-900">Q{tax.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                        <span className="text-zinc-600">Descuento</span>
                        <span className="font-mono text-zinc-900">Q{discount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-base">
                        <span className="font-bold uppercase tracking-wider text-zinc-900">Total</span>
                        <span className="font-mono text-lg font-bold text-zinc-900">Q{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            )}

            {(error || detailError) && (
              <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-medium text-red-500 no-print">
                ⚠ {error || detailError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerFacturaPrintView