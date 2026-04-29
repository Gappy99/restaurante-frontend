/**
 * RestaurantCard
 * Componente para mostrar una tarjeta de restaurante
 */

import { getRestaurantStatusLabel } from '../utils/restaurantUtils.js'

/* eslint-disable react/prop-types */
const RestaurantCard = ({ restaurant, onEdit, onDelete }) => {
  const handleDelete = async () => {
    if (
      window.confirm(
        `¿Estás seguro que deseas eliminar "${restaurant.restaurant_name}"?`
      )
    ) {
      const result = await onDelete(restaurant._id)
      if (result.success) {
        // El estado se actualiza automáticamente desde el store
      }
    }
  }

  return (
    <div className="restaurant-card">
      <div className="restaurant-image">
        {restaurant.restaurant_images?.[0] ? (
          <img
            src={restaurant.restaurant_images[0]}
            alt={restaurant.restaurant_name}
          />
        ) : (
          <div className="image-placeholder">Sin imagen</div>
        )}
      </div>

      <div className="restaurant-content">
        <h3>{restaurant.restaurant_name}</h3>

        <div className="restaurant-info">
          <span className="status">
            {getRestaurantStatusLabel(restaurant.estado)}
          </span>
          <span className="type">{restaurant.restaurant_type}</span>
          <span className="gastro">{restaurant.restaurant_type_gastronomic}</span>
        </div>

        <div className="restaurant-details">
          <p>
            <strong>📍 Dirección:</strong> {restaurant.restaurant_direction}
          </p>
          <p>
            <strong>🕐 Horarios:</strong> {restaurant.restaurant_time_start} -{' '}
            {restaurant.restaurant_time_close}
          </p>
          <p>
            <strong>💰 Precio Promedio:</strong> ${restaurant.restaurant_mean_price}
          </p>
        </div>
      </div>

      <div className="card-actions">
        <button
          onClick={() => onEdit(restaurant)}
          className="btn btn-edit"
          title="Editar restaurante"
        >
          ✏️ Editar
        </button>
        <button
          onClick={handleDelete}
          className="btn btn-delete"
          title="Eliminar restaurante"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  )
}

export default RestaurantCard
