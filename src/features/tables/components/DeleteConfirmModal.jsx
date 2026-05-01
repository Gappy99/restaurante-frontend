/**
 * Modal de confirmación para eliminar mesa
 */
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, loading, tableName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#2E160C] rounded-2xl shadow-2xl max-w-md w-full border border-[#7F532C]/50 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#FCF0CA]">Eliminar Mesa</h2>
        </div>

        {/* Body */}
        <div className="mb-8 text-center">
          <p className="text-[#946841] mb-2">¿Estás seguro de que deseas eliminar esta mesa?</p>
          {tableName && (
            <p className="text-[#FCF0CA] font-semibold text-lg">{tableName}</p>
          )}
          <p className="text-[#7F532C] text-sm mt-4">Esta acción no se puede deshacer</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-[#5B300E]/50 hover:bg-[#5B300E]/70 text-[#FCF0CA] rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? '⏳ Eliminando...' : '🗑️ Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
