import { useState, useEffect } from 'react'
import { getMenusByRestaurant } from '../services/customerMenuService'

// Hook de lectura para el menú cliente.
// Responsabilidades:
// - Encapsular la llamada a `getMenusByRestaurant(restaurantId)`.
// - Manejar `loading`, `error` y `menus` y devolverlos a la UI.
export default function useCustomerMenu(restaurantId) {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!restaurantId) return
    setLoading(true)
    getMenusByRestaurant(restaurantId)
      .then((res) => setMenus(res || []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }, [restaurantId])

  return { menus, loading, error }
}
