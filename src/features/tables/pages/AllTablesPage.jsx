import { useEffect } from 'react'
import { useTables } from '../hooks/index.js'
import { TablesDisplay } from '../components/index.js'
import toast from 'react-hot-toast'

const AllTablesPage = () => {
  const { fetchTables, setFilters, getFilteredTables, loading, error } = useTables()

  useEffect(() => {
    // limpiar filtros y obtener todas las mesas
    setFilters({ restaurantId: '', tableState: '' })
    fetchTables()
  }, [fetchTables, setFilters])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const tables = getFilteredTables()

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#f8fafc] mb-8">Todas las Mesas</h1>
      <TablesDisplay tables={tables} loading={loading} />
    </div>
  )
}

export default AllTablesPage
