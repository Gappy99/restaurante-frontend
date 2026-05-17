import PropTypes from 'prop-types'
import CouponForm from './CouponForm'

const CouponModal = ({ isOpen, onClose, coupon, restaurants = [], onSuccess, loading }) => {
  const handleFormSubmit = async (formData) => {
    const result = await onSuccess(formData)
    if (result?.success) {
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6">
      <div className="absolute inset-0 bg-[#2E160C]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl">
        {/* Backdrop */}
        {/* Modal */}
        <div className="relative overflow-hidden rounded-[32px] border border-[#FCF0CA] bg-white shadow-2xl shadow-black/30">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-[#5B300E]">
                {coupon ? 'Editar cupón' : 'Crear nuevo cupón'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <CouponForm
              coupon={coupon}
              restaurants={restaurants}
              onSubmit={handleFormSubmit}
              onCancel={onClose}
              loading={loading}
            />
          </div>
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