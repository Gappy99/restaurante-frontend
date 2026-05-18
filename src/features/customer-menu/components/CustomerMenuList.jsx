import PropTypes from 'prop-types'
import CustomerMenuCard from './CustomerMenuCard'

export default function CustomerMenuList({ menus, loading, onView }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#7F532C] border-t-[#FCF0CA]" />
        <p className="text-xs font-mono uppercase tracking-[0.35em] text-[#F5D9A5]/80">Cargando menú del cliente...</p>
      </div>
    )
  }

  if (!Array.isArray(menus) || menus.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[#FCF0CA]/20 bg-black/20 px-6 py-16 text-center">
        <p className="text-lg font-bold text-[#FCF0CA]">No hay menús disponibles</p>
        <p className="mt-2 text-sm text-[#F5D9A5]/70">
          Revisa que el backend esté devolviendo registros en el endpoint de menús.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {menus.map((menu) => (
        <CustomerMenuCard
          key={menu._id || menu.id}
          menu={menu}
          onView={onView}
        />
      ))}
    </div>
  )
}

CustomerMenuList.propTypes = {
  menus: PropTypes.array,
  loading: PropTypes.bool,
  onView: PropTypes.func.isRequired,
}
