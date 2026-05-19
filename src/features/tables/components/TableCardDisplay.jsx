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
		<div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/90 shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-black/40 group">
			<span className="absolute left-0 top-8 h-full w-[3px] rounded-r-full bg-slate-500/70" aria-hidden="true" />
			<div className="relative overflow-hidden h-32 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center">
				<div className="text-center z-10">
					<div className="text-white text-6xl font-[900] mb-2">{table.table_number}</div>
					<div className="text-slate-200 text-sm font-medium italic">{table.table_name}</div>
				</div>
				<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
			</div>

			<div className="relative p-6 bg-slate-950 text-slate-100">
				<div className="flex flex-wrap justify-between items-start gap-2 mb-4">
					<span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300 ring-1 ring-emerald-500/20">
						<span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" aria-hidden="true" />
						{getTableStatusLabel(table.estado)}
					</span>
					<span className="inline-flex rounded-full bg-slate-800/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-200 ring-1 ring-slate-600/40">
						{getTableStateLabel(table.table_state)}
					</span>
				</div>

				<div className="space-y-3 border-t border-slate-700/60 pt-4 text-sm text-slate-300">
					<p className="flex items-center gap-2"><FiMapPin className="text-slate-400" aria-hidden="true" /> {table.table_ubication}</p>
					<p className="flex items-center gap-2"><FiUsers className="text-slate-400" aria-hidden="true" /> Capacidad: {table.table_capacity} personas</p>
					<p className="flex items-center gap-2"><FiClock className="text-slate-400" aria-hidden="true" /> {table.table_time_available || 'Sin horario especificado'}</p>
					<p className="flex items-center gap-2 font-semibold text-slate-100"><RiStore2Line className="text-slate-400" aria-hidden="true" /> {getTableRestaurantLabel(table)}</p>
				</div>
			</div>
		</div>
	)
}

export default TableCardDisplay
