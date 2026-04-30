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
    const result = await authService.login(data.email, data.password)

    if (result.success) {
      login(result.user, result.token, result.refreshToken)
      toast.success('Sesión iniciada correctamente')
      navigate('/')
    }
    setIsLoading(false)
  }

  return (
    <div className="rounded-3xl border-full border-white/60 bg-[#FFFFFD] p-8 shadow-[0_40px_120px_rgba(50,50,50,0,18)] ">
      <h1 className="text-3xl font-bold text-[#265C26] mb-2">Restaurant-GO</h1>
      <p className="font-medium mb-8 border-white/10 text-[#DDB7A2]">Inicia sesión en tu cuenta</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <p className="mt-1 text-sm ">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-[#517360] py-2 font-semibold text-white transition hover:bg-[#466353] disabled:cursor-not-allowed disabled:bg-[#E2DFCE] disabled:text-[#2F2F2F]"
        >
          {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>

      {/* Register link */}
      <p className="mt-4 text-center text-[#2F2F2F]">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-semibold text-[#A66F5B] hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}

export default LoginPage
