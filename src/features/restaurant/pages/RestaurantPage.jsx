/**
 * RestaurantPage
 * Página principal del feature Restaurant
 */

import { useEffect, useState } from 'react'
import {
  useRestaurants,
  useRestaurantDelete,
} from '../hooks/index.js'
import { Restaurants, RestaurantModal } from '../components/index.js'
import toast from 'react-hot-toast'

const RestaurantPage = () => {
  const { restaurants, loading, error, fetchRestaurants } = useRestaurants()
  const { handleDelete, loading: deleteLoading } = useRestaurantDelete()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)

  // Cargar restaurantes al montar
  useEffect(() => {
    fetchRestaurants()
  }, [fetchRestaurants])

  // Mostrar error si existe
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

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

  const handleSuccess = () => {
    fetchRestaurants()
  }

  const handleDeleteClick = async (id) => {
    const result = await handleDelete(id)
    if (result.success) {
      toast.success('Restaurante eliminado correctamente')
      fetchRestaurants()
    }
  }

  return (
    <div className="restaurant-page">
      <div className="page-header">
        <div>
          <h1>🏪 Gestión de Restaurantes</h1>
          <p className="subtitle">Administra todos tus restaurantes</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="btn btn-primary btn-lg"
          disabled={loading}
        >
          + Nuevo Restaurante
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <Restaurants
        restaurants={restaurants}
        loading={loading}
        onDelete={handleDeleteClick}
        onEdit={handleEdit}
      />

      {isModalOpen && (
        <RestaurantModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          initialData={selectedRestaurant}
        />
      )}
    </div>
  )
}

export default RestaurantPage
