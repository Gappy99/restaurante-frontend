import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FiMail, FiPhone, FiShield, FiUser } from 'react-icons/fi'

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

  const initials = mergedProfile.nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl relative overflow-hidden">
        <div className="pointer-events-none absolute -top-12 left-6 h-36 w-36 rounded-full bg-slate-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-14 right-10 h-56 w-56 rounded-full bg-sky-100/25 blur-3xl" />
        <div className="mb-8 flex flex-col gap-4 rounded-[1.75rem] border border-[#e2e8f0] bg-white/90 p-6 shadow-sm backdrop-blur-xl sm:p-8 overflow-hidden relative">
          <span
            className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-slate-100 opacity-80 blur-2xl"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-slate-100 opacity-80 blur-2xl"
            aria-hidden="true"
          />
          <span
            className="absolute top-0 left-0 h-1 w-full rounded-t-[1.75rem]"
            style={{ background: 'linear-gradient(90deg, #1e293b, #475569, #cbd5e1)' }}
            aria-hidden="true"
          />
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Perfil</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Mi cuenta
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Panel de usuario con información principal y una experiencia visual más viva.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <section className="rounded-[2rem] border border-[#e2e8f0] bg-white p-6 shadow-sm reservation-container">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-[1.5rem] bg-slate-900 text-4xl font-black uppercase tracking-[0.2em] text-white shadow-inner shadow-slate-900/10 transition-transform duration-300 ease-out hover:-translate-y-1">
                {initials || 'US'}
              </div>
              <div className="flex-1">
                <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Administrador del Sistema</p>
                <h2 className="mt-2 text-3xl font-[900] text-slate-950 sm:text-4xl" style={{ letterSpacing: '-0.3px' }}>
                  {mergedProfile.nombre || 'Usuario sin nombre'}
                </h2>
                <span className="mt-3 inline-flex items-center rounded-full border border-[#cbd5e1] bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  <span className="mr-2 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#22c55e] shadow-sm" aria-hidden="true" />
                  {mergedProfile.rol || 'Sin rol'}
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="relative rounded-[1.5rem] border border-[#e2e8f0] bg-slate-50 p-4 pl-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-300">
                <span className="absolute left-0 top-0 h-full w-[3px] rounded-r-full bg-slate-900/20" aria-hidden="true" />
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Email</p>
                <div className="mt-3 flex items-center gap-3 text-slate-900">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                    <FiMail size={18} />
                  </span>
                  <div>
                    <p className="font-semibold">{mergedProfile.email || 'No registrado'}</p>
                    <p className="text-sm text-slate-500">Correo principal</p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-[1.5rem] border border-[#e2e8f0] bg-slate-50 p-4 pl-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-300">
                <span className="absolute left-0 top-0 h-full w-[3px] rounded-r-full bg-slate-900/20" aria-hidden="true" />
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Teléfono</p>
                <div className="mt-3 flex items-center gap-3 text-slate-900">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                    <FiPhone size={18} />
                  </span>
                  <div>
                    <p className="font-semibold">{mergedProfile.telefono}</p>
                    <p className="text-sm text-slate-500">Contacto principal</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="relative rounded-[1.5rem] border border-[#e2e8f0] bg-slate-50 p-4 pl-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-300">
                <span className="absolute left-0 top-0 h-full w-[3px] rounded-r-full bg-slate-900/20" aria-hidden="true" />
                <div className="flex items-center gap-3 text-slate-900">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e2e8f0] text-slate-700 shadow-sm">
                    <FiShield size={18} />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">Rol actual</p>
                    <p className="text-sm text-slate-500">{mergedProfile.rol}</p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-[1.5rem] border border-[#e2e8f0] bg-slate-50 p-4 pl-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-300">
                <span className="absolute left-0 top-0 h-full w-[3px] rounded-r-full bg-slate-900/20" aria-hidden="true" />
                <div className="flex items-center gap-3 text-slate-900">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e2e8f0] text-slate-700 shadow-sm">
                    <FiUser size={18} />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">Restaurante asignado</p>
                    <p className="text-sm text-slate-500">{mergedProfile.restauranteAsignadoNombre}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage