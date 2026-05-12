import {
	getTableRestaurantLabel,
	getTableStateLabel,
	getTableStatusLabel,
} from '../utils/tableUtils.js'

/* eslint-disable react/prop-types */
const TableCardDisplay = ({ table }) => {
	return (
		<div className="bg-[#946841]/30 backdrop-blur-md border border-[#946841]/60 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-black/60 transition-all duration-500 group">
			{/* Sección superior con número de mesa */}
			<div className="relative h-32 overflow-hidden bg-[#946841] flex items-center justify-center">
				<div className="text-center">
					<div className="text-white text-6xl font-bold mb-2">{table.table_number}</div>
					<div className="text-white text-sm font-medium italic">{table.table_name}</div>
				</div>
				<div className="absolute inset-0 bg-gradient-to-t from-[#946841] via-transparent to-transparent opacity-70" />
			</div>

			{/* Contenido */}
			<div className="p-6 bg-[#FCF0CA]">
				<div className="flex justify-between items-start mb-4 gap-2">
					<span className="bg-[#946841] text-[#FCF0CA] text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter">
						{getTableStatusLabel(table.estado)}
					</span>
					<span className="bg-[#946841]/50 border border-[#946841] text-[#000000] text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter">
						{getTableStateLabel(table.table_state)}
					</span>
				</div>

				<div className="space-y-2 text-sm text-black font-light border-t border-[#946841]/20 pt-4">
					<p><span className="text-[#946841] mr-1">📍</span> {table.table_ubication}</p>
					<p><span className="text-[#946841] mr-1">👥</span> Capacidad: {table.table_capacity} personas</p>
					<p><span className="text-[#946841] mr-1">🕒</span> {table.table_time_available || 'Sin horario especificado'}</p>
					<p className="text-black font-semibold"><span className="text-[#946841] mr-1">🏪</span> {getTableRestaurantLabel(table)}</p>
				</div>
			</div>
		</div>
	)
}

export default TableCardDisplay
