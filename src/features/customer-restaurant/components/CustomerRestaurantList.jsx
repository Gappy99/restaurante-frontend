import PropTypes from 'prop-types'
import CustomerRestaurantCard from './CustomerRestaurantCard'
import { RiStore2Line } from 'react-icons/ri'

export default function CustomerRestaurantList({ restaurants, loading, onView }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-[#6b7280] border-t-[#f8fafc] rounded-full animate-spin"></div>
        <p className="text-[#9ca3af] font-mono text-sm">Cargando restaurantes...</p>
      </div>
    )
  }

  if (!Array.isArray(restaurants) || restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#1f2937]/10 rounded-[3rem] border-2 border-dashed border-[#6b7280]/30 text-center">
        <RiStore2Line className="text-5xl mb-6 opacity-50" aria-hidden="true" />
        <h3 className="text-[#f8fafc] text-xl font-bold uppercase tracking-widest">No hay restaurantes</h3>
        <p className="text-[#9ca3af] mt-2 max-w-xs font-light italic">No se encontraron restaurantes disponibles.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {restaurants.map((r) => (
        <CustomerRestaurantCard key={r._id || r.id} restaurant={r} onView={onView} />
      ))}
    </div>
  )
}

CustomerRestaurantList.propTypes = {
  restaurants: PropTypes.array,
  loading: PropTypes.bool,
  onView: PropTypes.func.isRequired,
}
