import { useEffect } from 'react'
import { useTables } from '../hooks/index.js'
import { TablesDisplay } from '../components/index.js'
import toast from 'react-hot-toast'

const TablesPage = () => {
	const { tables, loading, error, fetchTables } = useTables()

	useEffect(() => {
		fetchTables()
	}, [fetchTables])

	useEffect(() => {
		if (error) {
			toast.error(error)
		}
	}, [error])

	return (
		<div className="min-h-screen bg-[#2E160C] text-[#FCF0CA] p-4 md:p-8 font-sans">

			<header className="max-w-7xl mx-auto mb-12 p-8 rounded-[2.5rem] bg-[#5B300E]/20 border border-[#7F532C]/30 backdrop-blur-xl shadow-2xl shadow-black/40">
				<div className="text-center md:text-left">
					<h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-[#FCF0CA] via-[#946841] to-[#7F532C] bg-clip-text text-transparent">
						Todas las Mesas
					</h1>
					<p className="text-[#946841] mt-2 font-medium tracking-widest text-xs uppercase">Listado general de mesas</p>
				</div>
			</header>

			<main className="max-w-7xl mx-auto relative">
				{error && (
					<div className="mb-10 p-5 bg-red-900/20 border border-red-500/40 rounded-2xl text-red-300 text-sm flex items-center gap-3 animate-pulse">
						<span className="text-lg">⚠️</span>
						<span><strong>Estado del Sistema:</strong> {error}</span>
					</div>
				)}

				<section className="relative z-10">
					<TablesDisplay
						tables={tables}
						loading={loading}
					/>
				</section>

			</main>
		</div>
	)
}

export default TablesPage
