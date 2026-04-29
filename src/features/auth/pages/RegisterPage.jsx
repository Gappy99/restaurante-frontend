import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authService } from '../../../shared/api/services/authService'

/**
 * Página de Registro
 */
const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const password = watch('password')

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setIsLoading(true)
    const result = await authService.register({
      nombre: data.nombre,
      username: data.username,
      email: data.email,
      password: data.password,
      telefono: data.telefono,
      rol: 'CLIENTE',
    })

    if (result.success) {
      toast.success('Registro exitoso, inicia sesión')
      navigate('/login')
    }
    setIsLoading(false)
  }

  return (
    <div className="rounded-3xl border border-white/60 bg-[#FFFFFD] p-8 shadow-[0_20px_60px_rgba(47,47,47,0.18)] backdrop-blur-sm">
      <h1 className="text-3xl font-bold text-[#2F2F2F] mb-2">Restauraante</h1>
      <p className="text-[#517360] mb-8">Crea tu cuenta</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-[#2F2F2F] mb-1">
            Nombre Completo
          </label>
          <input
            type="text"
            placeholder="Tu nombre"
            {...register('nombre', { required: 'Nombre requerido' })}
            className="w-full rounded-xl border border-[#E2DFCE] px-4 py-2 outline-none transition focus:border-[#517360] focus:ring-2 focus:ring-[#517360]/30"
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-[#A66F5B]">{errors.nombre.message}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-[#2F2F2F] mb-1">
            Usuario
          </label>
          <input
            type="text"
            placeholder="nombre_usuario"
            {...register('username', { required: 'Usuario requerido' })}
            className="w-full rounded-xl border border-[#E2DFCE] px-4 py-2 outline-none transition focus:border-[#517360] focus:ring-2 focus:ring-[#517360]/30"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-[#A66F5B]">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[#2F2F2F] mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="tu@email.com"
            {...register('email', { required: 'Email requerido' })}
            className="w-full rounded-xl border border-[#E2DFCE] px-4 py-2 outline-none transition focus:border-[#517360] focus:ring-2 focus:ring-[#517360]/30"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-[#A66F5B]">{errors.email.message}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-[#2F2F2F] mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            placeholder="123456789"
            {...register('telefono', { required: 'Teléfono requerido' })}
            className="w-full rounded-xl border border-[#E2DFCE] px-4 py-2 outline-none transition focus:border-[#517360] focus:ring-2 focus:ring-[#517360]/30"
          />
          {errors.telefono && (
            <p className="mt-1 text-sm text-[#A66F5B]">{errors.telefono.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-[#2F2F2F] mb-1">
            Contraseña
          </label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('password', { required: 'Contraseña requerida' })}
            className="w-full rounded-xl border border-[#E2DFCE] px-4 py-2 outline-none transition focus:border-[#517360] focus:ring-2 focus:ring-[#517360]/30"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-[#A66F5B]">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-[#2F2F2F] mb-1">
            Confirmar Contraseña
          </label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword', { required: 'Confirmar contraseña' })}
            className="w-full rounded-xl border border-[#E2DFCE] px-4 py-2 outline-none transition focus:border-[#517360] focus:ring-2 focus:ring-[#517360]/30"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-[#A66F5B]">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full rounded-xl bg-[#517360] py-2 font-semibold text-white transition hover:bg-[#466353] disabled:cursor-not-allowed disabled:bg-[#E2DFCE] disabled:text-[#2F2F2F]"
        >
          {isLoading ? 'Cargando...' : 'Registrarse'}
        </button>
      </form>

      {/* Login link */}
      <p className="mt-4 text-center text-[#2F2F2F]">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-[#A66F5B] hover:underline">
          Inicia Sesión
        </Link>
      </p>
    </div>
  )
}

export default RegisterPage
