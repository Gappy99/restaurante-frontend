import { useState, useCallback } from 'react'

// Minimal hook used by CustomerMenuView. Tries to fetch from '/menu' and falls
// back to an empty array on error. Keeps API calls optional and safe.
export function useMenus() {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchMenus = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/menu')
      if (!res.ok) throw new Error('network')
      const data = await res.json()
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
