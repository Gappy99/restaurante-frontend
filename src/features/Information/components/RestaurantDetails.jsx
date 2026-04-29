import PropTypes from 'prop-types'

const RestaurantDetails = ({ restaurant, onEdit, onClose }) => {
  if (!restaurant) {
    return (
      <div className="bg-[var(--surface)] rounded-3xl shadow p-8 text-center text-[var(--muted)] border border-[var(--accent-soft)]">
        Selecciona un restaurante para ver su información completa.
      </div>
    )
  }

  return (
    <div className="bg-[var(--surface)] rounded-3xl shadow p-8 space-y-8 border border-[var(--accent-soft)]">
      <div className="flex flex-col lg:flex-row gap-6">
        <img
          src={restaurant.logo}
          alt={restaurant.nombre}
          className="h-56 w-full lg:w-1/3 object-cover rounded-3xl"
        />
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-[var(--text)]">{restaurant.nombre}</h2>
            <p className="text-[var(--muted)] mt-2">{restaurant.descripcion}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--muted)]">
            <InfoItem label="Teléfono" value={restaurant.telefono} />
            <InfoItem label="Email" value={restaurant.email} />
            <InfoItem label="Dirección" value={restaurant.direccion} />
            <InfoItem label="Ciudad" value={restaurant.ciudad} />
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <SectionTitle>Ubicación</SectionTitle>
        <p className="text-[var(--text)]">{restaurant.direccion}</p>
        <p className="text-[var(--text)]">{restaurant.ciudad}</p>
      </section>

      <section className="space-y-4">
        <SectionTitle>Horarios</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[var(--muted)]">
          {Object.entries(restaurant.horarios).map(([dia, horario]) => (
            <div key={dia} className="rounded-2xl bg-[var(--bg)] p-4 border border-[var(--accent-soft)]">
              <p className="font-semibold text-[var(--text)] capitalize">{dia}</p>
              <p>{horario}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Tipo de restaurante</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--muted)]">
          <InfoItem label="Categoría" value={restaurant.categoria} />
          <InfoItem label="Tipo de cocina" value={restaurant.tipoCocina} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Redes sociales</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-[var(--muted)]">
          <SocialLine label="Facebook" value={restaurant.redes.facebook} />
          <SocialLine label="Instagram" value={restaurant.redes.instagram} />
          <SocialLine label="WhatsApp" value={restaurant.redes.whatsapp} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Configuraciones básicas</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--muted)]">
          <InfoItem label="Pedidos online" value={restaurant.pedidosOnline ? 'Sí' : 'No'} />
          <InfoItem label="Delivery" value={restaurant.delivery ? 'Sí' : 'No'} />
          <InfoItem label="Moneda" value={restaurant.moneda} />
          <InfoItem label="Impuestos" value={`${restaurant.impuestos}%`} />
        </div>
      </section>

      <div className="flex flex-wrap gap-3 justify-end">
        <button
          onClick={() => onEdit(restaurant)}
          className="px-5 py-3 bg-[var(--primary)] text-[var(--surface)] rounded-2xl hover:bg-[#446b5b] transition"
        >
          Editar restaurante
        </button>
        <button
          onClick={onClose}
          className="px-5 py-3 bg-[var(--accent-soft)] text-[var(--text)] rounded-2xl hover:bg-[#c1937e] transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

const SectionTitle = ({ children }) => (
  <h3 className="text-xl font-semibold text-[var(--text)]">{children}</h3>
)

const InfoItem = ({ label, value }) => (
  <div className="rounded-2xl bg-[var(--bg)] p-4 border border-[var(--accent-soft)]">
    <p className="text-sm text-[var(--muted)]">{label}</p>
    <p className="font-semibold text-[var(--text)] mt-1">{value || 'No disponible'}</p>
  </div>
)

const SocialLine = ({ label, value }) => (
  <div className="rounded-2xl bg-[var(--bg)] p-4 border border-[var(--accent-soft)]">
    <p className="text-sm text-[var(--muted)]">{label}</p>
    <p className="font-semibold text-[var(--text)] mt-1">
      {value ? (
        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="text-[var(--primary)] hover:underline">
          {value}
        </a>
      ) : (
        'No disponible'
      )}
    </p>
  </div>
)

RestaurantDetails.propTypes = {
  restaurant: PropTypes.shape({
    _id: PropTypes.string,
    nombre: PropTypes.string,
    descripcion: PropTypes.string,
    logo: PropTypes.string,
    telefono: PropTypes.string,
    email: PropTypes.string,
    direccion: PropTypes.string,
    ciudad: PropTypes.string,
    categoria: PropTypes.string,
    tipoCocina: PropTypes.string,
    redes: PropTypes.shape({
      facebook: PropTypes.string,
      instagram: PropTypes.string,
      whatsapp: PropTypes.string,
    }),
    horarios: PropTypes.object,
    pedidosOnline: PropTypes.bool,
    delivery: PropTypes.bool,
    moneda: PropTypes.string,
    impuestos: PropTypes.number,
  }),
  onEdit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

SectionTitle.propTypes = {
  children: PropTypes.node.isRequired,
}

InfoItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

SocialLine.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
}

export default RestaurantDetails
