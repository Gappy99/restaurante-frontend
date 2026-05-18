import {
	getTableRestaurantLabel,
	getTableStateLabel,
	getTableStatusLabel,
} from '../utils/tableUtils.js'
import { FiClock, FiMapPin, FiUsers } from 'react-icons/fi'
import { RiStore2Line } from 'react-icons/ri'

/* eslint-disable react/prop-types */
const TableCardDisplay = ({ table }) => {
	return (
		<div className="bg-[#9ca3af]/30 backdrop-blur-md border border-[#9ca3af]/60 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-black/60 transition-all duration-500 group">
			{/* Sección superior con número de mesa */}
			<div className="relative h-32 overflow-hidden bg-[#9ca3af] flex items-center justify-center">
				<div className="text-center">
					<div className="text-white text-6xl font-bold mb-2">{table.table_number}</div>
					<div className="text-white text-sm font-medium italic">{table.table_name}</div>
				</div>
				<div className="absolute inset-0 bg-gradient-to-t from-[#9ca3af] via-transparent to-transparent opacity-70" />
			</div>

			{/* Contenido */}
			<div className="p-6 bg-[#f8fafc]">
				<div className="flex justify-between items-start mb-4 gap-2">
					<span className="bg-[#9ca3af] text-[#f8fafc] text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter">
						{getTableStatusLabel(table.estado)}
					</span>
					<span className="bg-[#9ca3af]/50 border border-[#9ca3af] text-[#000000] text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter">
						{getTableStateLabel(table.table_state)}
					</span>
				</div>

				<div className="space-y-2 text-sm text-black font-light border-t border-[#9ca3af]/20 pt-4">
					<p><FiMapPin className="inline text-[#9ca3af] mr-1" aria-hidden="true" /> {table.table_ubication}</p>
					<p><FiUsers className="inline text-[#9ca3af] mr-1" aria-hidden="true" /> Capacidad: {table.table_capacity} personas</p>
					<p><FiClock className="inline text-[#9ca3af] mr-1" aria-hidden="true" /> {table.table_time_available || 'Sin horario especificado'}</p>
					<p className="text-black font-semibold"><RiStore2Line className="inline text-[#9ca3af] mr-1" aria-hidden="true" /> {getTableRestaurantLabel(table)}</p>
				</div>
			</div>
		</div>
	)
}

export default TableCardDisplay
