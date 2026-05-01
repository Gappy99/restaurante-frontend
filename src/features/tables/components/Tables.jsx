/**
 * Tables
 * Componente para mostrar la lista de mesas
 */

import TableCard from './TableCard.jsx'

/* eslint-disable react/prop-types */
const Tables = ({ tables, onEdit, onDelete, loading }) => {
	if (loading) {
		return (
			<div className="loading-container">
				<div className="spinner"></div>
				<p>Cargando mesas...</p>
			</div>
		)
	}

	if (!tables || tables.length === 0) {
		return (
			<div className="empty-state">
				<div className="empty-icon">🪑</div>
				<h3>No hay mesas registradas</h3>
				<p>Crea una nueva mesa para comenzar</p>
			</div>
		)
	}

	return (
		<div className="tables-container">
			<div className="list-header">
				<h2>Mesas ({tables.length})</h2>
			</div>

			<div className="cards-grid">
				{tables.map((table) => (
					<TableCard
						key={table._id || table.id}
						table={table}
						onEdit={onEdit}
						onDelete={onDelete}
					/>
				))}
			</div>
		</div>
	)
}

export default Tables
