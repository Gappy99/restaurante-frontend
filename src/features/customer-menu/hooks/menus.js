import { useState, useCallback } from 'react'
import adminClient from '../../../shared/api/adminClient.js'

// Minimal hook used by CustomerMenuView. Fetches menus from backend API.
export function useMenus() {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchMenus = useCallback(async () => {
    setLoading(true)
    try {
      const response = await adminClient.get('/menu')
      const data = response.data
      setMenus(Array.isArray(data) ? data : [])
    } catch (e) {
      setMenus([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { menus, fetchMenus, loading }
}

export default useMenus
