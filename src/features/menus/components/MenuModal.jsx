import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PropTypes from 'prop-types'
import { useMenuStore } from "../store/useMenuStore";
import { createDishService } from "../../dishes/services/DishService";
import { createBeverageService } from "../../beverages/services/BeverageService";
import { Spinner } from "./layouts/Spinner.jsx";

export const MenuModal = ({ isOpen, onClose, menu }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const saveMenu = useMenuStore((state) => state.saveMenu);
    const loading = useMenuStore((state) => state.loading);

    const menuId = menu?._id || menu?.id || menu?.Menu_id || ""

    const [mode, setMode] = useState(null); // 'dish' | 'beverage' | null

    const [dishForms, setDishForms] = useState([]);
    const [beverageForms, setBeverageForms] = useState([]);

    const restaurantId = menu?.Restaurant_id || menu?.restaurant_id || null;

    useEffect(() => {
        if (isOpen) {
            if (menu) {
                reset({
                    Menu_id: menu.Menu_id || menu.menu_id || menuId,
                    Menu_Plate: menu.Menu_Plate || menu.name || "",
                    Menu_Promotion: menu.Menu_Promotion || "",
                    Menu_description_plate: menu.Menu_description_plate || menu.description || "",
                    Menu_available: menu.Menu_available ?? true,
                    Restaurant_id: menu.Restaurant_id || menu.restaurant_id || "",
                });
            } else {
                reset({
                    Menu_id: "",
                    Menu_Plate: "",
                    Menu_Promotion: "",
                    Menu_description_plate: "",
                    Menu_available: true,
                    Restaurant_id: "",
                });
            }
        }
    }, [isOpen, menu, reset, menuId]);

    // Prefill dish/beverage forms when modal opens/editing
    useEffect(() => {
        if (!isOpen) return;
        if (menu) {
            if (Array.isArray(menu.dishes) && menu.dishes.length > 0) {
                setDishForms(menu.dishes.map(d => ({ id: d._id || d.id || null, name: d.name || d.Menu_Plate || '', price: d.price || d.Menu_Price || 0, type: d.type || d.Menu_type_plate || '', description: d.description || '', available: d.available ?? true })));
            }
            if (Array.isArray(menu.beverages) && menu.beverages.length > 0) {
                setBeverageForms(menu.beverages.map(b => ({ id: b._id || b.id || null, name: b.name || b.Menu_Drink || '', price: b.price || b.Menu_Price || 0, type: b.type || b.Menu_type_drink || '', description: b.description || '', available: b.available ?? true })));
            }
        } else {
            setDishForms([]);
            setBeverageForms([]);
        }
    }, [isOpen, menu]);

    // No longer loading existing dishes/beverages here; creation handled via dynamic forms

    const onSubmit = async (data) => {
        const computedMenuId = data.Menu_id ? Number(data.Menu_id) : Date.now();

        try {
            // PASO 1: Crear el menú primero (entidad principal)
            console.debug("[MenuModal] Creating menu as main entity...");
            const menuPayload = {
                Menu_id: computedMenuId,
                name: data.Menu_Plate,
                description: data.Menu_description_plate || null,
                promotion: data.Menu_Promotion || null,
                available: Boolean(data.Menu_available),
                restaurant_id: data.Restaurant_id,
                dishes: [], // Arrays vacíos al inicio
                beverages: [],
            };

            const menuResult = await saveMenu(menuPayload, menuId);
            if (!menuResult.success) {
                throw new Error(menuResult.error || "Error al crear el menú");
            }
            console.debug("[MenuModal] Menu created successfully");

            // PASO 2: Crear los platillos como entidades INDEPENDIENTES
            // Dishes es una colección separada que referencia al menú
            console.debug("[MenuModal] Creating dishes as separate entities...");
            const createdDishIds = [];
            for (const d of dishForms) {
                if (d.id) {
                    createdDishIds.push(d.id);
                    continue;
                }
                try {
                    const created = await createDishService({
                        name: d.name,
                        price: Number(d.price) || 0,
                        type: d.type,
                        description: d.description || null,
                        available: Boolean(d.available),
                        restaurant_id: data.Restaurant_id,
                        menu_id: computedMenuId, // Referencia al menú creado
                    });
                    const id = created._id || created.id || created.data?._id || created.data?.id;
                    if (id) {
                        createdDishIds.push(id);
                        console.debug("[MenuModal] Dish created:", id);
                    }
                } catch (err) {
                    console.error("[MenuModal] error creating dish", err);
                }
            }

            // PASO 3: Crear las bebidas como entidades INDEPENDIENTES
            // Beverages es una colección separada que referencia al menú
            console.debug("[MenuModal] Creating beverages as separate entities...");
            const createdBeverageIds = [];
            for (const b of beverageForms) {
                if (b.id) {
                    createdBeverageIds.push(b.id);
                    continue;
                }
                try {
                    const created = await createBeverageService({
                        name: b.name,
                        price: Number(b.price) || 0,
                        type: b.type,
                        description: b.description || null,
                        available: Boolean(b.available),
                        restaurant_id: data.Restaurant_id,
                        menu_id: computedMenuId, // Referencia al menú creado
                    });
                    const id = created._id || created.id || created.data?._id || created.data?.id;
                    if (id) {
                        createdBeverageIds.push(id);
                        console.debug("[MenuModal] Beverage created:", id);
                    }
                } catch (err) {
                    console.error("[MenuModal] error creating beverage", err);
                }
            }

            // PASO 4: Actualizar el menú con las referencias a las entidades creadas
            // El menú ahora tiene los IDs de platillos y bebidas como referencias
            if (createdDishIds.length > 0 || createdBeverageIds.length > 0) {
                console.debug("[MenuModal] Updating menu with dish/beverage references...");
                const updatePayload = {
                    Menu_id: computedMenuId,
                    name: data.Menu_Plate,
                    description: data.Menu_description_plate || null,
                    promotion: data.Menu_Promotion || null,
                    available: Boolean(data.Menu_available),
                    restaurant_id: data.Restaurant_id,
                    dishes: createdDishIds,
                    beverages: createdBeverageIds,
                };

                const updateResult = await saveMenu(updatePayload, menuId);
                if (!updateResult.success) {
                    throw new Error(updateResult.error || "Error al actualizar el menú");
                }
                console.debug("[MenuModal] Menu updated with references");
            }

            reset();
            setDishForms([]);
            setBeverageForms([]);
            onClose();
        } catch (err) {
            console.error("[MenuModal] error in onSubmit", err);
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
                        {/* Mode selector: add dish or beverage */}
                        <div className="md:col-span-2 flex gap-3">
                            <button type="button" onClick={() => setMode('dish')} className={`flex-1 py-2 rounded-xl font-bold ${mode==='dish' ? 'bg-[#2E160C] text-white' : 'bg-[#FCF0CA] text-[#7F532C]'}`}>
                                Agregar Platillo
                            </button>
                            <button type="button" onClick={() => setMode('beverage')} className={`flex-1 py-2 rounded-xl font-bold ${mode==='beverage' ? 'bg-[#2E160C] text-white' : 'bg-[#FCF0CA] text-[#7F532C]'}`}>
                                Agregar Bebida
                            </button>
                        </div>

                        {/* Dynamic forms area */}
                        {mode === 'dish' && (
                            <div className="md:col-span-2 space-y-2">
                                {dishForms.map((form, idx) => (
                                    <div key={idx} className="p-3 border rounded-lg bg-white">
                                        <div className="flex items-center justify-between">
                                            <strong>Platillo #{idx + 1}</strong>
                                            <button type="button" onClick={() => setDishForms(prev => prev.filter((_, i) => i !== idx))} className="text-sm text-red-500">Eliminar</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                                            <input placeholder="Nombre" value={form.name} onChange={(e) => setDishForms(prev => prev.map((p, i) => i===idx?{...p,name:e.target.value}:p))} className="p-2 border rounded" />
                                            <input placeholder="Precio" type="number" value={form.price} onChange={(e) => setDishForms(prev => prev.map((p, i) => i===idx?{...p,price:e.target.value}:p))} className="p-2 border rounded" />
                                            <input placeholder="Tipo" value={form.type} onChange={(e) => setDishForms(prev => prev.map((p, i) => i===idx?{...p,type:e.target.value}:p))} className="p-2 border rounded" />
                                            <textarea placeholder="Descripción" value={form.description} onChange={(e) => setDishForms(prev => prev.map((p, i) => i===idx?{...p,description:e.target.value}:p))} className="p-2 border rounded md:col-span-3" />
                                            <label className="flex items-center gap-2 md:col-span-3"><input type="checkbox" checked={form.available} onChange={(e) => setDishForms(prev => prev.map((p, i) => i===idx?{...p,available:e.target.checked}:p))} /> Disponible</label>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setDishForms(prev => [...prev, { name: '', price: '', type: '', description: '', available: true }])} className="py-2 px-3 bg-[#5B300E] text-white rounded-xl font-bold">Agregar otro platillo</button>
                                </div>
                            </div>
                        )}

                        {mode === 'beverage' && (
                            <div className="md:col-span-2 space-y-2">
                                {beverageForms.map((form, idx) => (
                                    <div key={idx} className="p-3 border rounded-lg bg-white">
                                        <div className="flex items-center justify-between">
                                            <strong>Bebida #{idx + 1}</strong>
                                            <button type="button" onClick={() => setBeverageForms(prev => prev.filter((_, i) => i !== idx))} className="text-sm text-red-500">Eliminar</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                                            <input placeholder="Nombre" value={form.name} onChange={(e) => setBeverageForms(prev => prev.map((p, i) => i===idx?{...p,name:e.target.value}:p))} className="p-2 border rounded" />
                                            <input placeholder="Precio" type="number" value={form.price} onChange={(e) => setBeverageForms(prev => prev.map((p, i) => i===idx?{...p,price:e.target.value}:p))} className="p-2 border rounded" />
                                            <input placeholder="Tipo" value={form.type} onChange={(e) => setBeverageForms(prev => prev.map((p, i) => i===idx?{...p,type:e.target.value}:p))} className="p-2 border rounded" />
                                            <textarea placeholder="Descripción" value={form.description} onChange={(e) => setBeverageForms(prev => prev.map((p, i) => i===idx?{...p,description:e.target.value}:p))} className="p-2 border rounded md:col-span-3" />
                                            <label className="flex items-center gap-2 md:col-span-3"><input type="checkbox" checked={form.available} onChange={(e) => setBeverageForms(prev => prev.map((p, i) => i===idx?{...p,available:e.target.checked}:p))} /> Disponible</label>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setBeverageForms(prev => [...prev, { name: '', price: '', type: '', description: '', available: true }])} className="py-2 px-3 bg-[#5B300E] text-white rounded-xl font-bold">Agregar otra bebida</button>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-bold text-[#2E160C] uppercase mb-1 block">ID del Menú (opcional)</label>
                            <input className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FCF0CA] focus:border-[#5B300E] outline-none transition bg-gray-50/50" type="number" {...register("Menu_id")} />
                            {errors.Menu_id && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.Menu_id.message}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-[#2E160C] uppercase mb-1 block">Nombre del Menú</label>
                            <input className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FCF0CA] focus:border-[#5B300E] outline-none transition bg-gray-50/50" placeholder="Ej. Menu del Día" {...register("Menu_Plate", { required: "El nombre es obligatorio" })} />
                            {errors.Menu_Plate && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.Menu_Plate.message}</p>}
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
                            <label className="text-xs font-bold text-[#2E160C] uppercase mb-1 block">Descripción</label>
                            <textarea rows="3" className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FCF0CA] focus:border-[#5B300E] outline-none transition bg-gray-50/50 resize-none" placeholder="Describe el menú..." {...register("Menu_description_plate")} />
                            {errors.Menu_description_plate && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.Menu_description_plate.message}</p>}
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

MenuModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    menu: PropTypes.object,
}

MenuModal.defaultProps = {
    menu: null,
}
