import { Typography } from "@material-tailwind/react";

export const MenuCard = ({ menu, onEdit, onDelete, onView, isAdmin }) => {
    
    const handleDeleteClick = () => {
        if (window.confirm(`¿Seguro que quieres eliminar "${menu.name}"?`)) {
            onDelete(menu._id || menu.id);
        }
    };

    return (
        <div className="bg-[#FFFFFF] rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#FCF0CA] group flex flex-col h-full">
            <div className="relative w-full h-52 bg-[#FCF0CA] overflow-hidden">
                <img
                    src={menu.photo || "https://via.placeholder.com/400?text=Sin+Imagen"}
                    alt={menu.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-[#5B300E] text-white px-4 py-1.5 rounded-2xl font-black shadow-lg">
                    Q{menu.price}
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="mb-3">
                    <span className="text-[11px] font-black text-[#7F532C] uppercase tracking-widest bg-[#7F532C]/10 px-2 py-1 rounded-md">
                        {menu.category || "General"}
                    </span>
                    <Typography variant="h5" className="text-[#2E160C] font-bold mt-2 truncate">
                        {menu.name}
                    </Typography>
                </div>
                
                <Typography className="text-gray-600 text-sm font-normal mb-6 line-clamp-3 flex-1">
                    {menu.description || "Sin descripción disponible para este platillo."}
                </Typography>

                <div className="flex gap-2 mt-auto">
                    {isAdmin ? (
                        <>
                            <button
                                onClick={() => onView(menu)}
                                className="flex-1 flex items-center justify-center py-3 bg-[#FCF0CA] text-[#5B300E] rounded-2xl font-bold text-sm hover:bg-[#946841] transition-all active:scale-95"
                            >
                                👁️
                            </button>
                            <button
                                onClick={() => onEdit(menu)}
                                className="flex-[2] flex items-center justify-center gap-2 py-3 bg-[#5B300E] text-white rounded-2xl font-bold text-sm hover:bg-[#2E160C] transition-all active:scale-95 shadow-md"
                            >
                                ✏️ Editar
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                className="flex-1 flex items-center justify-center py-3 border-2 border-[#946841] text-[#7F532C] rounded-2xl font-bold text-sm hover:bg-[#7F532C] hover:text-white transition-all active:scale-95"
                            >
                                🗑️
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => onView(menu)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-[#5B300E] text-white rounded-2xl font-bold text-sm hover:bg-[#2E160C] transition-all active:scale-95 shadow-md"
                        >
                            👁️ Ver Detalles
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};