import PropTypes from 'prop-types'

const CouponCard = ({ coupon, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const getDiscountDisplay = () => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`
    }
    return `$${coupon.discount_value}`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{coupon.code}</h3>
          <p className="text-sm text-gray-600">{coupon.description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(coupon)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(coupon._id || coupon.id)}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Desactivar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Tipo:</span>
          <span className="ml-2">{coupon.discount_type === 'percentage' ? 'Porcentaje' : 'Monto fijo'}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Valor:</span>
          <span className="ml-2 text-green-600 font-semibold">{getDiscountDisplay()}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Expiración:</span>
          <span className="ml-2">{formatDate(coupon.expiration_date)}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Usos máximos:</span>
          <span className="ml-2">{coupon.max_uses || 'Ilimitado'}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Usos actuales:</span>
          <span className="ml-2">{coupon.current_uses || 0}</span>
        </div>
      </div>

      <div className="mt-4">
        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
          coupon.active
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {coupon.active ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    </div>
  )
}

CouponCard.propTypes = {
  coupon: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default CouponCard