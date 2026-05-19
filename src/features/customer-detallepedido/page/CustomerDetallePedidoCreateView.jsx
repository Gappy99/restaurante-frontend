import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate, useParams } from 'react-router-dom'
import { getDishByIdService } from '../../dishes/services/DishService'
import { getBeverageByIdService } from '../../beverages/services/BeverageService'
import { getDishesByRestaurantService } from '../../dishes/services/DishService'
import { getBeveragesByRestaurantService } from '../../beverages/services/BeverageService'
import { restaurantService } from '../../restaurant/services/restaurantService'
import useMenuStore from '../../menus/store/useMenuStore'
import useOrderStore from '../../orders/store/useOrderStore'
import useDetallePedidoStore from '../../detallepedido/store/useDetallePedidoStore'

const asId = (value) => {
    if (!value) return ''
    if (typeof value === 'string') return value
    return value?._id || value?.id || value?.Menu_id || value?.Restaurant_id || ''
}

export const MenuViewModal = ({ isOpen, onClose, menu, onSaveOrder, onCancelOrder }) => {
    const navigate = useNavigate()
    const { orderId: routeOrderId } = useParams()
    const routeMode = !menu && typeof isOpen === 'undefined' && Boolean(routeOrderId)

    const [loadingDetails, setLoadingDetails] = useState(false)
    const [resolvedDishes, setResolvedDishes] = useState([])
    const [resolvedBeverages, setResolvedBeverages] = useState([])
    const [restaurantName, setRestaurantName] = useState('')
    const [routeLoading, setRouteLoading] = useState(false)
    const [routeError, setRouteError] = useState('')
    const [routeMenu, setRouteMenu] = useState(null)
    
    // Estado para controlar el carrito dinámico del pedido actual
    const [cart, setCart] = useState([])

    const { fetchOrderById, removeOrder } = useOrderStore()
    const { fetchMenus } = useMenuStore()
    const { saveDetallePedido } = useDetallePedidoStore()

    const effectiveMenu = useMemo(() => menu || routeMenu, [menu, routeMenu])
    const effectiveIsOpen = typeof isOpen === 'boolean' ? isOpen : true

    const handleClose = async () => {
        if (routeMode) {
            if (routeOrderId) {
                await removeOrder(routeOrderId)
            }
            navigate('/customer/orders')
            return
        }

        if (onClose) onClose()
    }

    const menuName = effectiveMenu?.Menu_Plate || effectiveMenu?.name || 'Sin nombre'
    const menuDescription = effectiveMenu?.Menu_description_plate || effectiveMenu?.description || 'Sin descripción'
    const menuPromotion = effectiveMenu?.Menu_Promotion || effectiveMenu?.promotion || 'Sin promoción'
    const isAvailable = effectiveMenu?.Menu_available ?? effectiveMenu?.available ?? true

    const normalizeItems = (items) => (Array.isArray(items) ? items : [])
    const resolveMenuKey = () => effectiveMenu?.Menu_id || effectiveMenu?.menu_id || effectiveMenu?._id || effectiveMenu?.id || null

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
            if (!effectiveIsOpen || !effectiveMenu) return

            const menuKey = resolveMenuKey()
            const restaurantId = effectiveMenu?.Restaurant_id || effectiveMenu?.restaurant_id || null

            setRestaurantName(
                effectiveMenu?.Restaurant_name || effectiveMenu?.restaurant?.name || effectiveMenu?.restaurant_name || effectiveMenu?.restaurantName || ''
            )

            const dishes = normalizeItems(effectiveMenu.dishes)
            const beverages = normalizeItems(effectiveMenu.beverages)

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

            if (!effectiveMenu?.Restaurant_name && !effectiveMenu?.restaurant?.name && restaurantId) {
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

        if (!effectiveIsOpen || !effectiveMenu) {
            setResolvedDishes([])
            setResolvedBeverages([])
            setRestaurantName('')
            setCart([]) // Resetear carrito al cerrar
            return
        }

        setLoadingDetails(true)
        loadDetails()
    }, [effectiveIsOpen, effectiveMenu])

    useEffect(() => {
        if (!routeMode || !routeOrderId) return

        const loadRouteContext = async () => {
            setRouteLoading(true)
            setRouteError('')

            try {
                const orderResult = await fetchOrderById(routeOrderId)
                const orderData = orderResult?.data || null
                const restaurantId = asId(orderData?.Restaurant_id || orderData?.restaurant_id)
                const menuId = asId(orderData?.Menu_id || orderData?.menu_id)

                const menusResult = await fetchMenus(restaurantId ? { restaurantId } : {})
                const menuList = Array.isArray(menusResult?.data) ? menusResult.data : []

                let matchedMenu = null
                if (menuId) {
                    matchedMenu = menuList.find((item) => asId(item) === menuId) || null
                }

                if (!matchedMenu && restaurantId) {
                    matchedMenu = menuList.find((item) => asId(item?.Restaurant_id || item?.restaurant_id) === restaurantId) || null
                }

                if (!matchedMenu) {
                    matchedMenu = {
                        _id: menuId || routeOrderId,
                        Menu_Plate: orderData?.Menu_Plate || orderData?.menu_name || 'Detalle del pedido',
                        Menu_description_plate: orderData?.Menu_description_plate || orderData?.menu_description || 'Selecciona los productos del pedido',
                        Menu_Promotion: orderData?.Menu_Promotion || '',
                        Menu_available: true,
                        Restaurant_id: orderData?.Restaurant_id || orderData?.restaurant_id || null,
                    }
                }

                setRouteMenu(matchedMenu)
            } catch {
                setRouteError('No se pudo cargar el detalle del pedido.')
            } finally {
                setRouteLoading(false)
            }
        }

        loadRouteContext()
    }, [routeMode, routeOrderId, fetchOrderById, fetchMenus])

    // --- LÓGICA DE CONTROL DEL CARRITO INTERACTIVO ---
    const handleAddItem = (item, type) => {
        const itemId = item._id || item.id;
        const itemName = type === 'dish' ? (item.Menu_Plate || item.name) : (item.Menu_Drink || item.name);
        const itemPrice = item.Menu_Price ?? item.price ?? 0;

        setCart((prevCart) => {
            const exists = prevCart.find((cartItem) => cartItem.id === itemId);
            if (exists) {
                return prevCart.map((cartItem) =>
                    cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            }
            return [...prevCart, { id: itemId, name: itemName, price: itemPrice, quantity: 1, type }];
        });
    };

    const handleUpdateQuantity = (itemId, amount) => {
        setCart((prevCart) =>
            prevCart
                .map((item) => {
                    if (item.id === itemId) {
                        const newQuantity = item.quantity + amount;
                        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
                    }
                    return item;
                })
                .filter(Boolean)
        );
    };

    const handleRemoveItem = (itemId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    };

    // Cálculos económicos dinámicos
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal; // Modifica aquí si agregas impuestos (ej: subtotal * 1.12)

    const handleGuardarPedido = () => {
        if (routeMode) {
            const items = cart.map((item) => ({
                producto: item.id,
                productType: item.type,
                candidadproducto: item.quantity,
            }))

            saveDetallePedido({ orders_id: routeOrderId, items })
                .then((result) => {
                    if (result?.success) {
                        navigate('/customer/orders')
                    }
                })

            return
        }

        if (onSaveOrder) {
            onSaveOrder(cart, total);
        } else {
            console.log("Pedido guardado localmente:", cart, "Total:", total);
        }
        handleClose();
    };

    if (!effectiveIsOpen) return null;

    if (!effectiveMenu) {
        if (routeMode && routeLoading) {
            return (
                <div className="min-h-screen bg-[#111111] text-[#f8fafc] flex items-center justify-center px-4">
                    <div className="w-full max-w-xl rounded-[2rem] border border-[#6b7280]/30 bg-[#1f2937]/20 p-8 text-center backdrop-blur-xl shadow-2xl shadow-black/40">
                        <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-[#6b7280]/20 border-t-[#9ca3af] animate-spin" />
                        <h2 className="text-2xl font-black uppercase italic text-[#f8fafc]">Cargando detalle del pedido</h2>
                        <p className="mt-2 text-sm text-[#d1d5db]/80">Estamos preparando los productos disponibles para esta orden.</p>
                    </div>
                </div>
            )
        }

        if (routeMode && routeError) {
            return (
                <div className="min-h-screen bg-[#111111] text-[#f8fafc] flex items-center justify-center px-4">
                    <div className="w-full max-w-xl rounded-[2rem] border border-red-400/30 bg-red-500/10 p-8 text-center backdrop-blur-xl shadow-2xl shadow-black/40">
                        <h2 className="text-2xl font-black uppercase italic text-[#f8fafc]">No se pudo abrir el detalle</h2>
                        <p className="mt-2 text-sm text-red-100">{routeError}</p>
                        <button
                            onClick={() => handleClose()}
                            className="mt-6 rounded-xl bg-[#9ca3af] px-5 py-3 font-bold text-[#111111] hover:bg-[#f8fafc]"
                        >
                            Volver
                        </button>
                    </div>
                </div>
            )
        }

        return null
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 px-4 py-4 font-sans text-zinc-200 font-semibold">
            {/* Contenedor Principal Oscuro (Layout Tipo Dashboard / POS) */}
            <div className="bg-[#121214] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden">
                
                {/* Cabecera superior interna */}
                <header className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-[#161619]">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-200 block">
                            {isAvailable ? 'Restaurante Abierto' : 'No disponible'}
                        </span>
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase mt-0.5">
                            {menuName} {restaurantName && <span className="text-zinc-500 text-lg font-medium">| {restaurantName}</span>}
                        </h2>
                        <p className="text-xs text-zinc-400 italic max-w-xl truncate mt-0.5">{menuDescription}</p>
                    </div>
                    
                    <button 
                        onClick={handleClose}
                        className="text-xs font-semibold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg transition"
                    >
                        Cerrar Vista
                    </button>
                </header>

                {loadingDetails ? (
                    <div className="flex-1 flex flex-col justify-center items-center gap-3 bg-[#121214]">
                        <div className="w-8 h-8 border-4 border-t-white border-zinc-800 rounded-full animate-spin"></div>
                        <p className="text-sm tracking-widest uppercase text-zinc-500">Cargando menú del restaurante...</p>
                    </div>
                ) : (
                    /* CUERPO PRINCIPAL DEL POST (Doble Columna) */
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#121214]">
                        
                        {/* COLUMNA IZQUIERDA: MENÚ DE SELECCIÓN (60% de ancho) */}
                        <div className="w-full md:w-[60%] overflow-y-auto bg-[#ffffff] text-[#111827] p-8 md:p-12 custom-scrollbar">
                            <div className="text-center max-w-xl mx-auto mb-12 border-b border-[#111827]/20 pb-8">
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
                                {menuPromotion && menuPromotion !== 'Sin promoción' && (
                                    <span className="inline-block mt-4 text-xs font-sans uppercase tracking-widest bg-[#111827] text-[#ffffff] px-4 py-1">
                                        Especial: {menuPromotion}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 relative">
                                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#111827]/10 -translate-x-1/2" />

                                <section className="space-y-8">
                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-normal uppercase tracking-wider border-b-2 border-[#111827] inline-block pb-1 px-6">
                                            Food Menu
                                        </h3>
                                    </div>

                                    {resolvedDishes.length > 0 ? (
                                        <div className="space-y-6">
                                            {resolvedDishes.map((dish, idx) => {
                                                const dishName = dish.Menu_Plate || dish.name || 'Sin nombre'
                                                const dishPrice = dish.Menu_Price ?? dish.price ?? 0
                                                const dishType = dish.Menu_type_plate || dish.type || 'General'
                                                const dishDescription = dish.Menu_description_plate || dish.description || ''

                                                return (
                                                    <article
                                                        key={idx}
                                                        onClick={() => handleAddItem(dish, 'dish')}
                                                        className="group cursor-pointer"
                                                    >
                                                        <div className="flex justify-between items-baseline gap-2">
                                                            <h4 className="font-bold text-base uppercase tracking-wide text-[#111827]">
                                                                {dishName}
                                                                <span className="ml-2 font-sans font-normal text-[10px] text-stone-500 lowercase italic border border-stone-300 px-1 rounded-sm">
                                                                    {dishType}
                                                                </span>
                                                            </h4>
                                                            <span className="font-bold text-base font-serif text-[#111827]">
                                                                Q{Number(dishPrice).toFixed(2)}
                                                            </span>
                                                        </div>
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

                                <section className="space-y-8">
                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-normal uppercase tracking-wider border-b-2 border-[#111827] inline-block pb-1 px-6">
                                            Drinks Menu
                                        </h3>
                                    </div>

                                    {resolvedBeverages.length > 0 ? (
                                        <div className="space-y-6">
                                            {resolvedBeverages.map((beverage, idx) => {
                                                const bevName = beverage.Menu_Drink || beverage.name || 'Sin nombre'
                                                const bevPrice = beverage.Menu_Price ?? beverage.price ?? 0
                                                const bevType = beverage.Menu_type_drink || beverage.type || 'General'
                                                const bevDescription = beverage.Menu_description_drink || beverage.description || ''

                                                return (
                                                    <article
                                                        key={idx}
                                                        onClick={() => handleAddItem(beverage, 'beverage')}
                                                        className="group cursor-pointer"
                                                    >
                                                        <div className="flex justify-between items-baseline gap-2">
                                                            <h4 className="font-bold text-base uppercase tracking-wide text-[#111827]">
                                                                {bevName}
                                                                <span className="ml-2 font-sans font-normal text-[10px] text-stone-500 lowercase italic border border-stone-300 px-1 rounded-sm">
                                                                    {bevType}
                                                                </span>
                                                            </h4>
                                                            <span className="font-bold text-base font-serif text-[#111827]">
                                                                Q{Number(bevPrice).toFixed(2)}
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
                        </div>

                        {/* COLUMNA DERECHA: ORDEN / CARRITO EN TIEMPO REAL (40% de ancho) */}
                        <div className="w-full md:w-[40%] bg-[#161619] flex flex-col justify-between overflow-hidden">
                            
                            {/* Cabecera del pedido */}
                            <div className="p-4 border-b border-zinc-800 bg-[#18181c] flex justify-between items-center">
                                <h3 className="font-bold text-sm uppercase tracking-wide text-white">Detalle de la Orden</h3>
                                <span className="bg-zinc-200/10 text-zinc-200 font-mono text-xs px-2 py-0.5 rounded-full font-bold">
                                    {cart.reduce((sum, i) => sum + i.quantity, 0)} ítems
                                </span>
                            </div>

                            {/* Lista de productos seleccionados */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                                {cart.length > 0 ? (
                                    cart.map((item) => (
                                        <div 
                                            key={item.id} 
                                            className="p-3 bg-[#121214] border border-zinc-800 rounded-xl flex items-center justify-between"
                                        >
                                            <div className="max-w-[55%]">
                                                <h4 className="text-sm font-medium text-white truncate uppercase">{item.name}</h4>
                                                <p className="text-xs text-zinc-500 font-mono mt-0.5">Q{Number(item.price).toFixed(2)} c/u</p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {/* Controles de Cantidad Incremento / Decremento */}
                                                <div className="flex items-center bg-[#18181c] border border-zinc-800 rounded-lg p-0.5">
                                                    <button 
                                                        onClick={() => handleUpdateQuantity(item.id, -1)}
                                                        className="w-7 h-7 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded flex items-center justify-center font-bold text-sm transition"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-6 text-center text-xs font-bold text-white font-mono">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => handleUpdateQuantity(item.id, 1)}
                                                        className="w-7 h-7 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded flex items-center justify-center font-bold text-sm transition"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* Total por Ítem e Icono eliminar */}
                                                <div className="text-right flex items-center gap-3">
                                                    <span className="text-sm font-bold text-zinc-200 font-mono w-16 block">
                                                        Q{(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                    <button 
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="text-zinc-600 hover:text-rose-400 transition p-1"
                                                        title="Eliminar producto"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col justify-center items-center text-zinc-600 py-12 text-center">
                                        <p className="text-sm italic">El pedido está vacío.</p>
                                        <p className="text-xs text-zinc-500 mt-1">Selecciona productos del menú izquierdo.</p>
                                    </div>
                                )}
                            </div>

                            {/* FOOTER DE LA CUENTA Y ACCIONES GENERALES */}
                            <div className="p-4 bg-[#18181c] border-t border-zinc-800 space-y-4">
                                <div className="space-y-1.5 font-mono">
                                    <div className="flex justify-between text-xs text-zinc-400">
                                        <span>Subtotal</span>
                                        <span>Q{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold text-white border-t border-zinc-800/80 pt-2">
                                        <span>TOTAL</span>
                                        <span className="text-platinum-400 text-lg">Q{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Botones del Formulario */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            if (onCancelOrder) onCancelOrder();
                                            handleClose();
                                        }}
                                        className="w-full bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-zinc-300 font-semibold text-xs uppercase tracking-wider py-3 rounded-xl transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleGuardarPedido}
                                        disabled={cart.length === 0}
                                        className="w-full bg-zinc-700 hover:bg-zinc-200 hover:text-zinc-950 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-zinc-100 font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-lg transition duration-300 text-center"
                                    >
                                        Guardar Pedido
                                    </button>
                                </div>
                            </div>

                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

MenuViewModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    menu: PropTypes.object,
    onSaveOrder: PropTypes.func,
    onCancelOrder: PropTypes.func
};

export default MenuViewModal;