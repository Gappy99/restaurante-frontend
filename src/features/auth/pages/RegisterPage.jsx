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
  const fieldClass = 'w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-300'

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setIsLoading(true)
    try {
      const res = await authService.register({
        nombre: data.nombre,
        username: data.username,
        email: data.email,
        telefono: data.telefono,
        password: data.password,
      })

      if (res.success) {
        toast.success('Cuenta creada exitosamente')
        navigate('/login')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-300/60 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.14)] backdrop-blur-sm">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-zinc-300/35 blur-2xl" />
      <div className="pointer-events-none absolute -left-14 bottom-8 h-28 w-28 rounded-full bg-zinc-500/20 blur-2xl" />

      <div className="mb-7">
        <span className="inline-flex rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-700">
          Nuevo acceso
        </span>
        <h1 className="mt-4 text-3xl font-bold text-zinc-900">Crear cuenta</h1>
        <p className="mt-2 text-sm text-zinc-600">Regístrate para gestionar tus pedidos y reservas.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">Nombre completo</label>
          <input
            type="text"
            placeholder="Tu nombre"
            {...register('nombre', { required: 'Nombre requerido' })}
            className={fieldClass}
          />
          {errors.nombre && <p className="text-sm text-red-600">{errors.nombre.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">Usuario</label>
          <input
            type="text"
            placeholder="nombre_usuario"
            {...register('username', { required: 'Usuario requerido' })}
            className={fieldClass}
          />
          {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">Correo electrónico</label>
          <input
            type="email"
            placeholder="tu@email.com"
            {...register('email', { required: 'Email requerido' })}
            className={fieldClass}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">Teléfono</label>
          <input
            type="tel"
            placeholder="123456789"
            {...register('telefono', { required: 'Teléfono requerido' })}
            className={fieldClass}
          />
          {errors.telefono && <p className="text-sm text-red-600">{errors.telefono.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('password', { required: 'Contraseña requerida' })}
            className={fieldClass}
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">Confirmar contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword', {
              required: 'Confirmar contraseña',
              validate: (value) => value === password || 'Las contraseñas no coinciden',
            })}
            className={fieldClass}
          />
          {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-xl bg-zinc-900 py-2.5 font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:text-zinc-200"
        >
          {isLoading ? 'Cargando...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-zinc-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-zinc-900 transition hover:text-zinc-700 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </section>
  )
}

export default RegisterPage
