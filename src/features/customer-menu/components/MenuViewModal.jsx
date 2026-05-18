import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { getDishByIdService } from '../../dishes/services/DishService'
import { getBeverageByIdService } from '../../beverages/services/BeverageService'
import { getDishesByRestaurantService } from '../../dishes/services/DishService'
import { getBeveragesByRestaurantService } from '../../beverages/services/BeverageService'
import { restaurantService } from '../../restaurant/services/restaurantService'

export const MenuViewModal = ({ isOpen, onClose, menu }) => {
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [resolvedDishes, setResolvedDishes] = useState([])
    const [resolvedBeverages, setResolvedBeverages] = useState([])
    const [restaurantName, setRestaurantName] = useState('')

    const menuName = menu?.Menu_Plate || menu?.name || "Sin nombre"
    const menuDescription = menu?.Menu_description_plate || menu?.description || "Sin descripción"
    const menuPromotion = menu?.Menu_Promotion || menu?.promotion || "Sin promoción"
    const isAvailable = menu?.Menu_available ?? menu?.available ?? true

    const normalizeItems = (items) => (Array.isArray(items) ? items : [])
    const resolveMenuKey = () => menu?.Menu_id || menu?.menu_id || menu?._id || menu?.id || null

    const extractItems = (payload) => {
        if (Array.isArray(payload)) return payload
        if (Array.isArray(payload?.data)) return payload.data
        if (Array.isArray(payload?.items)) return payload.items
        if (Array.isArray(payload?.dishes)) return payload.dishes
        if (Array.isArray(payload?.beverages)) return payload.beverages
        return []
    }

    const filterByMenuKey = (items, menuKey) => {
        if (!menuKey) return items
        return items.filter((item) => {
            const itemMenuKey = item?.Menu_id || item?.menu_id || item?.MenuId || item?.menuId || null
            return itemMenuKey == menuKey
        })
    }

    useEffect(() => {
        const loadDetails = async () => {
            if (!isOpen || !menu) return

            const menuKey = resolveMenuKey()
            const restaurantId = menu?.Restaurant_id || menu?.restaurant_id || null

            // Inicializar nombre de restaurante desde el menu si ya viene incluido
            setRestaurantName(
                menu?.Restaurant_name || menu?.restaurant?.name || menu?.restaurant_name || menu?.restaurantName || ''
            )

            const dishes = normalizeItems(menu.dishes)
            const beverages = normalizeItems(menu.beverages)

            let resolvedDishSources = dishes
            let resolvedBeverageSources = beverages

            if ((resolvedDishSources.length === 0 || resolvedBeverageSources.length === 0) && restaurantId) {
                try {
                    const [restaurantDishResponse, restaurantBeverageResponse] = await Promise.all([
                        getDishesByRestaurantService(restaurantId),
                        getBeveragesByRestaurantService(restaurantId),
                    ])

                    const restaurantDishes = filterByMenuKey(extractItems(restaurantDishResponse), menuKey)
                    const restaurantBeverages = filterByMenuKey(extractItems(restaurantBeverageResponse), menuKey)

                    if (resolvedDishSources.length === 0 && restaurantDishes.length > 0) {
                        resolvedDishSources = restaurantDishes
                    }

                    if (resolvedBeverageSources.length === 0 && restaurantBeverages.length > 0) {
                        resolvedBeverageSources = restaurantBeverages
                    }
                } catch {
                    // Fallback
                }
            }

            // Si no obtenemos el nombre desde el objeto `menu`, intentamos pedir el restaurante por id
            if (!menu?.Restaurant_name && !menu?.restaurant?.name && restaurantId) {
                try {
                    const r = await restaurantService.getRestaurantById(restaurantId)
                    if (r?.success && r.data) {
                        const maybeName = r.data?.name || r.data?.Restaurant_name || r.data?.restaurant_name || r.data?.restaurant?.name || r.data?.restaurantName || ''
                        if (maybeName) setRestaurantName(maybeName)
                    }
                } catch {
                    // ignore
                }
            }

            const dishDetails = await Promise.all(
                resolvedDishSources.map(async (dish) => {
                    if (dish && typeof dish === 'object') return dish
                    try {
                        const response = await getDishByIdService(dish)
                        return response?.data || response || { _id: dish, Menu_Plate: `Platillo ${dish}` }
                    } catch {
                        return { _id: dish, Menu_Plate: `Platillo ${dish}` }
                    }
                })
            )

            const beverageDetails = await Promise.all(
                resolvedBeverageSources.map(async (beverage) => {
                    if (beverage && typeof beverage === 'object') return beverage
                    try {
                        const response = await getBeverageByIdService(beverage)
                        return response?.data || response || { _id: beverage, Menu_Drink: `Bebida ${beverage}` }
                    } catch {
                        return { _id: beverage, Menu_Drink: `Bebida ${beverage}` }
                    }
                })
            )

            setResolvedDishes(dishDetails)
            setResolvedBeverages(beverageDetails)
            setLoadingDetails(false)
        }

        if (!isOpen || !menu) {
            setResolvedDishes([])
            setResolvedBeverages([])
            setRestaurantName('')
            return
        }

        setLoadingDetails(true)
        loadDetails()
    }, [isOpen, menu])

    const filteredDishes = resolvedDishes
    const filteredBeverages = resolvedBeverages

    if (!isOpen || !menu) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 px-4 py-6 font-serif">
            {/* Contenedor Principal Estilo Carta de Restaurante Clásico */}
            <div className="bg-[#ffffff] text-[#111827] rounded-none shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-8 md:p-12 relative border-8 border-[#111827] outline outline-1 outline-offset-[-12px] outline-[#111827]/40">
                
                {/* Botón de cerrar elegante arriba a la derecha */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-xs tracking-widest uppercase border border-[#111827]/30 px-3 py-1 hover:bg-[#111827] hover:text-[#ffffff] transition font-sans"
                >
                    [ Cerrar ]
                </button>

                {/* Encabezado Principal */}
                <header className="text-center max-w-xl mx-auto mb-12 border-b border-[#111827]/20 pb-8">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-[#111827]/60 block mb-3">
                        {isAvailable ? 'Disponible para servicio' : 'No disponible temporalmente'}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-normal tracking-wide uppercase font-serif mb-3 text-[#111827]">
                        {menuName}
                    </h2>
                    {restaurantName && (
                        <p className="text-sm font-sans text-[#111827]/80 uppercase tracking-wider mb-2">
                            {restaurantName}
                        </p>
                    )}
                    <p className="text-sm italic text-[#111827]/70 leading-relaxed font-serif">
                        {menuDescription}
                    </p>
                    {menuPromotion && menuPromotion !== "Sin promoción" && (
                        <span className="inline-block mt-4 text-xs font-sans uppercase tracking-widest bg-[#111827] text-[#ffffff] px-4 py-1">
                            Especial: {menuPromotion}
                        </span>
                    )}
                    
                </header>

                {loadingDetails ? (
                    <div className="py-20 text-center text-sm tracking-widest uppercase font-sans text-[#111827]/60">
                        Generando la carta de menús...
                    </div>
                ) : (
                    /* Layout de Doble Columna (Izquierda: Comida / Derecha: Bebidas) al estilo de la foto */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 relative">
                        
                        {/* Línea divisoria central decorativa para pantallas grandes */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#111827]/10 -translate-x-1/2" />

                        {/* COLUMNA IZQUIERDA: PLATILLOS */}
                        <section className="space-y-8">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-normal uppercase tracking-wider border-b-2 border-[#111827] inline-block pb-1 px-6">
                                    Food Menu
                                </h3>
                            </div>

                            {filteredDishes.length > 0 ? (
                                <div className="space-y-6">
                                    {filteredDishes.map((dish, idx) => {
                                        const dishName = dish.Menu_Plate || dish.name || 'Sin nombre'
                                        const dishPrice = dish.Menu_Price ?? dish.price ?? 0
                                        const dishType = dish.Menu_type_plate || dish.type || 'General'
                                        const dishDescription = dish.Menu_description_plate || dish.description || ''

                                        return (
                                            <article key={idx} className="group">
                                                {/* Fila Título y Precio unidos por una estética limpia */}
                                                <div className="flex justify-between items-baseline gap-2">
                                                    <h4 className="font-bold text-base uppercase tracking-wide text-[#111827]">
                                                        {dishName}
                                                        <span className="ml-2 font-sans font-normal text-[10px] text-stone-500 lowercase italic border border-stone-300 px-1 rounded-sm">
                                                            {dishType}
                                                        </span>
                                                    </h4>
                                                    <span className="font-bold text-base font-serif text-[#111827]">
                                                        Q{dishPrice}
                                                    </span>
                                                </div>
                                                {/* Descripción en cursiva tipo menú parisino */}
                                                {dishDescription && (
                                                    <p className="text-xs text-[#111827]/60 italic mt-1 font-serif leading-relaxed">
                                                        {dishDescription}
                                                    </p>
                                                )}
                                            </article>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="text-center text-xs italic text-[#111827]/40 py-4">No hay platillos en esta sección.</p>
                            )}
                        </section>

                        {/* COLUMNA DERECHA: BEBIDAS */}
                        <section className="space-y-8">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-normal uppercase tracking-wider border-b-2 border-[#111827] inline-block pb-1 px-6">
                                    Drinks Menu
                                </h3>
                            </div>

                            {filteredBeverages.length > 0 ? (
                                <div className="space-y-6">
                                    {filteredBeverages.map((beverage, idx) => {
                                        const bevName = beverage.Menu_Drink || beverage.name || 'Sin nombre'
                                        const bevPrice = beverage.Menu_Price ?? beverage.price ?? 0
                                        const bevType = beverage.Menu_type_drink || beverage.type || 'General'
                                        const bevDescription = beverage.Menu_description_drink || beverage.description || ''

                                        return (
                                            <article key={idx} className="group">
                                                <div className="flex justify-between items-baseline gap-2">
                                                    <h4 className="font-bold text-base uppercase tracking-wide text-[#111827]">
                                                        {bevName}
                                                        <span className="ml-2 font-sans font-normal text-[10px] text-stone-500 lowercase italic border border-stone-300 px-1 rounded-sm">
                                                            {bevType}
                                                        </span>
                                                    </h4>
                                                    <span className="font-bold text-base font-serif text-[#111827]">
                                                        Q{bevPrice}
                                                    </span>
                                                </div>
                                                {bevDescription && (
                                                    <p className="text-xs text-[#111827]/60 italic mt-1 font-serif leading-relaxed">
                                                        {bevDescription}
                                                    </p>
                                                )}
                                            </article>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="text-center text-xs italic text-[#111827]/40 py-4">No hay bebidas en esta sección.</p>
                            )}
                        </section>

                    </div>
                )}

                {/* Footer Decorativo */}
                <footer className="mt-16 pt-6 border-t border-[#111827]/10 text-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#111827]/50">
                        Gracias por su preferencia
                    </p>
                    <button
                        onClick={onClose}
                        className="mt-6 font-sans text-xs font-bold uppercase tracking-widest bg-[#111827] text-[#ffffff] px-8 py-3 hover:bg-[#111827]/80 transition md:hidden w-full"
                    >
                        Cerrar Menú
                    </button>
                </footer>

            </div>
        </div>
    );
};

MenuViewModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    menu: PropTypes.object
}