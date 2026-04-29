import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

// Layouts
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'

// Páginas públicas
import LoginPage from '../../features/auth/pages/LoginPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import NotFoundPage from '../../features/common/pages/NotFoundPage'
import UnauthorizedPage from '../../features/common/pages/UnauthorizedPage'
import MenuPage from '../../features/common/pages/MenuPage'

// Páginas protegidas
import DashboardPage from '../../features/dashboard/pages/DashboardPage'
import UsersPage from '../../features/users/pages/UsersPage'
import FieldsPage from '../../features/fields/pages/FieldsPage'
import InformationPage from '../../features/Information/pages/InformationPage'

/**
 * Configuración de rutas con protección
 */
const router = createBrowserRouter([
  // Rutas públicas
  {
    path: '/login',
    element: (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthLayout>
        <RegisterPage />
      </AuthLayout>
    ),
  },
  {
    path: '/information',
    element: <InformationPage />,
  },

  // Rutas protegidas
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'information',
        element: <InformationPage />,
      },
      {
        path: 'menu',
        element: <MenuPage />,
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'fields',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <FieldsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Páginas de error
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default router
