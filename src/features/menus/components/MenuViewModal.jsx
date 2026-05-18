import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { getDishByIdService } from '../../dishes/services/DishService'
import { getBeverageByIdService } from '../../beverages/services/BeverageService'
import { getDishesByRestaurantService } from '../../dishes/services/DishService'
import { getBeveragesByRestaurantService } from '../../beverages/services/BeverageService'
import { FiCoffee } from 'react-icons/fi'
import { FiCheckCircle, FiXCircle, FiBookOpen } from 'react-icons/fi'

export const MenuViewModal = ({ isOpen, onClose, menu }) => {
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [resolvedDishes, setResolvedDishes] = useState([])
    const [resolvedBeverages, setResolvedBeverages] = useState([])

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
                    // If fallback loading fails, keep the original menu data.
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
            return
        }

        setLoadingDetails(true)
        loadDetails()
    }, [isOpen, menu])

    if (!isOpen || !menu) return null;

    return (
        <div className="fixed inset-0 bg-[#111111]/60 backdrop-blur-sm flex justify-center items-center z-50 px-3">
            <div className="bg-[#FFFFFF] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#f8fafc]">
                
                {/* Cabecera */}
                <div className="sticky top-0 p-6 text-white bg-[#1f2937] border-b border-[#f8fafc]">
                    <h2 className="text-3xl font-bold">{menuName}</h2>
                    <p className="text-sm opacity-90 mt-1">{menuDescription}</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Información del Menú */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[#f8fafc]/40 rounded-xl">
                            <p className="text-xs font-bold text-[#6b7280] uppercase">Promoción</p>
                            <p className="text-[#111111] font-semibold mt-1">{menuPromotion}</p>
                        </div>
                        <div className="p-4 bg-[#f8fafc]/40 rounded-xl">
                            <p className="text-xs font-bold text-[#6b7280] uppercase">Estado</p>
                            <p className={`font-semibold mt-1 ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                {isAvailable ? <><FiCheckCircle className="inline mr-1" aria-hidden="true" />Disponible</> : <><FiXCircle className="inline mr-1" aria-hidden="true" />No disponible</>}
                            </p>
                        </div>
                    </div>

                    {/* PLATILLOS */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <FiBookOpen className="text-2xl" aria-hidden="true" />
                            <h3 className="text-xl font-bold text-[#111111]">
                                Platillos ({resolvedDishes.length})
                            </h3>
                        </div>
                        
                        {loadingDetails ? (
                            <div className="p-4 bg-gray-100 rounded-xl text-center text-gray-500">
                                Cargando platillos...
                            </div>
                        ) : resolvedDishes.length > 0 ? (
                            <div className="space-y-3">
                                {resolvedDishes.map((dish, idx) => {
                                    const dishName = dish.Menu_Plate || dish.name || 'Sin nombre'
                                    const dishPrice = dish.Menu_Price ?? dish.price ?? 0
                                    const dishType = dish.Menu_type_plate || dish.type || 'General'
                                    const dishDescription = dish.Menu_description_plate || dish.description || 'Sin descripción'
                                    const dishAvailable = dish.Menu_available ?? dish.available ?? true

                                    return (
                                        <div 
                                            key={idx} 
                                            className="p-4 border-2 border-[#f8fafc] rounded-2xl hover:bg-[#f8fafc]/20 transition"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-[#111111] text-lg">{dishName}</h4>
                                                    <span className="text-xs bg-[#6b7280]/10 text-[#6b7280] px-2 py-1 rounded mt-1 inline-block">
                                                        {dishType}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-[#1f2937]">Q{dishPrice}</p>
                                                    <p className={`text-xs font-semibold ${dishAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                                        {dishAvailable ? 'Disponible' : 'No disponible'}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600">{dishDescription}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-100 rounded-xl text-center text-gray-500">
                                No hay platillos registrados
                            </div>
                        )}
                    </div>

                    {/* BEBIDAS */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <FiCoffee className="text-2xl" aria-hidden="true" />
                            <h3 className="text-xl font-bold text-[#111111]">
                                Bebidas ({resolvedBeverages.length})
                            </h3>
                        </div>
                        
                        {loadingDetails ? (
                            <div className="p-4 bg-gray-100 rounded-xl text-center text-gray-500">
                                Cargando bebidas...
                            </div>
                        ) : resolvedBeverages.length > 0 ? (
                            <div className="space-y-3">
                                {resolvedBeverages.map((beverage, idx) => {
                                    const bevName = beverage.Menu_Drink || beverage.name || 'Sin nombre'
                                    const bevPrice = beverage.Menu_Price ?? beverage.price ?? 0
                                    const bevType = beverage.Menu_type_drink || beverage.type || 'General'
                                    const bevDescription = beverage.Menu_description_drink || beverage.description || 'Sin descripción'
                                    const bevAvailable = beverage.Menu_available ?? beverage.available ?? true

                                    return (
                                        <div 
                                            key={idx} 
                                            className="p-4 border-2 border-[#f8fafc] rounded-2xl hover:bg-[#f8fafc]/20 transition"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-[#111111] text-lg">{bevName}</h4>
                                                    <span className="text-xs bg-[#6b7280]/10 text-[#6b7280] px-2 py-1 rounded mt-1 inline-block">
                                                        {bevType}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-[#1f2937]">Q{bevPrice}</p>
                                                    <p className={`text-xs font-semibold ${bevAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                                        {bevAvailable ? 'Disponible' : 'No disponible'}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600">{bevDescription}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-100 rounded-xl text-center text-gray-500">
                                No hay bebidas registradas
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 p-6 bg-[#f8fafc]/40 border-t border-[#f8fafc] flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-[#6b7280] bg-[#f8fafc] hover:bg-[#9ca3af] hover:text-white transition"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

MenuViewModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    menu: PropTypes.object,
}

MenuViewModal.defaultProps = {
    menu: null,
}
