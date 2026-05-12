import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTables, useTableDelete } from '../hooks/index.js'
import useRestaurantStore from '../../restaurant/store/useRestaurantStore.js'
import { tableService } from '../services/tableService.js'
import {
  RestaurantFloorPlan,
  DeleteConfirmModal,
  TableInlineForm,
} from '../components/index.js'
import toast from 'react-hot-toast'

const RestaurantTablesPage = () => {
  const { id } = useParams()
  const { fetchTables, setFilters, getFilteredTables, loading, error } = useTables()
  const { handleDelete, loading: deleteLoading } = useTableDelete()
  const { fetchRestaurantById, currentRestaurant } = useRestaurantStore()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState(null)
  const [serverLayout, setServerLayout] = useState({})

  useEffect(() => {
    if (id) {
      fetchRestaurantById(id)
      tableService.getRestaurantLayout(id).then((result) => {
        if (result?.success) {
          setServerLayout(result.data || {})
        } else if (result?.error) {
          toast.error(`No se pudo cargar layout: ${result.error}`)
        }
      })
    }

    setFilters({ restaurantId: id })
    fetchTables({ restaurant_id: id })
  }, [id, fetchTables, setFilters, fetchRestaurantById])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const tables = getFilteredTables()

  const handleCreateNew = () => {
    setSelectedTable(null)
    setIsFormOpen(true)
  }

  const handleEdit = (table) => {
    setSelectedTable(table)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (id) => {
    const table = tables.find(t => (t._id || t.id) === id)
    setTableToDelete(table)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!tableToDelete) return
    const result = await handleDelete(tableToDelete._id || tableToDelete.id)
    if (result?.success) {
      toast.success('Mesa eliminada correctamente')
      setIsDeleteConfirmOpen(false)
      setTableToDelete(null)
      fetchTables({ restaurant_id: id })
    }
  }

  const handleCloseDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false)
    setTableToDelete(null)
  }

  const handleSaveLayout = async (layouts) => {
    if (!id) return { success: false }

    const result = await tableService.saveRestaurantLayout(id, layouts)
    if (!result.success) {
      toast.error(`No se pudo guardar en DB: ${result.error || 'Error desconocido'}`)
      return result
    }

    setServerLayout(
      layouts.reduce((acc, item) => {
        acc[item.table_id] = {
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
        }
        return acc
      }, {})
    )

    return result
  }

  return (
    <div className="min-h-screen bg-[#2E160C] text-[#FCF0CA] p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 p-8 rounded-[2.5rem] bg-[#5B300E]/20 border border-[#7F532C]/30 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-[#FCF0CA] via-[#946841] to-[#7F532C] bg-clip-text text-transparent">
            Plano de Mesas
          </h1>
          <p className="text-[#946841] mt-2 font-medium tracking-widest text-xs uppercase">
            {currentRestaurant?.restaurant_name || 'Restaurante seleccionado'}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {isFormOpen && (
          <TableInlineForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false)
              setSelectedTable(null)
            }}
            onSuccess={() => fetchTables({ restaurant_id: id })}
            initialData={selectedTable}
            fixedRestaurantId={id}
          />
        )}

        {error && (
          <div className="mb-10 p-5 bg-red-900/20 border border-red-500/40 rounded-2xl text-red-300 text-sm flex items-center gap-3 animate-pulse">
            <span className="text-lg">⚠️</span>
            <span><strong>Estado del Sistema:</strong> {error}</span>
          </div>
        )}

        <RestaurantFloorPlan
          restaurantId={id}
          restaurantName={currentRestaurant?.restaurant_name}
          tables={tables}
          layoutFromApi={serverLayout}
          onSaveLayout={handleSaveLayout}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onCreate={handleCreateNew}
        />
      </main>

      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        tableName={tableToDelete?.table_name}
      />
    </div>
  )
}

export default RestaurantTablesPage
