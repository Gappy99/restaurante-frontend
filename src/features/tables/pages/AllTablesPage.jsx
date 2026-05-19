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
    <div className="min-h-screen bg-[#04060d] text-[#f8fafc]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-slate-700/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-56 w-56 rounded-full bg-slate-800/40 blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-700 bg-slate-950/95 p-8 shadow-[0_35px_80px_rgba(0,0,0,0.45)]">
            <span
              className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-slate-300 via-slate-500 to-slate-300"
              aria-hidden="true"
            />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Todas las Mesas</p>
                <h1 className="mt-3 text-4xl font-[900] tracking-[-0.32px] text-white sm:text-5xl">
                  Control total de mesas
                </h1>
              </div>
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-700 bg-slate-900/90 px-5 py-3 text-sm font-semibold text-slate-100 shadow-lg">
                {tables.length} mesa{tables.length === 1 ? '' : 's'} disponibles
              </div>
            </div>
          </div>

          <div className="mt-8">
            <TablesDisplay tables={tables} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllTablesPage
