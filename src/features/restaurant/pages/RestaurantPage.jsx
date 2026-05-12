import { useEffect, useState } from 'react'
import {
  useRestaurants,
  useRestaurantDelete,
} from '../hooks/index.js'
import { Restaurants, RestaurantModal, DeleteConfirmModal } from '../components/index.js'
import toast from 'react-hot-toast'

const RestaurantPage = () => {
  const { restaurants, loading, error, fetchRestaurants } = useRestaurants()
  const { handleDelete, loading: deleteLoading } = useRestaurantDelete()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [restaurantToDelete, setRestaurantToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { fetchRestaurants() }, [fetchRestaurants])
  useEffect(() => { if (error) { toast.error(error) } }, [error])

  const handleCreateNew = () => {
    setSelectedRestaurant(null)
    setIsModalOpen(true)
  }

  const handleEdit = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRestaurant(null)
  }

  const handleSuccess = () => { fetchRestaurants() }

  const handleDeleteClick = async (id) => {
    const restaurantToRemove = restaurants.find(r => (r._id || r.id) === id)
    setRestaurantToDelete(restaurantToRemove)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!restaurantToDelete) return
    
    const result = await handleDelete(restaurantToDelete._id || restaurantToDelete.id)
    if (result?.success) {
      toast.success('Restaurante eliminado correctamente')
      setIsDeleteConfirmOpen(false)
      setRestaurantToDelete(null)
      fetchRestaurants()
    }
  }

  const handleCloseDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false)
    setRestaurantToDelete(null)
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredRestaurants = restaurants.filter((restaurant) => {
    if (!normalizedSearch) return true

    const name = (restaurant.restaurant_name || restaurant.name || '').toLowerCase()
    const direction = (restaurant.restaurant_direction || '').toLowerCase()

    return name.includes(normalizedSearch) || direction.includes(normalizedSearch)
  })

  return (
    // Fondo principal en el marrón más oscuro según tu paleta
    <div className="min-h-screen bg-[#2E160C] text-[#FCF0CA] p-4 md:p-8 font-sans">
      
      {/* Header con estilo sofisticado y bordes bronce */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-16 p-8 rounded-[2.5rem] bg-[#5B300E]/20 border border-[#7F532C]/30 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-[#FCF0CA] via-[#946841] to-[#7F532C] bg-clip-text text-transparent">
            Gestión de Sedes
          </h1>
          <p className="text-[#946841] mt-2 font-medium tracking-widest text-xs uppercase">
            Sistema de Administración Gastronómica Premium
          </p>
        </div>

        <div className="mt-8 md:mt-0 flex w-full md:w-auto flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="relative w-full md:w-96">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#946841]">🔎</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar restaurante o dirección"
              className="w-full rounded-2xl border border-[#7F532C]/30 bg-[#2E160C]/80 py-4 pl-12 pr-4 text-[#FCF0CA] placeholder:text-[#946841]/80 outline-none transition focus:border-[#FCF0CA]/60 focus:ring-2 focus:ring-[#946841]/25"
            />
          </div>

          <button
            onClick={handleCreateNew}
            className="px-10 py-4 bg-[#7F532C] hover:bg-[#946841] text-[#FCF0CA] hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl font-bold shadow-lg shadow-black/20 flex items-center gap-3 border border-[#FCF0CA]/10"
            disabled={loading}
          >
            <span className="text-xl">+</span> Nuevo Restaurante
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto relative">

        {/* Sección de visualización - El componente Restaurants ya maneja el grid */}
        <section className="relative z-10">
          <Restaurants
            restaurants={filteredRestaurants}
            loading={loading}
            onDelete={handleDeleteClick}
            onEdit={handleEdit}
          />
        </section>

        {/* Decoración de fondo sutil para dar profundidad */}
        <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#5B300E]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#7F532C]/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      </main>

      {/* El modal se renderiza dentro del componente RestaurantModal que modificamos antes */}
      {isModalOpen && (
        <RestaurantModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          initialData={selectedRestaurant}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        restaurantName={restaurantToDelete?.restaurant_name || restaurantToDelete?.name}
      />
    </div>
  )
}

export default RestaurantPage