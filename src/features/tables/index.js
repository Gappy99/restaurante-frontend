/**
 * Barrel export principal del feature Tables
 */

export {
	useTables,
	useTable,
	useTableForm,
	useTableDelete,
} from './hooks/index.js'

export { default as useTableStore } from './store/useTableStore.js'

export { tableService } from './services/tableService.js'

export {
	formatTableData,
	validateTableForm,
	getTableStateLabel,
	getTableStatusLabel,
	getTableRestaurantLabel,
	sortTables,
	filterTables,
	resolveTableId,
} from './utils/tableUtils.js'

export {
	TABLE_MESSAGES,
	TABLE_API_ENDPOINTS,
	TABLE_DEFAULTS,
	TABLE_STATES,
	TABLE_STATUS,
	TABLE_SORT_BY,
} from './constants/tableConstants.js'

export { TABLE_STATUS_VALUES, TABLE_SORT_BY as TABLE_TYPE_SORT_BY } from './types/table.types.js'
