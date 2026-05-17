import React from 'react'
import CustomerMenuList from '../components/CustomerMenuList.jsx'
import useCustomerMenu from '../hooks/useCustomerMenu'

// Página cliente: muestra el menú de un restaurante para clientes finales.
// Responsabilidades:
// - Usar el hook `useCustomerMenu` para cargar los menús de lectura (por restaurante).
// - Renderizar `CustomerMenuList` con datos preparados para vista de cliente.
// - No contiene lógica de edición/gestión; solo lectura y acciones de cliente (añadir al pedido, ver detalles).
export default function CustomerMenuPage() {
  // hook devolverá { menus, loading, error }
  const { menus, loading } = useCustomerMenu()

  return (
    <div className="min-h-screen p-4">
      {/* Este archivo es esqueleto: la implementación real del fetch está en el hook */}
      <h1 className="text-3xl font-bold mb-6">Menú</h1>
      <CustomerMenuList menus={menus} loading={loading} />
    </div>
  )
}
