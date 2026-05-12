import PropTypes from 'prop-types'

export const MenuCard = ({ menu, onEdit, onDelete, onView, isAdmin }) => {
    const menuId = menu._id || menu.id || menu.Menu_id
    const menuName = menu.Menu_Plate || menu.name || "Sin nombre"
    const menuPrice = menu.Menu_Price ?? menu.price ?? 0
    const menuDrink = menu.Menu_Drink || menu.drink || "Sin bebida"
    const menuPlateType = menu.Menu_type_plate || menu.category || "General"
    const menuDescription = menu.Menu_description_plate || menu.description || "Sin descripción disponible para este platillo."
    const isAvailable = menu.Menu_available ?? menu.available ?? true
    
    const handleDeleteClick = () => {
        if (window.confirm(`¿Seguro que quieres eliminar "${menuName}"?`)) {
            onDelete(menuId);
        }
    };

    return (
        <div className="bg-[#FFFFFF] rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#FCF0CA] group flex flex-col h-full">
            <div className="relative w-full h-52 bg-[#FCF0CA] overflow-hidden">
                {menu.photo ? (
                    <img
                        src={menu.photo}
                        alt={menuName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FCF0CA] via-[#F5D9A5] to-[#946841] text-center px-6">
                        <div>
                            <div className="text-5xl mb-3">🍽️</div>
                            <p className="text-[#5B300E] font-black uppercase tracking-[0.25em] text-xs">Menú</p>
                        </div>
                    </div>
                )}
                <div className="absolute top-4 right-4 bg-[#5B300E] text-white px-4 py-1.5 rounded-2xl font-black shadow-lg">
                    Q{menuPrice}
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="mb-3">
                    <span className="text-[11px] font-black text-[#7F532C] uppercase tracking-widest bg-[#7F532C]/10 px-2 py-1 rounded-md">
                        {menuPlateType}
                    </span>
                    <h3 className="text-[#2E160C] font-bold mt-2 truncate text-lg">
                        {menuName}
                    </h3>
                </div>
                
                <p className="text-gray-600 text-sm font-normal mb-3 line-clamp-3 flex-1">
                    {menuDescription}
                </p>

                <div className="mb-4 space-y-1 text-xs text-gray-500">
                    <p><span className="font-semibold text-[#5B300E]">Bebida:</span> {menuDrink}</p>
                    <p><span className="font-semibold text-[#5B300E]">Estado:</span> {isAvailable ? 'Disponible' : 'No disponible'}</p>
                </div>

                <div className="flex gap-2 mt-auto">
                    {isAdmin ? (
                        <>
                            <button
                                onClick={() => onView(menu)}
                                className="flex-1 flex items-center justify-center py-3 bg-[#FCF0CA] text-[#5B300E] rounded-2xl font-bold text-sm hover:bg-[#946841] transition-all active:scale-95"
                            >
                                Ver
                            </button>
                            <button
                                onClick={() => onEdit(menu)}
                                className="flex-[2] flex items-center justify-center gap-2 py-3 bg-[#5B300E] text-white rounded-2xl font-bold text-sm hover:bg-[#2E160C] transition-all active:scale-95 shadow-md"
                            >
                                Editar
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                className="flex-1 flex items-center justify-center py-3 border-2 border-[#946841] text-[#7F532C] rounded-2xl font-bold text-sm hover:bg-[#7F532C] hover:text-white transition-all active:scale-95"
                            >
                                Eliminar
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => onView(menu)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-[#5B300E] text-white rounded-2xl font-bold text-sm hover:bg-[#2E160C] transition-all active:scale-95 shadow-md"
                        >
                            Ver Detalles
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

MenuCard.propTypes = {
    menu: PropTypes.object.isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onView: PropTypes.func,
    isAdmin: PropTypes.bool,
}

MenuCard.defaultProps = {
    onEdit: () => {},
    onDelete: () => {},
    onView: () => {},
    isAdmin: false,
}
