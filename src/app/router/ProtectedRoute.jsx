import { Navigate } from 'react-router-dom'
import useAuthStore from '../../shared/stores/useAuthStore'
import { isPrivilegedRole, normalizeRole } from '../../shared/utils/roles'
 
/**
 * Componente ProtectedRoute
 * Protege rutas que requieren autenticación
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
 
  // No autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
 
  // Requiere rol específico (ej: ADMIN)
  if (requiredRole) {
    const currentRole = normalizeRole(user?.rol)
    const acceptedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    const hasAccess = acceptedRoles.some((role) => {
      const normalized = normalizeRole(role)
      if (normalized === 'ADMIN') {
        return isPrivilegedRole(currentRole)
      }

      return currentRole === normalized
    })

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />
    }
  }
 
  return children
}
 
export default ProtectedRoute
 