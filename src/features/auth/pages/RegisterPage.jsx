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
    <section className="relative overflow-hidden rounded-3xl border border-[#7F532C]/25 bg-[#FCF0CA]/95 p-8 shadow-[0_24px_60px_rgba(46,22,12,0.25)] backdrop-blur-sm">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#946841]/15 blur-2xl" />
      <div className="pointer-events-none absolute -left-14 bottom-8 h-28 w-28 rounded-full bg-[#5B300E]/20 blur-2xl" />

      <div className="mb-7">
        <span className="inline-flex rounded-full border border-[#7F532C]/30 bg-[#946841]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#5B300E]">
          Nuevo acceso
        </span>
        <h1 className="mt-4 text-3xl font-bold text-[#2E160C]">Crear cuenta</h1>
        <p className="mt-2 text-sm text-[#7F532C]">Regístrate para gestionar tus pedidos y reservas.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#5B300E]">Nombre completo</label>
          <input
            type="text"
            placeholder="Tu nombre"
            {...register('nombre', { required: 'Nombre requerido' })}
            className="w-full rounded-xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-2.5 text-[#2E160C] outline-none transition placeholder:text-[#946841]/70 focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/30"
          />
          {errors.nombre && <p className="text-sm text-[#5B300E]">{errors.nombre.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#5B300E]">Usuario</label>
          <input
            type="text"
            placeholder="nombre_usuario"
            {...register('username', { required: 'Usuario requerido' })}
            className="w-full rounded-xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-2.5 text-[#2E160C] outline-none transition placeholder:text-[#946841]/70 focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/30"
          />
          {errors.username && <p className="text-sm text-[#5B300E]">{errors.username.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#5B300E]">Correo electrónico</label>
          <input
            type="email"
            placeholder="tu@email.com"
            {...register('email', { required: 'Email requerido' })}
            className="w-full rounded-xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-2.5 text-[#2E160C] outline-none transition placeholder:text-[#946841]/70 focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/30"
          />
          {errors.email && <p className="text-sm text-[#5B300E]">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#5B300E]">Teléfono</label>
          <input
            type="tel"
            placeholder="123456789"
            {...register('telefono', { required: 'Teléfono requerido' })}
            className="w-full rounded-xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-2.5 text-[#2E160C] outline-none transition placeholder:text-[#946841]/70 focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/30"
          />
          {errors.telefono && <p className="text-sm text-[#5B300E]">{errors.telefono.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#5B300E]">Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('password', { required: 'Contraseña requerida' })}
            className="w-full rounded-xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-2.5 text-[#2E160C] outline-none transition placeholder:text-[#946841]/70 focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/30"
          />
          {errors.password && <p className="text-sm text-[#5B300E]">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#5B300E]">Confirmar contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword', {
              required: 'Confirmar contraseña',
              validate: (value) => value === password || 'Las contraseñas no coinciden',
            })}
            className="w-full rounded-xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-2.5 text-[#2E160C] outline-none transition placeholder:text-[#946841]/70 focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/30"
          />
          {errors.confirmPassword && <p className="text-sm text-[#5B300E]">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-xl bg-[#5B300E] py-2.5 font-semibold text-[#FCF0CA] transition hover:bg-[#7F532C] disabled:cursor-not-allowed disabled:bg-[#946841]/60 disabled:text-[#FCF0CA]/80"
        >
          {isLoading ? 'Cargando...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[#5B300E]">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-[#2E160C] transition hover:text-[#7F532C] hover:underline">
          Inicia sesión
        </Link>
      </p>
    </section>
  )
}

export default RegisterPage
