/**
 * Servicio de Table
 * Maneja todas las llamadas API relacionadas con mesas
 */

import adminClient from '../../../shared/api/adminClient.js'
import { TABLE_API_ENDPOINTS } from '../constants/tableConstants.js'

const normalizeTableList = (payload) => {
	if (Array.isArray(payload)) {
		return payload
	}

	if (Array.isArray(payload?.tables)) {
		return payload.tables
	}

	if (Array.isArray(payload?.data)) {
		return payload.data
	}

	return []
}

const normalizeTableItem = (payload) => {
	if (!payload || Array.isArray(payload)) {
		return null
	}

	return payload.table || payload.data || payload
}

const normalizeLayoutMap = (payload) => {
	if (!payload) return {}

	const raw = payload.data || payload.layout || payload

	if (Array.isArray(raw?.layouts)) {
		return raw.layouts.reduce((acc, item) => {
			const id = item?.table_id || item?.tableId || item?._id || item?.id
			if (!id) return acc

			acc[id] = {
				x: Number(item.x) || 0,
				y: Number(item.y) || 0,
				width: Number(item.width) || 0,
				height: Number(item.height) || 0,
			}

			return acc
		}, {})
	}

	if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
		const keys = Object.keys(raw)
		const looksLikeMap = keys.every((key) => {
			const value = raw[key]
			return value && typeof value === 'object' && ('x' in value || 'y' in value)
		})

		if (looksLikeMap) {
			return raw
		}
	}

	return {}
}

export const tableService = {
	getTables: async (params = {}) => {
		try {
			const response = await adminClient.get(TABLE_API_ENDPOINTS.LIST, {
				params,
			})

			return {
				success: true,
				data: normalizeTableList(response.data),
			}
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || error.message,
			}
		}
	},

	getTableById: async (id) => {
		try {
			const response = await adminClient.get(TABLE_API_ENDPOINTS.DETAIL(id))
			const table = normalizeTableItem(response.data)

			if (!table) {
				throw new Error('Respuesta invalida al obtener mesa')
			}

			return {
				success: true,
				data: table,
			}
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || error.message,
			}
		}
	},

	createTable: async (tableData) => {
		try {
			const response = await adminClient.post(
				TABLE_API_ENDPOINTS.CREATE,
				tableData
			)
			const table = normalizeTableItem(response.data)

			if (!table) {
				throw new Error('Respuesta invalida al crear mesa')
			}

			return {
				success: true,
				data: table,
			}
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || error.message,
			}
		}
	},

	updateTable: async (id, tableData) => {
		try {
			const response = await adminClient.put(
				TABLE_API_ENDPOINTS.UPDATE(id),
				tableData
			)
			const table = normalizeTableItem(response.data)

			if (!table) {
				throw new Error('Respuesta invalida al actualizar mesa')
			}

			return {
				success: true,
				data: table,
			}
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || error.message,
			}
		}
	},

	deleteTable: async (id) => {
		try {
			await adminClient.delete(TABLE_API_ENDPOINTS.DELETE(id))

			return {
				success: true,
			}
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || error.message,
			}
		}
	},

	getRestaurantLayout: async (restaurantId) => {
		try {
			const response = await adminClient.get(
				TABLE_API_ENDPOINTS.LAYOUT(restaurantId)
			)

			return {
				success: true,
				data: normalizeLayoutMap(response.data),
			}
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || error.message,
			}
		}
	},

	saveRestaurantLayout: async (restaurantId, layouts = []) => {
		try {
			await adminClient.put(TABLE_API_ENDPOINTS.LAYOUT(restaurantId), {
				layouts,
			})

			return {
				success: true,
			}
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || error.message,
			}
		}
	},
}
