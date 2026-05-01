/**
 * Store de Table con Zustand
 * Maneja el estado global del feature tables
 */

import { create } from 'zustand'
import { tableService } from '../services/tableService.js'
import { TABLE_DEFAULTS } from '../constants/tableConstants.js'
import { filterTables, sortTables, resolveTableId } from '../utils/tableUtils.js'

const useTableStore = create((set, get) => ({
	tables: [],
	currentTable: null,
	loading: false,
	error: null,
	pagination: {
		page: 1,
		pageSize: TABLE_DEFAULTS.PAGE_SIZE,
		total: 0,
	},
	filters: {
		search: '',
		restaurantId: '',
		tableState: '',
	},
	sortBy: TABLE_DEFAULTS.SORT_BY,
	sortOrder: TABLE_DEFAULTS.SORT_ORDER,

	setTables: (tables) => set({ tables }),
	setCurrentTable: (table) => set({ currentTable: table }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setPagination: (pagination) =>
		set((state) => ({
			pagination: { ...state.pagination, ...pagination },
		})),
	setFilters: (filters) =>
		set((state) => ({
			filters: { ...state.filters, ...filters },
		})),
	setSortBy: (sortBy, sortOrder = 'asc') => set({ sortBy, sortOrder }),

	clearError: () => set({ error: null }),
	clearCurrentTable: () => set({ currentTable: null }),

	fetchTables: async (params = {}) => {
		set({ loading: true, error: null })
		const result = await tableService.getTables(params)

		if (result.success) {
			set({
				tables: result.data,
				loading: false,
			})
		} else {
			set({
				error: result.error,
				loading: false,
			})
		}

		return result
	},

	fetchTableById: async (id) => {
		set({ loading: true, error: null })
		const result = await tableService.getTableById(id)

		if (result.success) {
			set({
				currentTable: result.data,
				loading: false,
			})
		} else {
			set({
				error: result.error,
				loading: false,
			})
		}

		return result
	},

	createTable: async (tableData) => {
		set({ loading: true, error: null })
		const result = await tableService.createTable(tableData)

		if (result.success) {
			set((state) => ({
				tables: [...state.tables, result.data],
				loading: false,
			}))
		} else {
			set({
				error: result.error,
				loading: false,
			})
		}

		return result
	},

	updateTable: async (id, tableData) => {
		set({ loading: true, error: null })
		const result = await tableService.updateTable(id, tableData)

		if (result.success) {
			set((state) => ({
				tables: state.tables.map((table) =>
					resolveTableId(table) === id ? result.data : table
				),
				currentTable:
					resolveTableId(state.currentTable) === id
						? result.data
						: state.currentTable,
				loading: false,
			}))
		} else {
			set({
				error: result.error,
				loading: false,
			})
		}

		return result
	},

	deleteTable: async (id) => {
		set({ loading: true, error: null })
		const result = await tableService.deleteTable(id)

		if (result.success) {
			set((state) => ({
				tables: state.tables.filter((table) => resolveTableId(table) !== id),
				currentTable:
					resolveTableId(state.currentTable) === id ? null : state.currentTable,
				loading: false,
			}))
		} else {
			set({
				error: result.error,
				loading: false,
			})
		}

		return result
	},

	getFilteredTables: () => {
		const state = get()
		let filtered = filterTables(state.tables, state.filters.search)

		if (state.filters.restaurantId) {
			filtered = filtered.filter((table) => {
				const restaurant = table.restaurant_id

				if (!restaurant) return false

				if (typeof restaurant === 'string') {
					return restaurant === state.filters.restaurantId
				}

				return (restaurant._id || restaurant.id) === state.filters.restaurantId
			})
		}

		if (state.filters.tableState) {
			filtered = filtered.filter(
				(table) => table.table_state === state.filters.tableState
			)
		}

		return sortTables(filtered, state.sortBy, state.sortOrder)
	},

	getTotalCount: () => get().tables.length,

	getTableById: (id) => get().tables.find((table) => resolveTableId(table) === id),
}))

export default useTableStore
