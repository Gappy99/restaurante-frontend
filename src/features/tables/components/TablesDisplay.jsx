import TableCardDisplay from './TableCardDisplay.jsx'

/* eslint-disable react/prop-types */
const TablesDisplay = ({ tables, loading }) => {
	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<div className="inline-block animate-spin">
						<div className="w-12 h-12 border-4 border-[#7F532C] border-t-[#FCF0CA] rounded-full"></div>
					</div>
					<p className="text-[#946841] mt-4 font-medium">Cargando mesas...</p>
				</div>
			</div>
		)
	}

	if (!tables || tables.length === 0) {
		return (
			<div className="flex items-center justify-center py-24">
				<div className="text-center">
					<div className="text-6xl mb-4">🪑</div>
					<h3 className="text-[#FCF0CA] text-xl font-bold mb-2">No hay mesas registradas</h3>
					<p className="text-[#946841]">No hay mesas disponibles en el listado general</p>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-bold text-[#FCF0CA]">Mesas ({tables.length})</h2>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{tables.map((table) => (
					<TableCardDisplay
						key={table._id || table.id}
						table={table}
					/>
				))}
			</div>
		</div>
	)
}

export default TablesDisplay
