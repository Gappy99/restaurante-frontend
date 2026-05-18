import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRestaurants } from '../../restaurant/hooks/index.js'
import toast from 'react-hot-toast'

const TablesPage = () => {
	const { restaurants, loading, error, fetchRestaurants } = useRestaurants()
	const [searchTerm, setSearchTerm] = useState('')

	useEffect(() => {
		fetchRestaurants()
	}, [fetchRestaurants])

	useEffect(() => {
		if (error) {
			toast.error(error)
		}
	}, [error])

	const normalizedSearch = searchTerm.trim().toLowerCase()
	const filteredRestaurants = restaurants.filter((restaurant) => {
		if (!normalizedSearch) return true

		const name = (restaurant.restaurant_name || restaurant.name || '').toLowerCase()
		const direction = (restaurant.restaurant_direction || '').toLowerCase()

		return name.includes(normalizedSearch) || direction.includes(normalizedSearch)
	})

	return (
		<div className="min-h-screen bg-[#111111] text-[#f8fafc] p-4 md:p-8 font-sans">

			<header className="max-w-7xl mx-auto mb-12 p-8 rounded-[2.5rem] bg-[#1f2937]/20 border border-[#6b7280]/30 backdrop-blur-xl shadow-2xl shadow-black/40">
				<div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
					<div className="text-center md:text-left">
					<h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-[#f8fafc] via-[#9ca3af] to-[#6b7280] bg-clip-text text-transparent">
						Mesas por Restaurante
					</h1>
					<p className="text-[#9ca3af] mt-2 font-medium tracking-widest text-xs uppercase">Elige un restaurante para administrar su plano de mesas</p>
					</div>

					<div className="relative w-full md:w-96">
						<input
							type="search"
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							placeholder="Buscar restaurante o dirección"
							className="w-full rounded-2xl border border-[#6b7280]/30 bg-[#111111]/80 py-4 pl-12 pr-4 text-[#f8fafc] placeholder:text-[#9ca3af]/80 outline-none transition focus:border-[#f8fafc]/60 focus:ring-2 focus:ring-[#9ca3af]/25"
						/>
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto relative">
				{error && (
					<div className="mb-10 p-5 bg-red-900/20 border border-red-500/40 rounded-2xl text-red-300 text-sm flex items-center gap-3 animate-pulse">

						<span><strong>Estado del Sistema:</strong> {error}</span>
					</div>
				)}

				<section className="relative z-10">
					{loading ? (
						<div className="flex items-center justify-center py-24">
							<div className="text-center">
								<div className="inline-block animate-spin">
									<div className="w-12 h-12 border-4 border-[#6b7280] border-t-[#f8fafc] rounded-full"></div>
								</div>
								<p className="text-[#9ca3af] mt-4 font-medium">Cargando restaurantes...</p>
							</div>
						</div>
					) : filteredRestaurants && filteredRestaurants.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
							{filteredRestaurants.map((restaurant) => (
								<Link
									key={restaurant._id || restaurant.id}
								to={`/loby/restaurants/${restaurant._id || restaurant.id}/tables`}
									className="group rounded-[2rem] border border-[#6b7280]/30 bg-[#1f2937]/20 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#f8fafc]/40 hover:shadow-2xl hover:shadow-black/40"
								>
								<div className="flex items-start gap-4">
									<div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl bg-[#9ca3af]/20 text-2xl">
										<img src={restaurant.restaurant_photo} alt={restaurant.restaurant_name} className="w-full h-full object-cover rounded-2xl" />
									</div>
									<div className="min-w-0 flex-1">
										<h2 className="truncate text-xl font-bold text-[#f8fafc] group-hover:text-white">
											{restaurant.restaurant_name}
										</h2>
										<p className="mt-1 text-sm text-[#9ca3af]">
											{restaurant.restaurant_direction || 'Sin dirección registrada'}
										</p>
										<p className="mt-3 text-sm text-[#f8fafc]/80">
											Haz clic para abrir el plano de mesas de este restaurante.
										</p>
									</div>
								</div>
								</Link>
							))}
						</div>
					) : (
						<div className="flex items-center justify-center py-24">
							<div className="text-center">
								<h3 className="text-[#f8fafc] text-xl font-bold mb-2">No hay restaurantes registrados</h3>
								<p className="text-[#9ca3af]">Crea un restaurante primero para poder administrar sus mesas</p>
							</div>
						</div>
					)}
				</section>

			</main>
		</div>
	)
}

export default TablesPage
