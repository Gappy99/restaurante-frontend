import { createBrowserRouter, Navigate } from 'react-router-dom'

// Layouts
import MainLayout from '../layouts/MainLayout'
import UnauthorizedPage from '../../features/common/pages/UnauthorizedPage'
import AuthLayout from '../layouts/AuthLayout'
import FullLayout from '../layouts/FullLayout'
import ErrorBoundary from '../ErrorBoundary'

// Páginas públicas
import LoginPage from '../../features/auth/pages/LoginPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import NotFoundPage from '../../features/common/pages/NotFoundPage'
import MenuPage from '../../features/menus/pages/MenuPage'
import CustomerLobbyPage from '../../features/customer-loby/pages/CustomerLobbyPage'

// Páginas principales
import DashboardPage from '../../features/dashboard/pages/DashboardPage'
import UsersPage from '../../features/users/pages/UsersPage'
import FieldsPage from '../../features/fields/pages/FieldsPage'
import ReservationsPage from '../../features/reservations/pages/ReservationsPage'
import NotificationsPage from '../../features/notifications/pages/NotificationsPage'
import ReportsPage from '../../features/reports/pages/ReportsPage'
import RestaurantPage from '../../features/restaurant/pages/RestaurantPage'
import InventoryPage from '../../features/inventory/pages/InventoryPage'
import TablesPage from '../../features/tables/pages/TablesPage'
import RestaurantMiniMenuPage from '../../features/restaurant/pages/RestaurantMiniMenuPage'
import RestaurantTablesPage from '../../features/tables/pages/RestaurantTablesPage'
import AllTablesPage from '../../features/tables/pages/AllTablesPage'
import InformationPage from '../../features/Information/pages/InformationPage'
import RecipesPage from '../../features/recipes/pages/RecipesPage'
import OrdersPage from '../../features/orders/pages/OrdersPage'
import DetallePedidosPage from '../../features/detallepedido/pages/DetallePedidosPage'
import ReviewPage from '../../features/Review/pages/ReviewPage'
import CouponPage from '../../features/coupon/pages/CouponPage'
import EventsPage from '../../features/events/pages/EventsPage'

import ProtectedRoute from './ProtectedRoute'


// Página de perfil de usuario
import ProfilePage from '../../features/users/pages/ProfilePage'

// Mapa de sedes
import MapaDeSedePage from '../../features/mapa/pages/MapaDeSedePage'

import CustomerMainLayout from '../../features/customer-loby/layouts/CustomerMainLayout'
import CustomerMenuView from '../../features/customer-menu/page/CustomerMenuView'
import CustomerRestaurantMenuView from '../../features/customer-menu/page/CustomerRestaurantMenuView'
import CustomerRestaurantView from '../../features/customer-restaurant/page/CustomerRestaurantView'
import CustomerReservationView from '../../features/customer-reservation/page/CustomerReservationView'
import CustomerReservationCreateView from '../../features/customer-reservation/page/CustomerReservationCreateView'
import CustomerOrdersView from '../../features/customer-orders/page/CustomerOrdersView'
import CustomerOrderCreateView from '../../features/customer-orders/page/CustomerOrderCreateView'
import CustomerDetallePedidoCreateView from '../../features/customer-detallepedido/page/CustomerDetallePedidoCreateView'
import CustomerRestaurantMapView from '../../features/customer-mapa/page/CustomerRestaurantMapView'
import CustomerMapaGeneralView from '../../features/customer-mapa/page/CustomerMapaGeneralView'
import CustomerFacturaView from '../../features/customer-factura/page/CustomerFacturaView'
import CustomerFacturaPrintView from '../../features/customer-factura/page/CustomerFacturaPrintView'

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
  // Rutas principales protegidas (ADMIN)
  {
    path: '/loby',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
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
        path: 'recipes',
        element: <RecipesPage />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
      },
      {
        path: 'detallePedidos',
        element: <DetallePedidosPage />,
      },
      {
        path: 'events',
        element: <EventsPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'fields',
        element: <FieldsPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'inventory',
        element: (
          <ProtectedRoute requiredRole={'ADMIN'}>
            <InventoryPage />
          </ProtectedRoute>
        ),
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
        path: 'restaurants/:id/tables',
        element: <RestaurantTablesPage />,
      },
      {
        path: 'restaurants/:id/reviews',
        element: <ReviewPage />,
      },
      {
        path: 'reservations',
        element: <ReservationsPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'mapa-de-sedes',
        element: <MapaDeSedePage />,
      },
    ],
  },
  // Rutas cliente protegidas por rol CLIENTE
  {
    path: '/customer',
    element: (
      <ProtectedRoute requiredRole={'CLIENTE'}>
        <CustomerMainLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <CustomerLobbyPage />,
      },
      {
        path: 'menu',
        element: <CustomerMenuView />,
      },
      {
        path: 'restaurants',
        element: <CustomerRestaurantView />,
      },
      {
        path: 'restaurants/:restaurantId/menu',
        element: <CustomerRestaurantMenuView />,
      },
      {
        path: 'restaurants/:restaurantId/map',
        element: <CustomerRestaurantMapView />,
      },
      {
        path: 'mapa-general',
        element: <CustomerMapaGeneralView />,
      },
      {
        path: 'restaurants/:restaurantId/orders/new',
        element: <CustomerOrderCreateView />,
      },
      {
        path: 'orders',
        element: <CustomerOrdersView />,
      },
      {
        path: 'factura',
        element: <CustomerFacturaView />,
      },
      {
        path: 'factura/print',
        element: <CustomerFacturaPrintView />,
      },
      {
        path: 'orders/:orderId/details',
        element: <CustomerDetallePedidoCreateView />,
      },
      {
        path: 'orders/new',
        element: <CustomerOrderCreateView />,
      },
      {
        path: 'reservations',
        element: <CustomerReservationView />,
      },
      {
        path: 'reservations/new',
        element: <CustomerReservationCreateView />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'tables',
        element: <TablesPage />,
      },
      {
        path: 'coupons',
        element: <CouponPage />,
      },
    ],
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
    errorElement: <ErrorBoundary />,
  },
  // 404 fallback - Debe estar al final
  {
    path: '*',
    element: <NotFoundPage />,
    errorElement: <ErrorBoundary />,
  },
])

export default router
