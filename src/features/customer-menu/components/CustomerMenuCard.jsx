import PropTypes from 'prop-types'

export default function CustomerMenuCard({ menu, onView }) {
  const menuName = menu.Menu_Plate || menu.name || 'Sin nombre'
  const menuDescription = menu.Menu_description_plate || menu.description || 'Sin descripción disponible.'
  const isAvailable = menu.Menu_available ?? menu.available ?? true

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#FCF0CA]/10 bg-black/30 shadow-lg shadow-black/20 transition-transform duration-300 hover:-translate-y-1 hover:border-[#FCF0CA]/25">
      <div className="relative min-h-44 bg-gradient-to-br from-[#7F532C] via-[#5B300E] to-[#2E160C] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#F5D9A5]/70">Menú disponible</p>
            <h2 className="mt-3 text-2xl font-black leading-tight text-[#FCF0CA]">{menuName}</h2>
          </div>
          <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] ${isAvailable ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-red-400/40 bg-red-400/10 text-red-200'}`}>
            {isAvailable ? 'Disponible' : 'No disponible'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="line-clamp-4 text-sm leading-6 text-[#F5D9A5]/80">{menuDescription}</p>

        <button
          type="button"
          onClick={() => onView(menu)}
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#FCF0CA] px-5 py-3 text-sm font-black uppercase tracking-[0.25em] text-[#5B300E] transition hover:bg-white"
        >
          Ver detalles
        </button>
      </div>
    </article>
  )
}

CustomerMenuCard.propTypes = {
  menu: PropTypes.object.isRequired,
  onView: PropTypes.func.isRequired,
}
