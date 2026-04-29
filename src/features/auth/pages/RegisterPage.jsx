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
    <div className="bg-[var(--surface)] rounded-lg shadow-2xl p-8 border border-[var(--accent-soft)]">
      <h1 className="text-3xl font-bold text-[var(--text)] mb-2">RestaurantGO</h1>
      <p className="text-[var(--muted)] mb-8">Crea tu cuenta</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1">
            Nombre Completo
          </label>
          <input
            type="text"
            placeholder="Tu nombre"
            {...register('nombre', { required: 'Nombre requerido' })}
            className="w-full px-4 py-2 border border-[var(--accent-soft)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
          />
          {errors.nombre && (
            <p className="text-[var(--accent)] text-sm mt-1">{errors.nombre.message}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1">
            Usuario
          </label>
          <input
            type="text"
            placeholder="nombre_usuario"
            {...register('username', { required: 'Usuario requerido' })}
            className="w-full px-4 py-2 border border-[var(--accent-soft)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
          />
          {errors.username && (
            <p className="text-[var(--accent)] text-sm mt-1">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="tu@email.com"
            {...register('email', { required: 'Email requerido' })}
            className="w-full px-4 py-2 border border-[var(--accent-soft)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
          />
          {errors.email && (
            <p className="text-[var(--accent)] text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            placeholder="123456789"
            {...register('telefono', { required: 'Teléfono requerido' })}
            className="w-full px-4 py-2 border border-[var(--accent-soft)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
          />
          {errors.telefono && (
            <p className="text-[var(--accent)] text-sm mt-1">{errors.telefono.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1">
            Contraseña
          </label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('password', { required: 'Contraseña requerida' })}
            className="w-full px-4 py-2 border border-[var(--accent-soft)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
          />
          {errors.password && (
            <p className="text-[var(--accent)] text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1">
            Confirmar Contraseña
          </label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword', { required: 'Confirmar contraseña' })}
            className="w-full px-4 py-2 border border-[var(--accent-soft)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
          />
          {errors.confirmPassword && (
            <p className="text-[var(--accent)] text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[var(--primary)] hover:bg-[#446b5b] disabled:bg-[var(--accent-soft)] text-[var(--surface)] font-semibold py-2 rounded-lg transition mt-4"
        >
          {isLoading ? 'Cargando...' : 'Registrarse'}
        </button>
      </form>

      {/* Login link */}
      <p className="text-center text-[var(--muted)] mt-4">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-[var(--primary)] hover:underline font-semibold">
          Inicia Sesión
        </Link>
      </p>
    </div>
  )
}

export default RegisterPage
