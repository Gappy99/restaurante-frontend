import { Navigate } from 'react-router-dom'
import useAuthStore from '../../shared/stores/useAuthStore'

/**
 * Componente ProtectedRoute
 * Protege rutas que requieren autenticación
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuthStore()

  // No autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Requiere rol específico (ej: ADMIN)
  if (requiredRole && user?.rol !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute