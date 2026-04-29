import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

const RestaurantCard = ({ restaurant, onEdit, onDelete }) => {
  return (
    <div className="bg-[var(--surface)] rounded-3xl border border-[var(--accent-soft)] shadow-lg overflow-hidden hover:shadow-2xl transition">
      <img
        src={restaurant.logo}
        alt={restaurant.nombre}
        className="h-52 w-full object-cover"
      />
      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-2xl font-semibold text-[var(--text)]">{restaurant.nombre}</h3>
          <p className="text-sm text-[var(--muted)] mt-1">{restaurant.descripcion}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge>{restaurant.categoria}</Badge>
          <Badge>{restaurant.tipoCocina}</Badge>
          <Badge>{restaurant.ciudad}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-[var(--muted)]">
          <InfoValue label="Teléfono" value={restaurant.telefono} />
          <InfoValue label="Pedidos online" value={restaurant.pedidosOnline ? 'Sí' : 'No'} />
        </div>

        <p className="text-sm text-[var(--muted)] mt-2 truncate">ID: {restaurant._id}</p>

        <div className="flex flex-col gap-3 mt-5">
          <div className="flex gap-3">
            <button
              onClick={() => onEdit(restaurant)}
              className="flex-1 py-2 rounded-lg bg-[var(--primary)] text-[var(--surface)] font-medium hover:bg-[#446b5b] transition"
            >
              ✏️ Editar
            </button>

            <button
              onClick={() => onDelete(restaurant._id)}
              className="flex-1 py-2 rounded-lg bg-[var(--accent)] text-[var(--surface)] font-medium hover:bg-[#8a5c4f] transition"
            >
              🗑️ Eliminar
            </button>
          </div>

          <Link
            to="/menu"
            className="w-full py-2 rounded-lg bg-[var(--primary)] text-[var(--surface)] font-medium text-center hover:bg-[#446b5b] transition"
          >
            🍽 Menú
          </Link>
        </div>
      </div>
    </div>
  )
}

const Badge = ({ children }) => (
  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
    {children}
  </span>
)

const InfoValue = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
    <p className="font-semibold text-[var(--text)]">{value}</p>
  </div>
)

RestaurantCard.propTypes = {
  restaurant: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    logo: PropTypes.string,
    nombre: PropTypes.string,
    descripcion: PropTypes.string,
    categoria: PropTypes.string,
    tipoCocina: PropTypes.string,
    ciudad: PropTypes.string,
    telefono: PropTypes.string,
    pedidosOnline: PropTypes.bool,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
}

InfoValue.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default RestaurantCard
