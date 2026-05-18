import { useEffect, useState, useMemo, useRef } from 'react'
import useDetallePedidoStore from '../../detallepedido/store/useDetallePedidoStore'
import useOrderStore from '../../orders/store/useOrderStore'

export default function OrderTimerBadge({ orderId }) {
  const { fetchDetallePedidosByOrder } = useDetallePedidoStore()
  const { updateOrderStatus } = useOrderStore()
  const [details, setDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const hasUpdatedRef = useRef(false)

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

  // Timer que se incrementa cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1
        // Resetear si pasó el tiempo estimado
        if (next >= estimatedMinutes * 60) {
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [estimatedMinutes])

  // Actualizar estado de la orden cuando se completa el timer
  useEffect(() => {
    const totalSeconds = estimatedMinutes * 60
    const percentage = (elapsed / totalSeconds) * 100

    if (percentage >= 100 && !hasUpdatedRef.current) {
      hasUpdatedRef.current = true
      
      const updateStatus = async () => {
        try {
          // Actualizar orden con estado "listo"
          await updateOrderStatus(orderId, 'listo')
        } catch (error) {
          console.error('Error updating order status:', error)
          hasUpdatedRef.current = false
        }
      }

      updateStatus()
    }
  }, [elapsed, estimatedMinutes, orderId, updateOrderStatus])

  const totalSeconds = estimatedMinutes * 60
  const percentage = (elapsed / totalSeconds) * 100
  const remainingSeconds = totalSeconds - elapsed
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  const getColor = () => {
    if (percentage < 33) return '#7F532C' // Marrón
    if (percentage < 66) return '#F5A623' // Naranja
    return '#E74C3C' // Rojo
  }

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[#5B300E]">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
        <span className="text-[#7F532C]">{estimatedMinutes} min</span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full h-3 rounded-full bg-[#FCF0CA]/30 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${percentage}%`,
            backgroundColor: getColor(),
          }}
        />
      </div>

      {/* Indicador de estado */}
      <div className="text-[10px] text-[#946841] text-center">
        {percentage < 100 ? 'Preparando' : 'Listo'}
      </div>
    </div>
  )
}
