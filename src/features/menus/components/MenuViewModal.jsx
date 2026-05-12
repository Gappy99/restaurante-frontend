import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { getDishByIdService } from '../../dishes/services/DishService'
import { getBeverageByIdService } from '../../beverages/services/BeverageService'

export const MenuViewModal = ({ isOpen, onClose, menu }) => {
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [resolvedDishes, setResolvedDishes] = useState([])
    const [resolvedBeverages, setResolvedBeverages] = useState([])

    const menuName = menu?.Menu_Plate || menu?.name || "Sin nombre"
    const menuDescription = menu?.Menu_description_plate || menu?.description || "Sin descripción"
    const menuPromotion = menu?.Menu_Promotion || menu?.promotion || "Sin promoción"
    const isAvailable = menu?.Menu_available ?? menu?.available ?? true

    const normalizeItems = (items) => (Array.isArray(items) ? items : [])

    useEffect(() => {
        const loadDetails = async () => {
            if (!isOpen || !menu) return

            const dishes = normalizeItems(menu.dishes)
            const beverages = normalizeItems(menu.beverages)

            const dishDetails = await Promise.all(
                dishes.map(async (dish) => {
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
                beverages.map(async (beverage) => {
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
        <div className="fixed inset-0 bg-[#2E160C]/60 backdrop-blur-sm flex justify-center items-center z-50 px-3">
            <div className="bg-[#FFFFFF] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#FCF0CA]">
                
                {/* Cabecera */}
                <div className="sticky top-0 p-6 text-white bg-[#5B300E] border-b border-[#FCF0CA]">
                    <h2 className="text-3xl font-bold">{menuName}</h2>
                    <p className="text-sm opacity-90 mt-1">{menuDescription}</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Información del Menú */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[#FCF0CA]/40 rounded-xl">
                            <p className="text-xs font-bold text-[#7F532C] uppercase">Promoción</p>
                            <p className="text-[#2E160C] font-semibold mt-1">{menuPromotion}</p>
                        </div>
                        <div className="p-4 bg-[#FCF0CA]/40 rounded-xl">
                            <p className="text-xs font-bold text-[#7F532C] uppercase">Estado</p>
                            <p className={`font-semibold mt-1 ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                {isAvailable ? '✓ Disponible' : '✗ No disponible'}
                            </p>
                        </div>
                    </div>

                    {/* PLATILLOS */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🍲</span>
                            <h3 className="text-xl font-bold text-[#2E160C]">
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
                                            className="p-4 border-2 border-[#FCF0CA] rounded-2xl hover:bg-[#FCF0CA]/20 transition"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-[#2E160C] text-lg">{dishName}</h4>
                                                    <span className="text-xs bg-[#7F532C]/10 text-[#7F532C] px-2 py-1 rounded mt-1 inline-block">
                                                        {dishType}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-[#5B300E]">Q{dishPrice}</p>
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
                            <span className="text-2xl">🥤</span>
                            <h3 className="text-xl font-bold text-[#2E160C]">
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
                                            className="p-4 border-2 border-[#FCF0CA] rounded-2xl hover:bg-[#FCF0CA]/20 transition"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-[#2E160C] text-lg">{bevName}</h4>
                                                    <span className="text-xs bg-[#7F532C]/10 text-[#7F532C] px-2 py-1 rounded mt-1 inline-block">
                                                        {bevType}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-[#5B300E]">Q{bevPrice}</p>
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
                <div className="sticky bottom-0 p-6 bg-[#FCF0CA]/40 border-t border-[#FCF0CA] flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-[#7F532C] bg-[#FCF0CA] hover:bg-[#946841] hover:text-white transition"
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
