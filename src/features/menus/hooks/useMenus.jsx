import { useCallback } from 'react'
import useMenuStore from '../store/useMenuStore.js'

/**
 * Hook para obtener y manejar la lista de menus
 */
export const useMenus = () => {
  const { menus, loading, error, fetchMenus } = useMenuStore()

  const handleFetchMenus = useCallback(async () => {
    return await fetchMenus()
  }, [fetchMenus])

  return {
    menus,
    loading,
    error,
    fetchMenus: handleFetchMenus,
  }
}

/**
 * Hook para obtener un menu especifico por ID
 */
export const useMenu = (id) => {
  const { menus, loading } = useMenuStore()
  const menu = menus.find((m) => (m._id || m.id) === id) || null

  return {
    menu,
    loading,
  }
}

/**
 * Hook para manejar el formulario de menu
 */
export const useMenuForm = (initialMenu = null) => {
  const { saveMenu, loading, error } = useMenuStore()

  const handleSave = useCallback(
    async (formData) => {
      return await saveMenu(formData, initialMenu?._id || initialMenu?.id)
    },
    [saveMenu, initialMenu]
  )

  return {
    handleSave,
    loading,
    error,
  }
}

/**
 * Hook para eliminar un menu
 */
export const useMenuDelete = () => {
  const { removeMenu, loading, error } = useMenuStore()

  const handleDelete = useCallback(
    async (id) => {
      return await removeMenu(id)
    },
    [removeMenu]
  )

  return {
    handleDelete,
    loading,
    error,
  }
}

/**
 * Hook para busqueda de menus
 */
export const useMenuSearch = () => {
  const store = useMenuStore()

  const handleSearch = useCallback(
    (term) => {
      if (!term) {
        return store.menus
      }
      return store.menus.filter((m) =>
        (m.name || m.Menu_Plate || '')
          .toLowerCase()
          .includes(term.toLowerCase())
      )
    },
    [store.menus]
  )

  return {
    search: handleSearch,
    loading: store.loading,
  }
}

export default useMenuStore
