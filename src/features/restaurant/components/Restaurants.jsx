/**
 * Restaurants
 * Componente para mostrar la lista de restaurantes
 */

import RestaurantCard from './RestaurantCard.jsx'

/* eslint-disable react/prop-types */
const Restaurants = ({ restaurants, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando restaurantes...</p>
      </div>
    )
  }

  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🏪</div>
        <h3>No hay restaurantes registrados</h3>
        <p>Crea un nuevo restaurante para comenzar</p>
      </div>
    )
  }

  return (
    <div className="restaurants-container">
      <div className="list-header">
        <h2>Restaurantes ({restaurants.length})</h2>
      </div>

      <div className="cards-grid">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant._id}
            restaurant={restaurant}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

export default Restaurants
