import PropTypes from 'prop-types'
import CouponForm from './CouponForm'

const CouponModal = ({ isOpen, onClose, coupon, restaurants, onSuccess, loading }) => {
  if (!isOpen) return null

  const handleSubmit = async (formData) => {
    const result = coupon
      ? await onSuccess(coupon._id || coupon.id, formData)
      : await onSuccess(formData)

    if (result?.success) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2E160C]/65 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-[#FCF0CA] bg-white shadow-[0_30px_80px_rgba(46,22,12,0.35)]">
        <div className="bg-gradient-to-r from-[#2E160C] via-[#5B300E] to-[#7F532C] p-6 text-[#FCF0CA]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FCF0CA]/75">Cupón</p>
          <h2 className="mt-2 text-2xl font-bold">
            {coupon ? 'Editar cupón' : 'Nuevo cupón'}
          </h2>
          <p className="mt-1 text-sm text-[#FCF0CA]/80">
            {coupon
              ? 'Ajusta la información y aplica cambios a este cupón.'
              : 'Crea un nuevo cupón y asígnalo a restaurante(s).'}
          </p>
        </div>

        <div className="p-6">
          <CouponForm
            coupon={coupon}
            restaurants={restaurants}
            onSubmit={handleSubmit}
            onCancel={onClose}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

CouponModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  coupon: PropTypes.object,
  restaurants: PropTypes.array,
  onSuccess: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

export default CouponModal