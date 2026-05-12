import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMenuStore } from "../store/useMenuStore";
import { Spinner } from "./layouts/Spinner.jsx";

export const MenuModal = ({ isOpen, onClose, menu }) => {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm();

    const saveMenu = useMenuStore((state) => state.saveMenu);
    const loading = useMenuStore((state) => state.loading);

    const menuId = menu?._id || menu?.id || menu?.Menu_id || ""

    useEffect(() => {
        if (isOpen) {
            if (menu) {
                reset({
                    Menu_id: menu.Menu_id || menu.menu_id || menuId,
                    Menu_Plate: menu.Menu_Plate || menu.name || "",
                    Menu_Price: menu.Menu_Price ?? menu.price ?? "",
                    Menu_Drink: menu.Menu_Drink || menu.drink || "",
                    Menu_type_plate: menu.Menu_type_plate || menu.category || "",
                    Menu_type_drink: menu.Menu_type_drink || "",
                    Menu_Promotion: menu.Menu_Promotion || "",
                    Menu_description_plate: menu.Menu_description_plate || menu.description || "",
                    Menu_ingredients: Array.isArray(menu.Menu_ingredients) ? menu.Menu_ingredients.join(", ") : (menu.Menu_ingredients || ""),
                    Menu_available: menu.Menu_available ?? true,
                    Restaurant_id: menu.Restaurant_id || menu.restaurant_id || "",
                });
            } else {
                reset({
                    Menu_id: "",
                    Menu_Plate: "",
                    Menu_Price: "",
                    Menu_Drink: "",
                    Menu_type_plate: "",
                    Menu_type_drink: "",
                    Menu_Promotion: "",
                    Menu_description_plate: "",
                    Menu_ingredients: "",
                    Menu_available: true,
                    Restaurant_id: "",
                });
            }
        }
    }, [isOpen, menu, reset]);

    const onSubmit = async (data) => {
        const payload = {
            Menu_id: Number(data.Menu_id),
            Menu_Plate: data.Menu_Plate,
            Menu_Price: Number(data.Menu_Price),
            Menu_Drink: data.Menu_Drink,
            Menu_type_plate: data.Menu_type_plate,
            Menu_type_drink: data.Menu_type_drink,
            Menu_Promotion: data.Menu_Promotion || undefined,
            Menu_description_plate: data.Menu_description_plate,
            Menu_ingredients: data.Menu_ingredients
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
            Menu_available: Boolean(data.Menu_available),
            Restaurant_id: data.Restaurant_id,
        };

        const result = await saveMenu(payload, menuId);
        
        if (result.success) {
            reset();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#2E160C]/60 backdrop-blur-sm flex justify-center items-center z-50 px-3">
            <div className="bg-[#FFFFFF] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto overflow-hidden border border-[#FCF0CA]">
                
                <div className="p-6 text-white bg-[#5B300E]">
                    <h2 className="text-2xl font-bold">
                        {menu ? "Editar Menú" : "Nuevo Platillo"}
                    </h2>
                    <p className="text-sm opacity-90">
                        {menu ? "Actualiza los datos del menú" : "Agrega un nuevo menú al sistema"}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-[#2E160C] uppercase mb-1 block">ID del Menú</label>
                            <input className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FCF0CA] focus:border-[#5B300E] outline-none transition bg-gray-50/50" type="number" {...register("Menu_id", { required: "El ID es obligatorio" })} />
                            {errors.Menu_id && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.Menu_id.message}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-[#2E160C] uppercase mb-1 block">Nombre del Plato</label>
                            <input className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FCF0CA] focus:border-[#5B300E] outline-none transition bg-gray-50/50" placeholder="Ej. Hamburguesa Artesanal" {...register("Menu_Plate", { required: "El nombre es obligatorio" })} />
                            {errors.Menu_Plate && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.Menu_Plate.message}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[#2E160C] uppercase mb-1 block">Precio (Q)</label>
                            <input className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FCF0CA] focus:border-[#5B300E] outline-none transition bg-gray-50/50" type="number" step="0.01" {...register("Menu_Price", { required: "Precio necesario", min: 1 })} />
                            {errors.Menu_Price && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.Menu_Price.message}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[#2E160C] uppercase mb-1 block">Tipo de Plato</label>
                            <select className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FCF0CA] focus:border-[#5B300E] outline-none transition bg-gray-50/50" {...register("Menu_type_plate", { required: "Selecciona un tipo de plato" })}>
                                <option value="">Elegir...</option>
                                <option value="Entrada">Entrada</option>
                                <option value="Plato_fuerte">Plato fuerte</option>
                                <option value="Postre">Postre</option>
                                <option value="Bebida">Bebida</option>
                            </select>
                            {errors.Menu_type_plate && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.Menu_type_plate.message}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[#2E160C] uppercase mb-1 block">Nombre de la Bebida</label>
                            <input className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FCF0CA] focus:border-[#5B300E] outline-none transition bg-gray-50/50" placeholder="Ej. Cerveza artesanal" {...register("Menu_Drink", { required: "La bebida es obligatoria" })} />
                            {errors.Menu_Drink && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.Menu_Drink.message}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[#2E160C] uppercase mb-1 block">Tipo de Bebida</label>
                            <select className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FCF0CA] focus:border-[#5B300E] outline-none transition bg-gray-50/50" {...register("Menu_type_drink", { required: "Selecciona un tipo de bebida" })}>
                                <option value="">Elegir...</option>
                                <option value="Cerveza">Cerveza</option>
                                <option value="Vinos">Vinos</option>
                                <option value="Licores">Licores</option>
                                <option value="Cocteles">Cocteles</option>
                                <option value="shots">shots</option>
                                <option value="Bebidas_sin_alcohol">Bebidas sin alcohol</option>
                                <option value="Bebidas_calientes">Bebidas calientes</option>
                            </select>
                            {errors.Menu_type_drink && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.Menu_type_drink.message}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[#2E160C] uppercase mb-1 block">Promoción</label>
                            <select className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FCF0CA] focus:border-[#5B300E] outline-none transition bg-gray-50/50" {...register("Menu_Promotion")}>
                                <option value="">Sin promoción</option>
                                <option value="Promoción_Familiar">Promoción familiar</option>
                                <option value="Promoción_de_Quincena">Promoción de quincena</option>
                                <option value="Promoción_de_Cliente_frecuente">Cliente frecuente</option>
                                <option value="Promoción_de_Temporada">Promoción de temporada</option>
                                <option value="Promoción_de_Aniversario">Promoción de aniversario</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[#2E160C] uppercase mb-1 block">Restaurant ID</label>
                            <input className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FCF0CA] focus:border-[#5B300E] outline-none transition bg-gray-50/50" placeholder="ID del restaurante" {...register("Restaurant_id", { required: "El restaurante es obligatorio" })} />
                            {errors.Restaurant_id && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.Restaurant_id.message}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-[#2E160C] uppercase mb-1 block">Descripción del Plato</label>
                            <textarea rows="3" className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FCF0CA] focus:border-[#5B300E] outline-none transition bg-gray-50/50 resize-none" placeholder="Describe el plato..." {...register("Menu_description_plate", { required: "La descripción es obligatoria" })} />
                            {errors.Menu_description_plate && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.Menu_description_plate.message}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-[#2E160C] uppercase mb-1 block">Ingredientes</label>
                            <textarea rows="2" className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FCF0CA] focus:border-[#5B300E] outline-none transition bg-gray-50/50 resize-none" placeholder="Ingresa los ingredientes separados por comas" {...register("Menu_ingredients")} />
                        </div>

                        <div className="md:col-span-2 flex items-center gap-3 rounded-xl border border-[#FCF0CA] px-4 py-3 bg-[#FCF0CA]/40">
                            <input type="checkbox" className="h-4 w-4 accent-[#5B300E]" {...register("Menu_available")} />
                            <label className="text-sm font-semibold text-[#2E160C]">Disponible</label>
                        </div>
                    </div>

                    {/* BOTONES ACCIÓN */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-bold text-[#7F532C] bg-[#FCF0CA] hover:bg-[#946841] transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-2 px-8 py-3 rounded-xl font-bold text-white bg-[#5B300E] hover:bg-[#2E160C] transition shadow-lg flex items-center justify-center min-w-[140px]"
                        >
                            {loading ? <Spinner /> : menu ? "Guardar Cambios" : "Agregar a la Carta"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};