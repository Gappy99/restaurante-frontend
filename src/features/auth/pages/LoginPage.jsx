import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { authService } from '../../../shared/api/services/authService'

/**
 * Página de Login
 */
const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const result = await authService.login(data.email, data.password)

      if (result.success) {
        login(result.token, result.user)
        toast.success('Sesión iniciada correctamente')
        navigate('/loby')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#7F532C]/25 bg-[#FCF0CA]/95 p-8 shadow-[0_24px_60px_rgba(46,22,12,0.25)] backdrop-blur-sm">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#946841]/15 blur-2xl" />
      <div className="pointer-events-none absolute -left-10 bottom-10 h-24 w-24 rounded-full bg-[#5B300E]/20 blur-2xl" />

      <div className="mb-8">
        <span className="inline-flex rounded-full border border-[#7F532C]/30 bg-[#946841]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#5B300E]">
          Bienvenido
        </span>
        <h1 className="mt-4 text-3xl font-bold text-[#2E160C]">Omakase</h1>
        <p className="mt-2 text-sm text-[#7F532C]">
          Accede a tu cuenta para continuar con la experiencia.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Campo de correo */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#5B300E]">Correo electrónico</label>
          <input
            type="email"
            placeholder="tu@email.com"
            {...register('email', { required: 'Email requerido' })}
            className="w-full rounded-xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-2.5 text-[#2E160C] outline-none transition placeholder:text-[#946841]/70 focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/30"
          />
          {errors.email && (
            <p className="text-sm text-[#5B300E]">{errors.email.message}</p>
          )}
        </div>

        {/* Campo de contraseña */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#5B300E]">Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('password', { required: 'Contraseña requerida' })}
            className="w-full rounded-xl border border-[#7F532C]/30 bg-[#FCF0CA] px-4 py-2.5 text-[#2E160C] outline-none transition placeholder:text-[#946841]/70 focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/30"
          />
          {errors.password && (
            <p className="text-sm text-[#5B300E]">{errors.password.message}</p>
          )}
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-[#5B300E] py-2.5 font-semibold text-[#FCF0CA] transition hover:bg-[#7F532C] disabled:cursor-not-allowed disabled:bg-[#946841]/60 disabled:text-[#FCF0CA]/80"
        >
          {isLoading ? 'Cargando...' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[#5B300E]">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-semibold text-[#2E160C] transition hover:text-[#7F532C] hover:underline">
          Regístrate
        </Link>
      </p>
    </section>
  )
}

export default LoginPage
