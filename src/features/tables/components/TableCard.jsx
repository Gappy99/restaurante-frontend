/**
 * TableCard
 * Componente de tarjeta para una mesa individual
 */

import {
	getTableRestaurantLabel,
	getTableStateLabel,
	getTableStatusLabel,
} from '../utils/tableUtils.js'

/* eslint-disable react/prop-types */
const TableCard = ({ table, onEdit, onDelete }) => {
	const handleDelete = async () => {
		// Delegar la confirmación al padre (modal)
		await onDelete(table._id || table.id)
	}

	return (
		<div className="table-card">
			<div className="table-content">
				<h3>{table.table_name}</h3>

				<div className="table-info">
					<span className="status">{getTableStatusLabel(table.estado)}</span>
					<span className="state">{getTableStateLabel(table.table_state)}</span>
				</div>

				<div className="table-details">
					<p>
						<strong>🔢 Número:</strong> {table.table_number}
					</p>
					<p>
						<strong>📍 Ubicación:</strong> {table.table_ubication}
					</p>
					<p>
						<strong>👥 Capacidad:</strong> {table.table_capacity}
					</p>
					<p>
						<strong>🕒 Horario:</strong> {table.table_time_available || 'Sin horario'}
					</p>
					<p>
						<strong>🏪 Restaurante:</strong> {getTableRestaurantLabel(table)}
					</p>
				</div>

				{table.disponibilidad && (
					<p className="table-availability">
						<strong>Disponibilidad:</strong> {table.disponibilidad}
					</p>
				)}
			</div>

			<div className="card-actions">
				<button
					onClick={() => onEdit(table)}
					className="btn btn-edit"
					title="Editar mesa"
				>
					✏️ Editar
				</button>
				<button
					onClick={handleDelete}
					className="btn btn-delete"
					title="Eliminar mesa"
				>
					🗑️ Eliminar
				</button>
			</div>
		</div>
	)
}

export default TableCard
