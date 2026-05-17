import React from 'react'

// Tarjeta de menú orientada al cliente.
// Responsabilidades:
// - Mostrar nombre, descripción, precio y foto del platillo.
// - Exponer acciones de cliente (ver detalles, añadir al pedido) — sin controles de edición.
const CustomerMenuCard = ({ item }) => {
  return (
    <article className="p-4 bg-white/5 rounded-lg border">
      <h3 className="font-semibold">{item?.name || 'Platillo'}</h3>
      <p className="text-sm text-gray-300">{item?.description || 'Descripción breve'}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-bold">{item?.price ? `$${item.price}` : ''}</span>
        <button className="px-3 py-1 bg-green-600 rounded text-white">Añadir</button>
      </div>
    </article>
  )
}

export default CustomerMenuCard
