import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { authService } from '../../../shared/api/services/authService'
import '../LoginPage.css'

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
        login(result.token, result.user, result.refreshToken)
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
    <div className="container">
      {/* Puntos animados alrededor del círculo */}
      {Array.from({ length: 50 }).map((_, i) => (
        <span key={i} style={{ '--i': i }} />
      ))}

      <div className="login-box">
        <h2>Omakase</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-box">
            <input
              type="email"
              placeholder=" "
              {...register('email', { required: 'Email requerido' })}
            />
            <label>Email</label>
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder=" "
              {...register('password', { required: 'Contraseña requerida' })}
            />
            <label>Contraseña</label>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <div className="forgot-pass">
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>

          <button className="btn" type="submit" disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Iniciar sesión'}
          </button>

          <div className="signup-link">
            <Link to="/register">Regístrate</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
