import { useEffect, useState } from 'react'
import useUserStore from '../../../shared/stores/useUserStore'
import useAuthStore from '../../../shared/stores/useAuthStore'

/**
 * Página de Dashboard
 */
const DashboardPage = () => {
  const { user } = useAuthStore()
  const { users } = useUserStore()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    revenue: 0,
  })

  useEffect(() => {
    // Simular carga de estadísticas
    setStats({
      totalUsers: users.length || 42,
      activeUsers: Math.floor((users.length || 42) * 0.75),
      totalOrders: 156,
      revenue: 45230,
    })
  }, [users.length])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Usuarios"
          value={stats.totalUsers}
          icon="👥"
          color="bg-blue-500"
        />
        <StatCard
          title="Usuarios Activos"
          value={stats.activeUsers}
          icon="✓"
          color="bg-green-500"
        />
        <StatCard
          title="Órdenes"
          value={stats.totalOrders}
          icon="🛒"
          color="bg-yellow-500"
        />
        <StatCard
          title="Ingresos"
          value={`$${stats.revenue.toLocaleString()}`}
          icon="💰"
          color="bg-purple-500"
        />
      </div>

      {/* Información adicional */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Información del Usuario
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Nombre" value={user?.nombre || 'N/A'} />
          <InfoItem label="Email" value={user?.email || 'N/A'} />
          <InfoItem label="Rol" value={user?.rol || 'N/A'} />
          <InfoItem label="Teléfono" value={user?.telefono || 'N/A'} />
        </div>
      </div>
    </div>
  )
}

/**
 * Componente de tarjeta de estadística
 */
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${color} text-white text-4xl rounded-full w-16 h-16 flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
)

/**
 * Componente de item de información
 */
const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-gray-600 text-sm">{label}</p>
    <p className="text-gray-900 font-semibold">{value}</p>
  </div>
)

export default DashboardPage
