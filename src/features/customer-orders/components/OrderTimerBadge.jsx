import { useEffect, useState, useMemo, useRef } from 'react'
import useDetallePedidoStore from '../../detallepedido/store/useDetallePedidoStore'
import useOrderStore from '../../orders/store/useOrderStore'
import notificationService from '../../../shared/api/services/notificationService'

const MAX_MINUTES = 30

const resolveCreatedAt = (value) => {
  if (!value) return null
  const parsed = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export default function OrderTimerBadge({ orderId, createdAt, status }) {
  const { fetchDetallePedidosByOrder } = useDetallePedidoStore()
  const { updateOrderStatus } = useOrderStore()
  const [details, setDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => Date.now())
  const hasUpdatedRef = useRef(false)
  const createdAtDate = useMemo(() => resolveCreatedAt(createdAt), [createdAt])
  const normalizedStatus = String(status || '').toLowerCase()
  const isCompleted = ['completada', 'completado', 'entregada', 'entregado'].includes(normalizedStatus)

  // Cargar detalles de la orden
  useEffect(() => {
    const loadDetails = async () => {
      try {
        const result = await fetchDetallePedidosByOrder(orderId)
        if (result?.success) {
          setDetails(Array.isArray(result.data) ? result.data : [])
        }
      } catch (error) {
        console.error('Error loading order details:', error)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      loadDetails()
    }
  }, [orderId, fetchDetallePedidosByOrder])

  // Calcular tiempo estimado basado en los ítems
  const estimatedMinutes = useMemo(() => {
    if (loading) return 30 // default mientras carga

    const totalItems = details.length

    // Solo bebidas: 10 minutos
    const allBeverages = details.every((d) => d?.productType === 'beverage')
    if (allBeverages && totalItems > 0) return 10

    // Más de 6 ítems: 45 minutos
    if (totalItems > 6) return 45

    // Default: 30 minutos
    return 30
  }, [details, loading])

  // Timer basado en la fecha real de creación de la orden
  useEffect(() => {
    if (!createdAtDate || isCompleted) {
      return undefined
    }

    const isExpiredNow = Date.now() - createdAtDate.getTime() >= MAX_MINUTES * 60 * 1000
    if (isExpiredNow) {
      setNow(Date.now())
      return undefined
    }

    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [createdAtDate, isCompleted])

  // Actualizar estado de la orden cuando ya pasaron 30 minutos
  useEffect(() => {
    if (!createdAtDate || isCompleted) return

    const elapsedMs = now - createdAtDate.getTime()
    const isExpired = elapsedMs >= MAX_MINUTES * 60 * 1000

    if (isExpired && !hasUpdatedRef.current) {
      hasUpdatedRef.current = true

      const updateStatus = async () => {
        try {
          // Actualizar orden con estado compatible con el resto del flujo
          const res = await updateOrderStatus(orderId, 'entregado')

          // Si la actualización fue exitosa, crear una notificación para el usuario de la orden
          if (res?.success) {
            try {
              const fetched = await useOrderStore.getState().fetchOrderById(orderId)
              const order = fetched?.data || null
              const userId = order?.User_id?._id || order?.User_id || null
              const orderNumber = order?.Orders_number || order?.Orders_number || order?._id || orderId

              if (userId) {
                await notificationService.createNotification({
                  userId,
                  type: 'order',
                  title: 'Tu orden está lista',
                  message: `Tu orden ${orderNumber} ha sido marcada como completada.`,
                  data: { orderId },
                })
              }
            } catch (nerr) {
              console.error('Error creating notification after order update:', nerr)
            }
          }
        } catch (error) {
          console.error('Error updating order status:', error)
        }
      }

      updateStatus()
    }
  }, [createdAtDate, isCompleted, now, orderId, updateOrderStatus])

  const totalSeconds = MAX_MINUTES * 60
  const elapsedSeconds = createdAtDate ? Math.max(0, Math.floor((now - createdAtDate.getTime()) / 1000)) : 0
  const clampedElapsedSeconds = Math.min(elapsedSeconds, totalSeconds)
  const percentage = (clampedElapsedSeconds / totalSeconds) * 100
  const remainingSeconds = Math.max(0, totalSeconds - clampedElapsedSeconds)
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  const getColor = () => {
    // Always use white tones for the timer fill as requested
    return '#ffffff'
  }

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-white">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
        <span className="text-white">{estimatedMinutes} min</span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${percentage}%`,
            backgroundColor: getColor(),
          }}
        />
      </div>

      {/* Indicador de estado */}
      <div className="text-[10px] text-black text-center font-semibold">
        {createdAtDate && !isCompleted && percentage < 100 ? 'Preparando' : 'Completada'}
      </div>
    </div>
  )
}
