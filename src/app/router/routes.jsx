import { createBrowserRouter } from 'react-router-dom'

// Layouts
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'

// Páginas públicas
import LoginPage from '../../features/auth/pages/LoginPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import NotFoundPage from '../../features/common/pages/NotFoundPage'

// Páginas principales
import DashboardPage from '../../features/dashboard/pages/DashboardPage'
import UsersPage from '../../features/users/pages/UsersPage'
import FieldsPage from '../../features/fields/pages/FieldsPage'
import RestaurantPage from '../../features/restaurant/pages/RestaurantPage'
import TablesPage from '../../features/tables/pages/TablesPage'
import RestaurantMiniMenuPage from '../../features/restaurant/pages/RestaurantMiniMenuPage'
import RestaurantTablesPage from '../../features/tables/pages/RestaurantTablesPage'
import AllTablesPage from '../../features/tables/pages/AllTablesPage'

/**
 * Configuración de rutas
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

  // Rutas principales sin protección por ahora
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'restaurants',
        element: <RestaurantPage />,
      },
      {
        path: 'restaurants/:id',
        element: <RestaurantMiniMenuPage />,
      },
      {
        path: 'restaurants/:id/tables',
        element: <RestaurantTablesPage />,
      },
      {
        path: 'fields',
        element: <FieldsPage />,
      },
      {
        path: 'tables',
        element: <TablesPage />,
      },
      {
        path: 'tables/all',
        element: <AllTablesPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default router
