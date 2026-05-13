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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
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