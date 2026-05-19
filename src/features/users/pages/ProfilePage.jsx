import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import useAuthStore from '../../../shared/stores/useAuthStore'
import userService from '../../../shared/api/services/userService'
import { getAssignedRestaurantName } from '../../../shared/utils/roles'

/**
 * Página de perfil del usuario autenticado
 */
const ProfilePage = () => {
  const token = useAuthStore((s) => s.token)
  const sessionUser = useAuthStore((s) => s.user)

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const mergedProfile = useMemo(() => {
    const source = profile || sessionUser || null

    if (!source) {
      return null
    }

    return {
      nombre: source.nombre || source.name || source.username || source.fullName || '',
      email: source.email || '',
      telefono: source.telefono || source.phone || source.contact_phone_number || 'No registrado',
      rol: source.rol || source.role || 'No registrado',
      restauranteAsignadoNombre:
        source.restauranteAsignadoNombre ||
        getAssignedRestaurantName(source) ||
        'No asignado',
    }
  }, [profile, sessionUser])

  // Cargar perfil
  const loadProfile = async () => {
    setLoading(true)

    try {
      const res = await userService.getProfile(token)
      if (res.success) setProfile(res.data)
      else {
        toast.error(res.error || 'Error al cargar perfil')
        setProfile(sessionUser || null)
      }
    } catch (error) {
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadProfile()
      return
    }

    setLoading(false)
    setProfile(sessionUser || null)
  }, [token, sessionUser])

  if (loading) {
    return <p className="p-4">Cargando perfil...</p>
  }

  if (!mergedProfile) {
    return <p className="p-4 text-red-500">No se pudo cargar el perfil</p>
  }

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>

      <div className="space-y-3">
        <p>
          <strong>Nombre:</strong> {mergedProfile.nombre || 'No registrado'}
        </p>

        <p>
          <strong>Email:</strong> {mergedProfile.email || 'No registrado'}
        </p>

        <p>
          <strong>Teléfono:</strong> {mergedProfile.telefono}
        </p>

        <p>
          <strong>Rol:</strong> {mergedProfile.rol}
        </p>

        <p>
          <strong>Restaurante asignado:</strong> {mergedProfile.restauranteAsignadoNombre}
        </p>
      </div>
    </div>
  )
}

export default ProfilePage