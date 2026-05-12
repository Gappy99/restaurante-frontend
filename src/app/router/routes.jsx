import { createBrowserRouter, Navigate } from 'react-router-dom'

// Layouts
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'

// Páginas públicas
import LoginPage from '../../features/auth/pages/LoginPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import NotFoundPage from '../../features/common/pages/NotFoundPage'
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
import ReviewPage from '../../features/Review/pages/ReviewPage'
import CouponPage from '../../features/coupon/pages/CouponPage'

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
        path: 'reviews',
        element: <ReviewPage />,
      },
      {
        path: 'coupons',
        element: <CouponPage />,
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
        path: 'restaurants/:id/reviews',
        element: <ReviewPage />,
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
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default router
