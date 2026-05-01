import RestaurantCard from './RestaurantCard.jsx'

/* eslint-disable react/prop-types */
const Restaurants = ({ restaurants, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-[#7F532C] border-t-[#FCF0CA] rounded-full animate-spin"></div>
        <p className="text-[#946841] font-mono text-sm animate-pulse">CARGANDO BASE DE DATOS...</p>
      </div>
    )
  }

  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#5B300E]/10 rounded-[3rem] border-2 border-dashed border-[#7F532C]/30 text-center">
        <div className="text-5xl mb-6 grayscale opacity-50">🏪</div>
        <h3 className="text-[#FCF0CA] text-xl font-bold uppercase tracking-widest">No hay registros</h3>
        <p className="text-[#946841] mt-2 max-w-xs font-light italic">
          Tu catálogo de restaurantes está vacío. Agrega uno nuevo para comenzar la gestión.
        </p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-[#FCF0CA] text-2xl font-black uppercase tracking-tighter italic">
          Listado Principal
        </h2>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-[#7F532C] to-transparent opacity-30"></div>
        <span className="text-[#946841] text-xs font-mono">
          TOTAL: {restaurants.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant._id}
            restaurant={restaurant}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

export default Restaurants