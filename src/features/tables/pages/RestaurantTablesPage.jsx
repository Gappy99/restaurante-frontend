import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTables, useTableDelete } from '../hooks/index.js'
import useRestaurantStore from '../../restaurant/store/useRestaurantStore.js'
import useAuthStore from '../../../shared/stores/useAuthStore.js'
import { tableService } from '../services/tableService.js'
import {
  RestaurantFloorPlan,
  DeleteConfirmModal,
  TableInlineForm,
} from '../components/index.js'
import toast from 'react-hot-toast'
import { getAssignedRestaurantId, isManagerRole } from '../../../shared/utils/roles'

const RestaurantTablesPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchTables, setFilters, getFilteredTables, loading, error } = useTables()
  const { handleDelete, loading: deleteLoading } = useTableDelete()
  const { fetchRestaurantById, currentRestaurant } = useRestaurantStore()
  const user = useAuthStore((state) => state.user)
  const isClientUser = user?.rol === 'CLIENTE'
  const managerRestaurantId = isManagerRole(user?.rol) ? getAssignedRestaurantId(user) : ''
  const managerWithoutAssignment = isManagerRole(user?.rol) && !managerRestaurantId
  const effectiveRestaurantId = managerRestaurantId || id
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState(null)
  const [serverLayout, setServerLayout] = useState({})

  useEffect(() => {
    if (managerWithoutAssignment) {
      return
    }

    if (managerRestaurantId && id && String(id) !== String(managerRestaurantId)) {
      navigate(`/loby/restaurants/${managerRestaurantId}/tables`, { replace: true })
      return
    }

    if (effectiveRestaurantId) {
      fetchRestaurantById(effectiveRestaurantId)
      tableService.getRestaurantLayout(effectiveRestaurantId).then((result) => {
        if (result?.success) {
          setServerLayout(result.data || {})
        } else if (result?.error) {
          toast.error(`No se pudo cargar layout: ${result.error}`)
        }
      })
    }

    setFilters({ restaurantId: effectiveRestaurantId })
    fetchTables({ restaurant_id: effectiveRestaurantId })
  }, [effectiveRestaurantId, fetchTables, setFilters, fetchRestaurantById, id, managerRestaurantId, managerWithoutAssignment, navigate])

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
      fetchTables({ restaurant_id: effectiveRestaurantId })
    }
  }

  const handleCloseDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false)
    setTableToDelete(null)
  }

  const handleSaveLayout = async (layouts) => {
    if (!effectiveRestaurantId) return { success: false }

    const result = await tableService.saveRestaurantLayout(effectiveRestaurantId, layouts)
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
    <div className="min-h-screen bg-[#111111] text-[#f8fafc] p-4 md:p-8 font-sans">
      {managerWithoutAssignment ? (
        <div className="max-w-3xl mx-auto mt-24 rounded-[2rem] border border-red-500/40 bg-red-950/20 p-8 text-center">
          <h1 className="text-3xl font-black uppercase italic text-[#f8fafc]">Acceso restringido</h1>
          <p className="mt-3 text-[#9ca3af]">
            Tu cuenta tiene rol de gerente, pero todavía no tiene un restaurante asignado. No se pueden cargar mesas ni planos hasta que un administrador te vincule uno.
          </p>
        </div>
      ) : (
        <>
          <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 p-8 rounded-[2.5rem] bg-[#1f2937]/20 border border-[#6b7280]/30 backdrop-blur-xl shadow-2xl shadow-black/40">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-[#f8fafc] via-[#9ca3af] to-[#6b7280] bg-clip-text text-transparent">
                Plano de Mesas
              </h1>
              <p className="text-[#9ca3af] mt-2 font-medium tracking-widest text-xs uppercase">
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
                onSuccess={() => fetchTables({ restaurant_id: effectiveRestaurantId })}
                initialData={selectedTable}
                fixedRestaurantId={effectiveRestaurantId}
              />
            )}

            {error && (
              <div className="mb-10 p-5 bg-red-900/20 border border-red-500/40 rounded-2xl text-red-300 text-sm flex items-center gap-3 animate-pulse">
                <span><strong>Estado del Sistema:</strong> {error}</span>
              </div>
            )}

            <RestaurantFloorPlan
              restaurantId={effectiveRestaurantId}
              restaurantName={currentRestaurant?.restaurant_name}
              tables={tables}
              layoutFromApi={serverLayout}
              readOnly={isClientUser}
              onSaveLayout={isClientUser ? undefined : handleSaveLayout}
              onEdit={isClientUser ? undefined : handleEdit}
              onDelete={isClientUser ? undefined : handleDeleteClick}
              onCreate={isClientUser ? undefined : handleCreateNew}
            />
          </main>

          <DeleteConfirmModal
            isOpen={isDeleteConfirmOpen}
            onClose={handleCloseDeleteConfirm}
            onConfirm={handleConfirmDelete}
            loading={deleteLoading}
            tableName={tableToDelete?.table_name}
          />
        </>
      )}
    </div>
  )
}

export default RestaurantTablesPage
