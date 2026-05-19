import PropTypes from 'prop-types'
import { FiCheckCircle, FiXCircle } from 'react-icons/fi'

const CouponCard = ({ coupon, onEdit, onDelete, restaurants = [], showActions = true }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const getDiscountDisplay = () => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`
    }
    return `$${coupon.discount_value}`
  }

  const restaurantLabel = () => {
    const refs = coupon.restaurant_ids || []
    const firstRef = Array.isArray(refs) ? refs[0] : refs

    if (!firstRef) return 'Sin restaurante'

    if (typeof firstRef === 'object' && firstRef !== null) {
      if (firstRef.restaurant_name || firstRef.name) {
        return firstRef.restaurant_name || firstRef.name
      }
      const objId = firstRef._id || firstRef.id
      if (objId && Array.isArray(restaurants)) {
        const found = restaurants.find(r => String(r._id || r.id) === String(objId))
        if (found) return found.restaurant_name || found.name
      }
    }

    if (typeof firstRef === 'string' && Array.isArray(restaurants)) {
      const found = restaurants.find(r => String(r._id || r.id) === String(firstRef))
      if (found) {
        return found.restaurant_name || found.name
      }
      return `Rest. ID: ${firstRef.substring(0, 8)}...`
    }

    return 'Restaurante'
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8D8B5] bg-white shadow-[0_8px_24px_rgba(46,22,12,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(46,22,12,0.15)]">
      <div className="border-b border-[#E8D8B5] bg-gradient-to-r from-[#111111] via-[#1f2937] to-[#6b7280] px-5 py-4 text-[#f8fafc]">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f8fafc]/75">Cupón</p>
        <h3 className="mt-2 text-2xl font-bold leading-tight tracking-[-0.02em] text-white truncate">{coupon.code}</h3>
        <p className="mt-1 text-sm leading-5 text-[#f8fafc]/85">{restaurantLabel()}</p>
      </div>

      <div className="flex-1 space-y-3 px-5 py-4">
        {coupon.description && (
          <p className="text-sm leading-6 text-[#1f2937]">{coupon.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#f8fafc]/60 px-3 py-2">
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#1f2937]">Tipo</div>
            <p className="mt-1 text-sm font-semibold text-[#111111]">
              {coupon.discount_type === 'percentage' ? '%' : '$'}
            </p>
          </div>
          <div className="rounded-xl bg-[#f8fafc]/60 px-3 py-2">
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#1f2937]">Valor</div>
            <p className="mt-1 text-sm font-semibold text-[#111111]">{getDiscountDisplay()}</p>
          </div>
          <div className="rounded-xl bg-[#f8fafc]/60 px-3 py-2">
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#1f2937]">Expira</div>
            <p className="mt-1 text-sm font-semibold text-[#111111]">{formatDate(coupon.expiration_date)}</p>
          </div>
          <div className="rounded-xl bg-[#f8fafc]/60 px-3 py-2">
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#1f2937]">Máx</div>
            <p className="mt-1 text-sm font-semibold text-[#111111]">{coupon.max_uses || '∞'}</p>
          </div>
        </div>

        {coupon.min_order_amount && (
          <div className="rounded-xl bg-[#E8D8B5]/50 px-3 py-2">
            <p className="text-xs text-[#1f2937]">Compra mínima: <span className="font-semibold">${coupon.min_order_amount.toLocaleString('es-ES')}</span></p>
          </div>
        )}
      </div>

      <div className="border-t border-[#E8D8B5] bg-[#f9fafb] px-5 py-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            coupon.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            {coupon.active ? <><FiCheckCircle className="inline mr-1" aria-hidden="true" />Activo</> : <><FiXCircle className="inline mr-1" aria-hidden="true" />Inactivo</>}
          </span>
          <span className="text-xs text-[#1f2937]">
            {coupon.current_uses || 0}/{coupon.max_uses || '∞'} usos
          </span>
        </div>
        
        {showActions && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(coupon)}
              className="flex-1 rounded-lg bg-[#1f2937] px-3 py-2 text-xs font-semibold text-[#f8fafc] transition hover:bg-[#111111]"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete(coupon._id || coupon.id)}
              className="flex-1 rounded-lg border border-[#1f2937] bg-white px-3 py-2 text-xs font-semibold text-[#1f2937] transition hover:bg-[#f8fafc]/20"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

CouponCard.propTypes = {
  coupon: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  restaurants: PropTypes.array,
  showActions: PropTypes.bool,
}

export default CouponCard