const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, loading, restaurantName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#111111] rounded-2xl shadow-2xl max-w-md w-full border border-[#6b7280]/50 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#f8fafc]">Eliminar Restaurante</h2>
        </div>

        {/* Body */}
        <div className="mb-8 text-center">
          <p className="text-[#9ca3af] mb-2">¿Estás seguro de que deseas eliminar?</p>
          {restaurantName && (
            <p className="text-[#f8fafc] font-semibold text-lg">{restaurantName}</p>
          )}
          <p className="text-[#6b7280] text-sm mt-4">Esta acción no se puede deshacer</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-[#1f2937]/50 hover:bg-[#1f2937]/70 text-[#f8fafc] rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? ' Eliminando...' : ' Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
