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
import EventsPage from '../../features/events/pages/EventsPage'

import ProtectedRoute from './ProtectedRoute'

// Página de perfil de usuario
import ProfilePage from '../../features/users/pages/ProfilePage'

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
        path: 'events',
        element: <EventsPage />,
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
        path: 'fields',
        element: <FieldsPage />,
      },
    ],
  },
  // Rutas de Restaurantes a pantalla completa
  {
    path: '/loby/restaurants',
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <RestaurantPage />,
      },
      {
        path: ':id',
        element: <RestaurantMiniMenuPage />,
      },
      {
        path: ':id/tables',
        element: <RestaurantTablesPage />,
      },
    ],
  },
  // Rutas de Mesas a pantalla completa
  {
    path: '/loby/tables',
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <TablesPage />,
      },
      {
        path: 'all',
        element: <AllTablesPage />,
      },
    ],
  },
  // Rutas de Menú a pantalla completa
  {
    path: '/loby/menu',
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <MenuPage />,
      },
    ],
  },
  // Rutas de Información a pantalla completa
  {
    path: '/loby/information',
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <InformationPage />,
      },
    ],
  },
  // Rutas de Perfil a pantalla completa
  {
    path: '/loby/profile',
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ProfilePage />,
      },
    ],
  },
  // Rutas de Contactos a pantalla completa
  {
    path: '/loby/users',
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <UsersPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default router
