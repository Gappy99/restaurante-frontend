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
    <div className="bg-white rounded-lg shadow-2xl p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">RestaurantGO</h1>
      <p className="text-gray-600 mb-8">Inicia sesión en tu cuenta</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="tu@email.com"
            {...register('email', { required: 'Email requerido' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('password', { required: 'Contraseña requerida' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
        >
          {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>

      {/* Register link */}
      <p className="text-center text-gray-600 mt-4">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-blue-600 hover:underline font-semibold">
          Regístrate
        </Link>
      </p>
    </div>
  )
}

export default LoginPage
