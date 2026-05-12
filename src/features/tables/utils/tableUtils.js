/**
 * Utilidades del feature Tables
 */

import { TABLE_STATES } from '../constants/tableConstants.js'

const normalizeNumber = (value) => {
	if (value === '' || value === null || value === undefined) {
		return 0
	}

	const parsed = Number(value)
	return Number.isNaN(parsed) ? 0 : parsed
}

const resolveTableId = (table) => table?._id || table?.id

export const formatTableData = (formData) => ({
	table_name: formData.name?.trim() || '',
	table_number: normalizeNumber(formData.number),
	table_ubication: formData.ubication?.trim() || '',
	table_capacity: normalizeNumber(formData.capacity),
	table_time_available: formData.timeAvailable?.trim() || '',
	table_state: TABLE_STATES.includes(formData.tableState)
		? formData.tableState
		: 'Disponible',
	restaurant_id: formData.restaurantId || '',
	reserva_id: formData.reservationId || null,
	estado: formData.estado ?? true,
})

export const validateTableForm = (data) => {
	const errors = {}

	if (!data.name?.trim()) {
		errors.name = 'El nombre de la mesa es requerido'
	}

	if (data.number === '' || data.number === null || data.number === undefined) {
		errors.number = 'El número de la mesa es requerido'
	} else if (Number(data.number) <= 0) {
		errors.number = 'El número de la mesa debe ser mayor a 0'
	}

	if (!data.ubication?.trim()) {
		errors.ubication = 'La ubicación de la mesa es requerida'
	}

	if (data.capacity === '' || data.capacity === null || data.capacity === undefined) {
		errors.capacity = 'La capacidad de la mesa es requerida'
	} else if (Number(data.capacity) < 1) {
		errors.capacity = 'La capacidad de la mesa debe ser mayor o igual a 1'
	}

	if (!data.restaurantId?.trim()) {
		errors.restaurantId = 'El restaurante es requerido'
	}

	return { isValid: Object.keys(errors).length === 0, errors }
}

export const getTableStateLabel = (tableState) => {
	return tableState || 'Disponible'
}

export const getTableStatusLabel = (estado) => {
	return estado === true || estado === 'true' ? 'Activa' : 'Inactiva'
}

export const getTableRestaurantLabel = (table) => {
	const restaurant = table?.restaurant_id

	if (!restaurant) {
		return 'Sin restaurante'
	}

	if (typeof restaurant === 'string') {
		return restaurant
	}

	return restaurant.restaurant_name || restaurant.name || 'Sin restaurante'
}

export const sortTables = (tables, sortBy, sortOrder = 'asc') => {
	const sorted = [...tables].sort((a, b) => {
		const aVal = a[sortBy]
		const bVal = b[sortBy]

		if (typeof aVal === 'string') {
			return sortOrder === 'asc'
				? aVal.localeCompare(bVal)
				: bVal.localeCompare(aVal)
		}

		return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
	})

	return sorted
}

export const filterTables = (tables, searchTerm) => {
	if (!searchTerm?.trim()) return tables

	const term = searchTerm.toLowerCase()

	return tables.filter((table) => {
		const restaurantLabel = getTableRestaurantLabel(table).toLowerCase()

		return (
			table.table_name?.toLowerCase().includes(term) ||
			table.table_ubication?.toLowerCase().includes(term) ||
			String(table.table_number || '').includes(term) ||
			String(table.table_capacity || '').includes(term) ||
			table.table_state?.toLowerCase().includes(term) ||
			restaurantLabel.includes(term)
		)
	})
}

export { resolveTableId }
