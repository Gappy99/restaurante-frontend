import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RestaurantCard from '../components/RestaurantCard'
import RestaurantModal from '../components/RestaurantModal'
import useRestaurantStore from '../stores/useRestaurantStore'

const InformationPage = () => {
  const navigate = useNavigate()
  const {
    restaurants,
    loading,
    error,
    loadRestaurants,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
  } = useRestaurantStore()
  const [openModal, setOpenModal] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState(null)

  useEffect(() => {
    loadRestaurants()
  }, [loadRestaurants])

  const handleOpenModal = (restaurant = null) => {
    setEditingRestaurant(restaurant)
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setEditingRestaurant(null)
    setOpenModal(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este restaurante?')) {
      deleteRestaurant(id)
    }
  }

  const handleSave = (restaurantData) => {
    if (editingRestaurant) {
      updateRestaurant(editingRestaurant._id, restaurantData)
    } else {
      addRestaurant(restaurantData)
    }
    handleCloseModal()
  }

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent-soft)] bg-[var(--surface)] px-4 py-2 text-[var(--text)] hover:bg-[var(--accent-soft)] transition"
          >
            ← Regresar
          </button>
          <h1 className="text-3xl font-bold text-[var(--text)]">Gestión de Restaurantes</h1>
          <p className="text-[var(--muted)] text-sm">Administra los restaurantes registrados</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-[var(--primary)] px-4 py-2 rounded text-[var(--surface)] hover:bg-[#446b5b] transition"
        >
          + Agregar Restaurante
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-[var(--surface)] p-8 text-center text-[var(--muted)] border border-[var(--accent-soft)]">Cargando restaurantes...</div>
      ) : error ? (
        <div className="rounded-3xl bg-[var(--accent-soft)] p-8 text-[var(--accent)]">{error}</div>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <RestaurantModal
        isOpen={openModal}
        onClose={handleCloseModal}
        restaurant={editingRestaurant}
        onSave={handleSave}
      />
    </div>
  )
}

export default InformationPage
