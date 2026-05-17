import React from 'react'
import CustomerMenuCard from './CustomerMenuCard.jsx'

// Componente de lista para el cliente.
// Responsabilidades:
// - Recibir `menus` (array) y `loading`.
// - Mostrar estado de carga, lista de `CustomerMenuCard` y un fallback cuando no hay items.
const CustomerMenuList = ({ menus = [], loading = false }) => {
  if (loading) return <div>Cargando menú...</div>
  if (!menus || menus.length === 0) return <div>No hay platos disponibles.</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {menus.map((m) => (
        <CustomerMenuCard key={m._id || m.id} item={m} />
      ))}
    </div>
  )
}

export default CustomerMenuList
