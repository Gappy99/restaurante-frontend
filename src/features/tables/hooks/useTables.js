/**
 * Custom Hooks del feature Tables
 */

import { useCallback } from 'react'
import useTableStore from '../store/useTableStore.js'

export const useTables = () => {
	const {
		tables,
		loading,
		error,
		fetchTables,
		setTables,
		setFilters,
		clearError,
		getFilteredTables,
	} = useTableStore()

	return {
		tables,
		loading,
		error,
		fetchTables,
		setTables,
		setFilters,
		clearError,
		getFilteredTables,
	}
}

export const useTable = (id) => {
	const {
		currentTable,
		loading,
		error,
		fetchTableById,
		setCurrentTable,
		clearCurrentTable,
	} = useTableStore()

	const fetch = useCallback(() => {
		if (id) {
			return fetchTableById(id)
		}
	}, [id, fetchTableById])

	return {
		table: currentTable,
		loading,
		error,
		fetch,
		setCurrentTable,
		clearCurrentTable,
	}
}

export const useTableForm = () => {
	const {
		loading,
		error,
		createTable,
		updateTable,
		clearError,
		setCurrentTable,
	} = useTableStore()

	const handleCreate = useCallback(async (data) => await createTable(data), [
		createTable,
	])

	const handleUpdate = useCallback(
		async (id, data) => await updateTable(id, data),
		[updateTable]
	)

	return {
		loading,
		error,
		handleCreate,
		handleUpdate,
		clearError,
		setCurrentTable,
	}
}

export const useTableDelete = () => {
	const { loading, error, deleteTable } = useTableStore()

	const handleDelete = useCallback(
		async (id) => {
			return await deleteTable(id)
		},
		[deleteTable]
	)

	return {
		loading,
		error,
		handleDelete,
	}
}
