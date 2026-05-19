const formatStatistics = (statistics) => {
  if (!statistics || typeof statistics !== 'object') {
    return []
  }

  return Object.entries(statistics).filter(([, value]) => value !== undefined && value !== null && value !== '')
}

const InformationCard = ({ information, restaurantName, onEdit, onDelete }) => {
  const statistics = formatStatistics(information.statistics)

  return (
    <article className="relative overflow-hidden rounded-3xl border border-[var(--accent-soft)] bg-[var(--surface)] shadow-lg transition hover:shadow-2xl pl-6">
      <span className="absolute left-0 top-6 h-full w-[3px] rounded-r-full bg-slate-900/20" aria-hidden="true" />
      <span
        className="absolute top-0 left-0 h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #1e293b, #475569, #cbd5e1)' }}
        aria-hidden="true"
      />
      <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] p-5 text-[var(--surface)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
              {information.type || 'General'}
            </span>
            <h3 className="mt-3 text-2xl font-[900] leading-tight tracking-[-0.3px]">
              {information.title}
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <p className="text-sm leading-6 text-[var(--text)]">
          {information.information}
        </p>

        <div className="grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
          <InfoValue label="Restaurante" value={restaurantName || 'No disponible'} />
          <InfoValue label="Estado" value={information.estado ? 'Activo' : 'Inactivo'} />
          <InfoValue label="Usuario" value={information.usuario?.nombre || information.usuario?.email || 'No disponible'} />
          <InfoValue
            label="Creado"
            value={information.createdAt ? new Date(information.createdAt).toLocaleString('es-CO') : 'No disponible'}
          />
        </div>

        {statistics.length > 0 && (
          <section className="space-y-3 rounded-2xl border border-[var(--accent-soft)] bg-[var(--bg)] p-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Estadísticas
            </h4>
            <div className="flex flex-wrap gap-2">
              {statistics.map(([key, value]) => (
                <span key={key} className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--text)]">
                  {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              ))}
            </div>
          </section>
        )}

        {statistics.length === 0 && information.statistics && (
          <section className="rounded-2xl border border-[var(--accent-soft)] bg-[var(--bg)] p-4 text-sm text-[var(--muted)]">
            <p className="font-semibold text-[var(--text)]">Estadísticas</p>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-xs">
              {JSON.stringify(information.statistics, null, 2)}
            </pre>
          </section>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onEdit(information)}
            className="flex-1 rounded-xl bg-[var(--primary)] px-4 py-2.5 font-medium text-[var(--surface)] transition hover:bg-[#000000]"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(information._id || information.id)}
            className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-2.5 font-medium text-[var(--surface)] transition hover:bg-[#4b5563]"
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  )
}

const InfoValue = ({ label, value }) => (
  <div className="relative overflow-hidden rounded-2xl border border-[var(--accent-soft)] bg-[var(--bg)] p-4 pl-6">
    <span className="absolute left-0 top-0 h-full w-[3px] rounded-r-full bg-slate-900/20" aria-hidden="true" />
    <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] flex items-center gap-2">
      {label}
      {label === 'Estado' && value === 'Activo' ? (
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#22c55e] shadow-sm" aria-hidden="true" />
      ) : null}
    </p>
    <p className="mt-1 font-semibold text-[var(--text)]">{value || 'No disponible'}</p>
  </div>
)

export default InformationCard
