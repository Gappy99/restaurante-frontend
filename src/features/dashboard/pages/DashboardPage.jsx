import useAuthStore from '../../../shared/stores/useAuthStore'

/**
 * Página de Dashboard
 */
const DashboardPage = () => {
  const { user } = useAuthStore()

  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--text)] mb-8">Dashboard</h1>

      <div className="bg-[var(--surface)] rounded-lg shadow p-6 border border-[var(--accent-soft)]">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
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
 * Componente de item de información
 */
const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[var(--muted)] text-sm">{label}</p>
    <p className="text-[var(--text)] font-semibold">{value}</p>
  </div>
)

export default DashboardPage
