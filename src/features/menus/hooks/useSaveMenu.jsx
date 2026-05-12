import { useCallback } from 'react'
import useMenuStore from '../store/useMenuStore.js'

/**
 * Hook conveniente para formularios de menú (create/update)
 * Proporciona lógica unificada de guardado con validación
 */
export const useSaveMenu = (menuId = null) => {
  const { saveMenu, menus, loading, error } = useMenuStore()

  const currentMenu = menuId
    ? menus.find((m) => (m._id || m.id) === menuId)
    : null

  const handleSave = useCallback(
    async (formData) => {
      if (!formData?.name) {
        return {
          success: false,
          error: 'El nombre del menú es obligatorio',
        }
      }

      if (!formData?.restaurant_id) {
        return {
          success: false,
          error: 'El restaurante es obligatorio',
        }
      }

      return await saveMenu(formData, menuId)
    },
    [saveMenu, menuId]
  )

  return {
    handleSave,
    currentMenu,
    loading,
    error,
    isEditing: !!menuId,
  }
}

export default useSaveMenu
