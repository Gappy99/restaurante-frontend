import {
	getTableRestaurantLabel,
	getTableStateLabel,
	getTableStatusLabel,
} from '../utils/tableUtils.js'
import { FiClock, FiEdit2, FiHash, FiMapPin, FiTrash2, FiUsers } from 'react-icons/fi'
import { RiStore2Line } from 'react-icons/ri'

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
						<strong><FiHash className="inline mr-1" aria-hidden="true" />Número:</strong> {table.table_number}
					</p>
					<p>
						<strong><FiMapPin className="inline mr-1" aria-hidden="true" />Ubicación:</strong> {table.table_ubication}
					</p>
					<p>
						<strong><FiUsers className="inline mr-1" aria-hidden="true" />Capacidad:</strong> {table.table_capacity}
					</p>
					<p>
						<strong><FiClock className="inline mr-1" aria-hidden="true" />Horario:</strong> {table.table_time_available || 'Sin horario'}
					</p>
					<p>
						<strong><RiStore2Line className="inline mr-1" aria-hidden="true" />Restaurante:</strong> {getTableRestaurantLabel(table)}
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
					<FiEdit2 className="inline mr-1" aria-hidden="true" /> Editar
				</button>
				<button
					onClick={handleDelete}
					className="btn btn-delete"
					title="Eliminar mesa"
				>
					<FiTrash2 className="inline mr-1" aria-hidden="true" /> Eliminar
				</button>
			</div>
		</div>
	)
}

export default TableCard
