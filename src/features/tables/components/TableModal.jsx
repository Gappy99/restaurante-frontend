import { useState } from 'react'
import { useTableForm } from '../hooks/useTables.js'
import { validateTableForm, formatTableData } from '../utils/tableUtils.js'
import { TABLE_MESSAGES, TABLE_STATES } from '../constants/tableConstants.js'
import toast from 'react-hot-toast'

/* eslint-disable react/prop-types */
const TableModal = ({
	isOpen,
	onClose,
	onSuccess,
	initialData = null,
	fixedRestaurantId = '',
}) => {
	const { handleCreate, handleUpdate, loading, error, clearError } = useTableForm()

	const [formData, setFormData] = useState({
		name: initialData?.table_name || '',
		number: initialData?.table_number ?? '',
		ubication: initialData?.table_ubication || '',
		capacity: initialData?.table_capacity ?? '',
		timeAvailable: initialData?.table_time_available || '',
		tableState: initialData?.table_state || 'Disponible',
		restaurantId:
			fixedRestaurantId ||
			initialData?.restaurant_id?._id ||
			initialData?.restaurant_id ||
			'',
		reservationId: initialData?.reserva_id?._id || initialData?.reserva_id || '',
		estado: initialData?.estado ?? true,
	})

	const [errors, setErrors] = useState({})

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))

		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: '',
			}))
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		clearError()

		const { isValid, errors: validationErrors } = validateTableForm(formData)

		if (!isValid) {
			setErrors(validationErrors)
			toast.error(TABLE_MESSAGES.VALIDATION_ERROR)
			return
		}

		try {
			const payload = formatTableData(formData)

			const result = initialData
				? await handleUpdate(initialData._id || initialData.id, payload)
				: await handleCreate(payload)

			if (result.success) {
				toast.success(
					initialData ? TABLE_MESSAGES.UPDATE_SUCCESS : TABLE_MESSAGES.CREATE_SUCCESS
				)
				onSuccess?.()
				onClose()
			} else {
				toast.error(
					result.error ||
						(initialData ? TABLE_MESSAGES.UPDATE_ERROR : TABLE_MESSAGES.CREATE_ERROR)
				)
			}
		} catch (err) {
			toast.error(
				err.message ||
					(initialData ? TABLE_MESSAGES.UPDATE_ERROR : TABLE_MESSAGES.CREATE_ERROR)
			)
		}
	}

	if (!isOpen) return null

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>{initialData ? 'Editar Mesa' : 'Crear Mesa'}</h2>
					<button className="btn-close" onClick={onClose} aria-label="Cerrar">
						✕
					</button>
				</div>

				{error && <div className="alert alert-error">{error}</div>}

				<form onSubmit={handleSubmit} className="restaurant-form">
					<div className="form-group">
						<label htmlFor="name">Nombre de la Mesa *</label>
						<input
							id="name"
							type="text"
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							placeholder="Ej: Mesa 1"
							className={errors.name ? 'input-error' : ''}
						/>
						{errors.name && <span className="error-message">{errors.name}</span>}
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="number">Número de Mesa *</label>
							<input
								id="number"
								type="number"
								name="number"
								value={formData.number}
								onChange={handleInputChange}
								min="1"
								placeholder="1"
								className={errors.number ? 'input-error' : ''}
							/>
							{errors.number && (
								<span className="error-message">{errors.number}</span>
							)}
						</div>

						<div className="form-group">
							<label htmlFor="capacity">Capacidad *</label>
							<input
								id="capacity"
								type="number"
								name="capacity"
								value={formData.capacity}
								onChange={handleInputChange}
								min="1"
								placeholder="4"
								className={errors.capacity ? 'input-error' : ''}
							/>
							{errors.capacity && (
								<span className="error-message">{errors.capacity}</span>
							)}
						</div>
					</div>

					<div className="form-group">
						<label htmlFor="ubication">Ubicación *</label>
						<input
							id="ubication"
							type="text"
							name="ubication"
							value={formData.ubication}
							onChange={handleInputChange}
							placeholder="Ej: Terraza, Patio, Interior"
							className={errors.ubication ? 'input-error' : ''}
						/>
						{errors.ubication && (
							<span className="error-message">{errors.ubication}</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="timeAvailable">Horario Disponible</label>
						<input
							id="timeAvailable"
							type="text"
							name="timeAvailable"
							value={formData.timeAvailable}
							onChange={handleInputChange}
							placeholder="Ej: 10:00 - 23:00"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="tableState">Estado de la Mesa</label>
						<select
							id="tableState"
							name="tableState"
							value={formData.tableState}
							onChange={handleInputChange}
						>
							{TABLE_STATES.map((state) => (
								<option key={state} value={state}>
									{state}
								</option>
							))}
						</select>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="restaurantId">ID del Restaurante *</label>
							<input
								id="restaurantId"
								type="text"
								name="restaurantId"
								value={formData.restaurantId}
								onChange={handleInputChange}
								placeholder="ObjectId del restaurante"
								readOnly={Boolean(fixedRestaurantId)}
								disabled={Boolean(fixedRestaurantId)}
								className={errors.restaurantId ? 'input-error' : ''}
							/>
							{fixedRestaurantId && (
								<p className="text-xs text-[#946841] mt-1">
									Esta mesa quedará asignada a este restaurante.
								</p>
							)}
							{errors.restaurantId && (
								<span className="error-message">{errors.restaurantId}</span>
							)}
						</div>

						<div className="form-group">
							<label htmlFor="reservationId">ID de Reserva</label>
							<input
								id="reservationId"
								type="text"
								name="reservationId"
								value={formData.reservationId}
								onChange={handleInputChange}
								placeholder="Opcional"
							/>
						</div>
					</div>

					<div className="modal-footer">
						<button
							type="button"
							onClick={onClose}
							className="btn btn-secondary"
							disabled={loading}
						>
							Cancelar
						</button>
						<button type="submit" className="btn btn-primary" disabled={loading}>
							{loading ? 'Guardando...' : 'Guardar'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default TableModal
