import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Spinner } from '../../../shared/components/Spinner'
import {
  useDeleteInventoryItem,
  useInventory,
  useInventoryStockActions,
  useSaveInventoryItem,
  useSearchInventory,
} from '../hooks'

const unitOptions = ['kg', 'g', 'L', 'ml', 'unidades', 'docena', 'paquete', 'lata', 'caja']

const emptyForm = (restaurantId = '') => ({
  item_name: '',
  category: '',
  quantity: 0,
  unit: 'unidades',
  price: 0,
  provider: '',
  restaurant_id: restaurantId,
  estado: true,
})

const INVENTORY_RESTAURANT_KEY = 'inventory:lastRestaurantId'

const InventoryPage = () => {
  const [restaurantId, setRestaurantId] = useState(() => localStorage.getItem(INVENTORY_RESTAURANT_KEY) || '')

  const { items, loading, error, fetchInventory } = useInventory(restaurantId || null)
  const { search } = useSearchInventory(restaurantId || null)
  const { handleSave, loading: saving, isEditing } = useSaveInventoryItem()
  const { handleDelete, loading: deleting } = useDeleteInventoryItem()
  const { decreaseStock, increaseStock, loading: stockLoading } = useInventoryStockActions()

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState(emptyForm(''))

  useEffect(() => {
    if (!restaurantId.trim()) return
    localStorage.setItem(INVENTORY_RESTAURANT_KEY, restaurantId.trim())
    fetchInventory()
  }, [fetchInventory, restaurantId])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // El restaurant_id ahora se define manualmente desde la interfaz.

  const openCreateModal = () => {
    setSelectedItem(null)
    setFormData(emptyForm(restaurantId))
    setIsModalOpen(true)
  }

  const openEditModal = (item) => {
    setSelectedItem(item)
    setFormData({
      item_name: item?.item_name || '',
      category: item?.category || '',
      quantity: Number(item?.quantity ?? 0),
      unit: item?.unit || 'unidades',
      price: Number(item?.price ?? 0),
      provider: item?.provider || '',
      restaurant_id: item?.restaurant_id?._id || item?.restaurant_id || restaurantId,
      estado: item?.estado ?? true,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  const refreshInventory = async () => {
    if (searchTerm.trim()) {
      await search(searchTerm.trim())
      return
    }
    await fetchInventory()
  }

  const handleSearch = async (event) => {
    const value = event.target.value
    setSearchTerm(value)

    if (!restaurantId) return

    if (!value.trim()) {
      await fetchInventory()
      return
    }

    await search(value.trim())
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const effectiveRestaurantId = formData.restaurant_id || restaurantId
    const payload = {
      ...formData,
      restaurant_id: effectiveRestaurantId,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      estado: Boolean(formData.estado),
    }

    if (!payload.restaurant_id) {
      toast.error('Falta el restaurante activo para guardar el inventario')
      return
    }

    const result = await handleSave(payload, selectedItem?._id || selectedItem?.id || null)
    if (result?.success) {
      if (effectiveRestaurantId !== restaurantId) {
        setRestaurantId(effectiveRestaurantId)
      }
      closeModal()
      await refreshInventory()
    }
  }

  const handleDeleteItem = async (item) => {
    const id = item?._id || item?.id
    if (!id) return

    const confirmDelete = window.confirm(`Eliminar ${item?.item_name || 'este artículo'} del inventario?`)
    if (!confirmDelete) return

    const result = await handleDelete(id)
    if (result?.success) {
      await refreshInventory()
    }
  }

  const handleAdjustStock = async (item, mode) => {
    const id = item?._id || item?.id
    if (!id) return

    const raw = window.prompt(`Cantidad a ${mode === 'increase' ? 'agregar' : 'descontar'}`, '1')
    if (raw === null) return

    const quantity = Number(raw)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error('Ingresa una cantidad válida mayor a 0')
      return
    }

    const action = mode === 'increase' ? increaseStock : decreaseStock
    const result = await action(id, quantity, restaurantId)
    if (result?.success) {
      await refreshInventory()
    }
  }

  const filteredItems = items.filter((item) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.trim().toLowerCase()
    return [item?.item_name, item?.category, item?.provider, item?.unit]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term))
  })

  return (
    <div className="min-h-screen bg-[#2E160C] text-[#FCF0CA] p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 rounded-[2rem] border border-[#7F532C]/30 bg-[#5B300E]/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#946841]">Inventario</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase italic bg-gradient-to-r from-[#FCF0CA] via-[#946841] to-[#7F532C] bg-clip-text text-transparent">
              Control de insumos
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#FCF0CA]/80">
              Administra ingredientes, stock y proveedores para que las recetas se enlacen sin capturar IDs manualmente.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:min-w-[420px]">
            <input
              type="text"
              value={restaurantId}
              onChange={(event) => {
                const nextRestaurantId = event.target.value
                setRestaurantId(nextRestaurantId)
                if (nextRestaurantId.trim()) {
                  localStorage.setItem(INVENTORY_RESTAURANT_KEY, nextRestaurantId.trim())
                }
              }}
              placeholder="ID del restaurante"
              className="w-full rounded-2xl border border-[#7F532C]/40 bg-[#2E160C]/80 px-4 py-3 text-[#FCF0CA] placeholder:text-[#946841]/80 outline-none transition focus:border-[#FCF0CA]/60 focus:ring-2 focus:ring-[#946841]/25"
            />
            <p className="text-xs text-[#FCF0CA]/70">
              Escribe el ID del restaurante para cargar y guardar su inventario.
            </p>
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Buscar por nombre, categoría o proveedor"
              className="w-full rounded-2xl border border-[#7F532C]/40 bg-[#2E160C]/80 px-4 py-3 text-[#FCF0CA] placeholder:text-[#946841]/80 outline-none transition focus:border-[#FCF0CA]/60 focus:ring-2 focus:ring-[#946841]/25"
            />
            <button
              onClick={openCreateModal}
              className="rounded-2xl bg-[#7F532C] px-6 py-3 font-bold text-[#FCF0CA] shadow-lg shadow-black/20 transition hover:bg-[#946841]"
            >
              + Nuevo insumo
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="overflow-hidden rounded-[1.75rem] border border-[#7F532C]/20 bg-[#FCF0CA] text-[#2E160C] shadow-2xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#7F532C]/20">
                <thead className="bg-[#FCF0CA]/80 text-[#7F532C]">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Artículo</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Categoría</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Stock</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Precio</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Proveedor</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest">Estado</th>
                    <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#7F532C]/10 bg-white/80">
                  {filteredItems.map((item) => {
                    const id = item?._id || item?.id
                    return (
                      <tr key={id} className="hover:bg-[#FCF0CA]/50 transition">
                        <td className="px-4 py-4">
                          <div className="font-bold text-[#2E160C]">{item?.item_name}</div>
                          <div className="text-xs text-[#7F532C]">ID: {id}</div>
                        </td>
                        <td className="px-4 py-4">{item?.category || '-'}</td>
                        <td className="px-4 py-4">
                          <div className="font-semibold">{Number(item?.quantity ?? 0)} {item?.unit}</div>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(item, 'increase')}
                              disabled={stockLoading}
                              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              + Stock
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(item, 'decrease')}
                              disabled={stockLoading}
                              className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                            >
                              - Stock
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4">${Number(item?.price ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-4">{item?.provider || '-'}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${item?.estado ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
                            {item?.estado ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="rounded-xl border border-[#7F532C]/30 px-4 py-2 text-sm font-semibold text-[#2E160C] hover:bg-[#FCF0CA]"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item)}
                              disabled={deleting}
                              className="rounded-xl bg-[#5B300E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E160C] disabled:opacity-50"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-[#7F532C]/30 bg-[#FCF0CA]/10 p-12 text-center text-[#FCF0CA]/80">
            <h2 className="text-2xl font-bold text-[#FCF0CA]">No hay artículos en inventario</h2>
            <p className="mt-2">Crea tu primer insumo para empezar a vincularlo con recetas.</p>
            <button
              onClick={openCreateModal}
              className="mt-6 rounded-2xl bg-[#7F532C] px-6 py-3 font-bold text-[#FCF0CA] hover:bg-[#946841]"
            >
              + Nuevo insumo
            </button>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[#7F532C]/20 bg-[#FCF0CA] text-[#2E160C] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#7F532C]/10 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#7F532C]">Inventario</p>
                <h3 className="text-2xl font-black">{isEditing ? 'Editar insumo' : 'Nuevo insumo'}</h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full px-3 py-1 text-2xl font-bold text-[#7F532C] hover:bg-[#7F532C]/10"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 p-6 md:grid-cols-2">
              <div className="grid gap-2 md:col-span-2">
                <span className="sr-only">Nombre del artículo</span>
                <input
                  aria-label="Nombre del artículo"
                  value={formData.item_name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, item_name: event.target.value }))}
                  className="rounded-2xl border border-[#7F532C]/20 bg-white px-4 py-3 outline-none focus:border-[#5B300E]"
                  placeholder="Ej. Tomate"
                  required
                />
              </div>

              <div className="grid gap-2">
                <span className="sr-only">Categoría</span>
                <input
                  aria-label="Categoría"
                  value={formData.category}
                  onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
                  className="rounded-2xl border border-[#7F532C]/20 bg-white px-4 py-3 outline-none focus:border-[#5B300E]"
                  placeholder="Ej. Verduras"
                  required
                />
              </div>

              <div className="grid gap-2">
                <span className="sr-only">Proveedor</span>
                <input
                  aria-label="Proveedor"
                  value={formData.provider}
                  onChange={(event) => setFormData((prev) => ({ ...prev, provider: event.target.value }))}
                  className="rounded-2xl border border-[#7F532C]/20 bg-white px-4 py-3 outline-none focus:border-[#5B300E]"
                  placeholder="Ej. Proveedor Central"
                  required
                />
              </div>

              <div className="grid gap-2">
                <span className="sr-only">Cantidad</span>
                <input
                  aria-label="Cantidad"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(event) => setFormData((prev) => ({ ...prev, quantity: event.target.value }))}
                  className="rounded-2xl border border-[#7F532C]/20 bg-white px-4 py-3 outline-none focus:border-[#5B300E]"
                  required
                />
              </div>

              <div className="grid gap-2">
                <span className="sr-only">Unidad</span>
                <select
                  aria-label="Unidad"
                  value={formData.unit}
                  onChange={(event) => setFormData((prev) => ({ ...prev, unit: event.target.value }))}
                  className="rounded-2xl border border-[#7F532C]/20 bg-white px-4 py-3 outline-none focus:border-[#5B300E]"
                  required
                >
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <span className="sr-only">Precio</span>
                <input
                  aria-label="Precio"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(event) => setFormData((prev) => ({ ...prev, price: event.target.value }))}
                  className="rounded-2xl border border-[#7F532C]/20 bg-white px-4 py-3 outline-none focus:border-[#5B300E]"
                  required
                />
              </div>

              <div className="grid gap-2 md:col-span-2">
                <span className="sr-only">Restaurant ID</span>
                <input
                  aria-label="Restaurant ID"
                  value={formData.restaurant_id}
                  onChange={(event) => setFormData((prev) => ({ ...prev, restaurant_id: event.target.value }))}
                  className="rounded-2xl border border-[#7F532C]/20 bg-[#f5ead2] px-4 py-3 outline-none"
                  placeholder="Ingresa el ID del restaurante"
                />
                <span className="text-xs text-[#7F532C]">Este campo se captura manualmente por ahora.</span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#7F532C]/20 bg-white px-4 py-3 md:col-span-2">
                <input
                  aria-label="Activo"
                  type="checkbox"
                  checked={formData.estado}
                  onChange={(event) => setFormData((prev) => ({ ...prev, estado: event.target.checked }))}
                  className="h-4 w-4 accent-[#5B300E]"
                />
                <span className="sr-only">Activo</span>
              </div>

              <div className="flex gap-3 pt-2 md:col-span-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-2xl border border-[#7F532C]/20 bg-white px-4 py-3 font-bold text-[#2E160C] hover:bg-[#FCF0CA]/60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-[#5B300E] px-4 py-3 font-bold text-white hover:bg-[#2E160C] disabled:opacity-60"
                >
                  {saving ? 'Guardando...' : 'Guardar insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryPage
