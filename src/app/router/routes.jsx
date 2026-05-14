import { createBrowserRouter, Navigate } from 'react-router-dom'

// Layouts
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import FullLayout from '../layouts/FullLayout'

// Páginas públicas
import LoginPage from '../../features/auth/pages/LoginPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import NotFoundPage from '../../features/common/pages/NotFoundPage'
import UnauthorizedPage from '../../features/common/pages/UnauthorizedPage'
import MenuPage from '../../features/menus/pages/MenuPage'

// Páginas principales
import DashboardPage from '../../features/dashboard/pages/DashboardPage'
import UsersPage from '../../features/users/pages/UsersPage'
import FieldsPage from '../../features/fields/pages/FieldsPage'
import RestaurantPage from '../../features/restaurant/pages/RestaurantPage'
import TablesPage from '../../features/tables/pages/TablesPage'
import RestaurantMiniMenuPage from '../../features/restaurant/pages/RestaurantMiniMenuPage'
import RestaurantTablesPage from '../../features/tables/pages/RestaurantTablesPage'
import AllTablesPage from '../../features/tables/pages/AllTablesPage'
import InformationPage from '../../features/Information/pages/InformationPage'

import ProtectedRoute from './ProtectedRoute'

// Página de perfil de usuario
import ProfilePage from '../../features/users/pages/ProfilePage'

// Mapa de sedes
import MapaDeSedePage from '../../features/mapa/pages/MapaDeSedePage'

/**
 * Configuración de rutas
 */
const router = createBrowserRouter([
  // Ruta raíz redirige al login
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
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
  // Rutas principales protegidas
  {
    path: '/loby',
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
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  // Mapa de sedes a pantalla completa
  {
    path: '/loby/mapa-de-sedes',
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <MapaDeSedePage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default router
