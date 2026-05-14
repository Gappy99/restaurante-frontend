import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PropTypes from 'prop-types'
import { useMenuStore } from "../store/useMenuStore";
import { createDishService, updateDishService } from "../../dishes/services/DishService";
import { createBeverageService, updateBeverageService } from "../../beverages/services/BeverageService";
import { Spinner } from "./layouts/Spinner.jsx";
import { RecipeModal } from "../../recipes/components/RecipeModal";

export const MenuModal = ({ isOpen, onClose, menu }) => {
    const {
        register,
        handleSubmit,
        reset,
        getValues,
        formState: { errors },
    } = useForm();

    const saveMenu = useMenuStore((state) => state.saveMenu);
    const loading = useMenuStore((state) => state.loading);

    const menuId = menu?._id || menu?.id || menu?.Menu_id || ""

    // ESTADOS PARA EL FLUJO DE MÚLTIPLES PASOS
    const [step, setStep] = useState(1); // 1: Menu, 2: Selección, 3: Formulario Detalle
    const [subType, setSubType] = useState(null); // 'dish' o 'beverage'
    const [mode, setMode] = useState(null); // 'dish' | 'beverage' | null

    const [dishForms, setDishForms] = useState([]);
    const [beverageForms, setBeverageForms] = useState([]);
    const [menuDraft, setMenuDraft] = useState(null);
    const [savingItems, setSavingItems] = useState(false);
    const [submittingFinal, setSubmittingFinal] = useState(false);
    const [computedMenuId, setComputedMenuId] = useState(null);
    const [showRecipeModal, setShowRecipeModal] = useState(false);
    const [recipeProductId, setRecipeProductId] = useState(null);
    const [recipeProductType, setRecipeProductType] = useState(null);
    const [createdProducts, setCreatedProducts] = useState([]);

    const beverageTypeOptions = [
        'Cerveza',
        'Vinos',
        'Licores',
        'Cocteles',
        'Shots',
        'Bebidas_sin_alcohol',
        'Bebidas_calientes',
    ];

    const buildBeveragePayload = (beverage, restaurantId) => ({
        name: beverage.name,
        description: beverage.description,
        type: beverage.type,
        price: Number(beverage.price) || 0,
        image: beverage.image ?? null,
        available: Boolean(beverage.available),
        restaurant_id: restaurantId,
        estado: beverage.estado ?? true,
    });

    const parseId = (val) => {
        if (val === undefined || val === null) return null;
        const n = Number(val);
        return Number.isFinite(n) ? n : val;
    };

    const normalizeItemIds = (items) =>
        (Array.isArray(items) ? items : [])
            .map((item) => (item && typeof item === 'object' ? (item._id || item.id) : item))
            .filter(Boolean);

    const mergeUniqueIds = (...lists) => [...new Set(lists.flat().filter(Boolean))];

    const hasItemChanged = (original, updated) => {
        if (!original) return false;
        return (
            original.name !== updated.name ||
            original.price !== updated.price ||
            original.type !== updated.type ||
            original.description !== updated.description ||
            original.available !== updated.available
        );
    };

    const restaurantId = menu?.Restaurant_id || menu?.restaurant_id || null;

    // Limpiar el estado al cerrar/abrir
    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setSubType(null);
            setMode(null);
            setMenuDraft(null);
            setComputedMenuId(null);
            setDishForms([]);
            setBeverageForms([]);
                        setShowRecipeModal(false);
                        setRecipeProductId(null);
                        setRecipeProductType(null);
                        setCreatedProducts([]);
            return;
        }

        if (menu) {
            const existingDishForms = Array.isArray(menu.dishes)
                ? menu.dishes.map((dish) => (
                    dish && typeof dish === 'object'
                        ? {
                            id: dish._id || dish.id,
                            name: dish.name || dish.Menu_Plate || '',
                            price: dish.price ?? dish.Menu_Price ?? '',
                            type: dish.type || dish.Menu_type_plate || '',
                            description: dish.description || dish.Menu_description_plate || '',
                            available: dish.available ?? dish.Menu_available ?? true,
                        }
                        : {
                            id: dish,
                            name: '',
                            price: '',
                            type: '',
                            description: '',
                            available: true,
                        }
                ))
                : [];

            const existingBeverageForms = Array.isArray(menu.beverages)
                ? menu.beverages.map((beverage) => (
                    beverage && typeof beverage === 'object'
                        ? {
                            id: beverage._id || beverage.id,
                            name: beverage.name || beverage.Menu_Drink || '',
                            price: beverage.price ?? beverage.Menu_Price ?? '',
                            type: beverage.type || beverage.Menu_type_drink || '',
                            description: beverage.description || beverage.Menu_description_drink || '',
                            image: beverage.image || null,
                            available: beverage.available ?? beverage.Menu_available ?? true,
                            estado: beverage.estado ?? true,
                        }
                        : {
                            id: beverage,
                            name: '',
                            price: '',
                            type: '',
                            description: '',
                            image: null,
                            available: true,
                            estado: true,
                        }
                ))
                : [];

            setDishForms(existingDishForms);
            setBeverageForms(existingBeverageForms);
        }
    }, [isOpen]);

    // Reset form cuando se abre el modal en creación (no edición)
    useEffect(() => {
        if (isOpen && !menu) {
            reset({
                Menu_Plate: "",
                Menu_Promotion: "",
                Menu_description_plate: "",
                Menu_available: true,
                Restaurant_id: "",
            });
        } else if (isOpen && menu) {
            reset({
                Menu_Plate: menu.Menu_Plate || menu.name || "",
                Menu_Promotion: menu.Menu_Promotion || "",
                Menu_description_plate: menu.Menu_description_plate || menu.description || "",
                Menu_available: menu.Menu_available ?? true,
                Restaurant_id: menu.Restaurant_id || menu.restaurant_id || "",
            });
        }
    }, [isOpen, menu, reset, menuId]);

    // No longer loading existing dishes/beverages here; creation handled via dynamic forms

    // Función para avanzar del Paso 1 al 2
    const nextStep = () => setStep(2);

    const onSubmitMenu = async (data) => {
        setMenuDraft(data);
        setComputedMenuId(Date.now());
        nextStep();
    };
    
    const onSubmitFinal = async (data) => {
        if (submittingFinal) return;
        setSubmittingFinal(true);

        const sourceData = menuDraft || data;
        const finalMenuId = computedMenuId || Date.now();
        const existingDishIds = normalizeItemIds(menu?.dishes);
        const existingBeverageIds = normalizeItemIds(menu?.beverages);

        try {
            if (!sourceData?.Menu_Plate || !sourceData?.Restaurant_id) {
                throw new Error("Faltan datos base del menú");
            }

            console.debug("[MenuModal] Creating dishes as separate entities...");
            const createdDishIds = [];
            for (const d of dishForms) {
                if (d.id) {
                    createdDishIds.push(d.id);
                    // Check if existing dish was modified
                    const originalDish = Array.isArray(menu?.dishes) ? menu.dishes.find(dish => (dish._id || dish.id) === d.id) : null;
                    if (originalDish && hasItemChanged(originalDish, d)) {
                        try {
                            await updateDishService(d.id, {
                                name: d.name,
                                Menu_Plate: d.name,
                                price: Number(d.price) || 0,
                                Menu_Price: Number(d.price) || 0,
                                type: d.type,
                                Menu_type_plate: d.type,
                                description: d.description || null,
                                Menu_description_plate: d.description || null,
                                available: Boolean(d.available),
                                Menu_available: Boolean(d.available),
                            });
                            console.debug('[MenuModal] Dish updated:', d.id);
                        } catch (err) {
                            console.error('[MenuModal] error updating dish', d.id, err?.response?.data || err?.message || err);
                        }
                    }
                    continue;
                }
                try {
                    const resolvedRestaurantIdRaw = sourceData?.Restaurant_id || sourceData?.restaurant_id || document.querySelector('input[name="Restaurant_id"]')?.value || restaurantId || null;
                    const resolvedRestaurantId = parseId(resolvedRestaurantIdRaw);

                    const missing = [];
                    if (!d.name) missing.push('name');
                    if (!d.description) missing.push('description');
                    if (!d.type) missing.push('type');
                    if (d.price === undefined || d.price === '' || Number.isNaN(Number(d.price))) missing.push('price');
                    if (!resolvedRestaurantId) missing.push('restaurant_id');
                    if (missing.length) {
                        console.warn('[MenuModal] Skipping dish creation, missing fields:', missing);
                        window.alert(`No se puede guardar el platillo. Faltan campos: ${missing.join(', ')}`);
                        continue;
                    }

                    const normalizeType = (raw) => {
                        if (!raw) return raw;
                        const map = {
                            entrada: 'Entrada',
                            'plato fuerte': 'Plato_fuerte',
                            plato_fuerte: 'Plato_fuerte',
                            'plato-fuerte': 'Plato_fuerte',
                            postre: 'Postre',
                            acompañamiento: 'Acompañamiento',
                            acompanamiento: 'Acompañamiento'
                        };
                        const key = String(raw).trim().toLowerCase();
                        return map[key] || raw;
                    };

                    const created = await createDishService({
                        Menu_id: finalMenuId,
                        Menu_Plate: d.name,
                        Menu_Price: Number(d.price) || 0,
                        Menu_type_plate: normalizeType(d.type),
                        Menu_description_plate: d.description || null,
                        Menu_available: Boolean(d.available),
                        Restaurant_id: resolvedRestaurantId,
                        name: d.name,
                        price: Number(d.price) || 0,
                        type: normalizeType(d.type),
                        description: d.description || null,
                        available: Boolean(d.available),
                        restaurant_id: resolvedRestaurantId,
                    });
                    const id = created._id || created.id || created.data?._id || created.data?.id;
                    if (id) {
                        createdDishIds.push(id);
                                                setCreatedProducts(prev => [...prev, {
                                                    id,
                                                    name: d.name,
                                                    type: 'dish',
                                                    recipeAdded: false
                                                }]);
                        console.debug('[MenuModal] Dish created:', id);
                    }
                } catch (err) {
                    console.error('[MenuModal] error creating dish', err?.response?.data || err?.message || err);
                }
            }

            console.debug('[MenuModal] Creating beverages as separate entities...');
            const createdBeverageIds = [];
            for (const b of beverageForms) {
                if (b.id) {
                    createdBeverageIds.push(b.id);
                    // Check if existing beverage was modified
                    const originalBeverage = Array.isArray(menu?.beverages) ? menu.beverages.find(bev => (bev._id || bev.id) === b.id) : null;
                    if (originalBeverage && hasItemChanged(originalBeverage, b)) {
                        try {
                            await updateBeverageService(b.id, {
                                name: b.name,
                                Menu_Drink: b.name,
                                price: Number(b.price) || 0,
                                Menu_Price: Number(b.price) || 0,
                                type: b.type,
                                Menu_type_drink: b.type,
                                description: b.description || null,
                                Menu_description_drink: b.description || null,
                                image: b.image || null,
                                available: Boolean(b.available),
                                Menu_available: Boolean(b.available),
                            });
                            console.debug('[MenuModal] Beverage updated:', b.id);
                        } catch (err) {
                            console.error('[MenuModal] error updating beverage', b.id, err?.response?.data || err?.message || err);
                        }
                    }
                    continue;
                }
                try {
                    const resolvedRestaurantIdRaw = sourceData?.Restaurant_id || sourceData?.restaurant_id || document.querySelector('input[name="Restaurant_id"]')?.value || restaurantId || null;
                    const resolvedRestaurantId = parseId(resolvedRestaurantIdRaw);

                    const missing = [];
                    if (!b.name) missing.push('name');
                    if (!b.description) missing.push('description');
                    if (!b.type) missing.push('type');
                    if (b.price === undefined || b.price === '' || Number.isNaN(Number(b.price))) missing.push('price');
                    if (!resolvedRestaurantId) missing.push('restaurant_id');
                    if (missing.length) {
                        console.warn('[MenuModal] Skipping beverage creation, missing fields:', missing);
                        window.alert(`No se puede guardar la bebida. Faltan campos: ${missing.join(', ')}`);
                        continue;
                    }

                    const created = await createBeverageService(buildBeveragePayload(b, resolvedRestaurantId));
                    const id = created._id || created.id || created.data?._id || created.data?.id;
                    if (id) {
                        createdBeverageIds.push(id);
                                                setCreatedProducts(prev => [...prev, {
                                                    id,
                                                    name: b.name,
                                                    type: 'beverage',
                                                    recipeAdded: false
                                                }]);
                        console.debug('[MenuModal] Beverage created:', id);
                    }
                } catch (err) {
                    console.error('[MenuModal] error creating beverage', err?.response?.data || err?.message || err);
                }
            }

            console.debug('[MenuModal] Creating menu as main entity...');
            const menuPayload = {
                name: sourceData.Menu_Plate,
                Menu_id: finalMenuId,
                Menu_Plate: sourceData.Menu_Plate,
                description: sourceData.Menu_description_plate || null,
                Menu_description_plate: sourceData.Menu_description_plate || null,
                promotion: sourceData.Menu_Promotion || null,
                Menu_Promotion: sourceData.Menu_Promotion || null,
                available: Boolean(sourceData.Menu_available),
                Menu_available: Boolean(sourceData.Menu_available),
                restaurant_id: parseId(sourceData.Restaurant_id),
                Restaurant_id: parseId(sourceData.Restaurant_id),
                dishes: mergeUniqueIds(existingDishIds, createdDishIds),
                beverages: mergeUniqueIds(existingBeverageIds, createdBeverageIds),
            };

            console.debug('[MenuModal] Menu final payload:', menuPayload);

            if (menuPayload.dishes.length === 0 && menuPayload.beverages.length === 0) {
                throw new Error('Debes agregar al menos un platillo o una bebida para guardar el menú');
            }

            const menuResult = await saveMenu(menuPayload, menuId);
            if (!menuResult.success) {
                throw new Error(menuResult.error || 'Error al crear el menú');
            }
            console.debug('[MenuModal] Menu created successfully');

            reset();
            setDishForms([]);
            setBeverageForms([]);
            setSubType(null);
            setMenuDraft(null);

            // Si hay productos creados, cambiar a paso 4 para agregar recetas
            if (createdProducts.length > 0) {
                setStep(4);
            } else {
                // No hay productos nuevos, cerrar modal
                setStep(1);
                onClose();
            }
        } catch (err) {
            console.error('[MenuModal] error in onSubmitFinal', err);
        } finally {
            setSubmittingFinal(false);
        }
    };

    const saveCurrentForms = async () => {
        // Persist any dish/beverage forms that do not yet have an id
        setSavingItems(true);
        try {
            const existingDishIds = normalizeItemIds(menu?.dishes);
            const existingBeverageIds = normalizeItemIds(menu?.beverages);

            // Create dishes
            const updatedDishes = [...dishForms];
            for (let i = 0; i < updatedDishes.length; i++) {
                const d = updatedDishes[i];
                if (d.id) continue;
                try {
                    const resolvedRestaurantIdRaw = menuDraft?.Restaurant_id || menuDraft?.restaurant_id || document.querySelector('input[name="Restaurant_id"]')?.value || restaurantId || null;
                    const resolvedRestaurantId = parseId(resolvedRestaurantIdRaw);

                    const created = await createDishService({
                        // Legacy keys
                        Menu_id: computedMenuId || Date.now(),
                        Menu_Plate: d.name,
                        Menu_Price: Number(d.price) || 0,
                        Menu_type_plate: d.type,
                        Menu_description_plate: d.description || null,
                        Menu_available: Boolean(d.available),
                        Restaurant_id: resolvedRestaurantId,
                        // Modern keys
                        name: d.name,
                        price: Number(d.price) || 0,
                        type: d.type,
                        description: d.description || null,
                        available: Boolean(d.available),
                        restaurant_id: resolvedRestaurantId,
                    });
                    const id = created._id || created.id || created.data?._id || created.data?.id;
                    if (id) {
                        updatedDishes[i] = { ...d, id };
                        console.debug('[MenuModal] Dish saved (on Guardar):', id);
                    }
                } catch (err) {
                    console.error('[MenuModal] error saving dish (on Guardar)', err?.response?.data || err?.message || err);
                }
            }
            setDishForms(updatedDishes);

            // Create beverages
            const updatedBevs = [...beverageForms];
            for (let i = 0; i < updatedBevs.length; i++) {
                const b = updatedBevs[i];
                if (b.id) continue;
                try {
                    const resolvedRestaurantIdRaw = menuDraft?.Restaurant_id || menuDraft?.restaurant_id || document.querySelector('input[name="Restaurant_id"]')?.value || restaurantId || null;
                    const resolvedRestaurantId = parseId(resolvedRestaurantIdRaw);

                    const created = await createBeverageService(
                        buildBeveragePayload(b, resolvedRestaurantId)
                    );
                    const id = created._id || created.id || created.data?._id || created.data?.id;
                    if (id) {
                        updatedBevs[i] = { ...b, id };
                        console.debug('[MenuModal] Beverage saved (on Guardar):', id);
                    }
                } catch (err) {
                    console.error('[MenuModal] error saving beverage (on Guardar)', err?.response?.data || err?.message || err);
                }
            }
            setBeverageForms(updatedBevs);

            if (menuDraft && menuId) {
                const restaurantIdRaw = menuDraft.Restaurant_id || menuDraft.restaurant_id || restaurantId;
                await saveMenu({
                    ...menuDraft,
                    name: menuDraft.Menu_Plate || menuDraft.name || '',
                    restaurant_id: parseId(restaurantIdRaw),
                    Restaurant_id: parseId(restaurantIdRaw),
                    dishes: mergeUniqueIds(existingDishIds, updatedDishes.map((item) => item.id).filter(Boolean)),
                    beverages: mergeUniqueIds(existingBeverageIds, updatedBevs.map((item) => item.id).filter(Boolean)),
                }, menuId)
            }
        } finally {
            setSavingItems(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#2E160C]/60 backdrop-blur-sm flex justify-center items-center z-50 px-3">
            <div className="bg-[#FFFFFF] rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden border border-[#FCF0CA] flex flex-col">
                
                {/* Cabecera dinámica según el paso */}
                <div className="p-6 text-white bg-[#5B300E] shrink-0">
                    <h2 className="text-2xl font-bold">
                        {step === 1 && "Crear Nuevo Menú"}
                        {step === 2 && "Personaliza tu Menú"}
                        {step === 3 && `Agregar ${subType === 'dish' ? 'Platillo' : 'Bebida'}`}
                    </h2>
                </div>

        {/* Recipe Modal */}
        <RecipeModal
            isOpen={showRecipeModal}
            onClose={() => setShowRecipeModal(false)}
            productId={recipeProductId}
            productType={recipeProductType}
            restaurantId={restaurantId}
        />

                <div className="flex-1 overflow-y-auto p-6">
                    {/* PASO 1: FORMULARIO BÁSICO DEL MENÚ */}
                    {step === 1 && (
                        <form onSubmit={handleSubmit(onSubmitMenu)} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-[#2E160C] uppercase block mb-1">Nombre del Menú</label>
                                <input {...register("Menu_Plate", { required: "El nombre es obligatorio" })} className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FCF0CA] focus:border-[#5B300E] outline-none transition bg-gray-50/50" placeholder="Ej. Menu del Día" />
                                {errors.Menu_Plate && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.Menu_Plate.message}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-[#2E160C] uppercase block mb-1">Promoción</label>
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
                                <label className="text-xs font-bold text-[#2E160C] uppercase block mb-1">Restaurant ID</label>
                                <input {...register("Restaurant_id", { required: "El restaurante es obligatorio" })} className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FCF0CA] focus:border-[#5B300E] outline-none transition bg-gray-50/50" placeholder="ID del restaurante" />
                                {errors.Restaurant_id && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.Restaurant_id.message}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-[#2E160C] uppercase block mb-1">Descripción</label>
                                <textarea rows="3" {...register("Menu_description_plate")} className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FCF0CA] focus:border-[#5B300E] outline-none transition bg-gray-50/50 resize-none" placeholder="Describe el menú..." />
                                {errors.Menu_description_plate && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.Menu_description_plate.message}</p>}
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-[#FCF0CA] px-4 py-3 bg-[#FCF0CA]/40">
                                <input type="checkbox" className="h-4 w-4 accent-[#5B300E]" {...register("Menu_available")} />
                                <label className="text-sm font-semibold text-[#2E160C]">Disponible</label>
                            </div>

                            <div className="flex gap-2 pt-4">
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
                                    className="flex-1 py-3 bg-[#5B300E] text-white rounded-xl font-bold shadow-lg hover:bg-[#2E160C] transition disabled:opacity-50"
                                >
                                    {loading ? <Spinner /> : "Continuar"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* PASO 2: SELECCIÓN DE TIPO */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <p className="text-[#2E160C] text-sm mb-4">Selecciona qué deseas agregar a tu menú:</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => { setSubType('dish'); setStep(3); }}
                                    className="flex flex-col items-center p-6 border-2 border-[#FCF0CA] rounded-2xl hover:bg-[#FCF0CA] transition"
                                >
                                    <span className="text-3xl mb-2">🍲</span>
                                    <span className="font-bold text-[#5B300E]">Platillo</span>
                                </button>
                                <button 
                                    onClick={() => { setSubType('beverage'); setStep(3); }}
                                    className="flex flex-col items-center p-6 border-2 border-[#FCF0CA] rounded-2xl hover:bg-[#FCF0CA] transition"
                                >
                                    <span className="text-3xl mb-2">🥤</span>
                                    <span className="font-bold text-[#5B300E]">Bebida</span>
                                </button>
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                                <button 
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 bg-gray-200 rounded-xl font-bold text-[#2E160C] hover:bg-gray-300 transition"
                                >
                                    Volver
                                </button>
                                <button 
                                    disabled={loading || submittingFinal}
                                    onClick={() => {
                                        const values = menuDraft || getValues();
                                        onSubmitFinal(values);
                                    }}
                                    className="flex-1 py-3 bg-[#5B300E] text-white rounded-xl font-bold hover:bg-[#2E160C] transition disabled:opacity-50"
                                >
                                    {submittingFinal ? <Spinner /> : "Finalizar"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PASO 3: FORMULARIO DETALLADO (PLATILLO O BEBIDA) */}
                    {step === 3 && (
                        <div className="space-y-4">
                            {subType === 'dish' ? (
                                <>
                                    {dishForms.map((form, idx) => (
                                        <div key={idx} className="p-3 border rounded-lg bg-white">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <strong>Platillo #{idx + 1}</strong>
                                                    {form.id && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setRecipeProductId(form.id);
                                                                setRecipeProductType('dish');
                                                                setShowRecipeModal(true);
                                                            }}
                                                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                                                        >
                                                            📝 Receta
                                                        </button>
                                                    )}
                                                </div>
                                                <button type="button" onClick={() => setDishForms(prev => prev.filter((_, i) => i !== idx))} className="text-sm text-red-500">Eliminar</button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input placeholder="Nombre" value={form.name} onChange={(e) => setDishForms(prev => prev.map((p, i) => i===idx?{...p,name:e.target.value}:p))} className="p-2 border rounded" />
                                                <input placeholder="Precio" type="number" value={form.price} onChange={(e) => setDishForms(prev => prev.map((p, i) => i===idx?{...p,price:e.target.value}:p))} className="p-2 border rounded" />
                                                <select value={form.type} onChange={(e) => setDishForms(prev => prev.map((p, i) => i===idx?{...p,type:e.target.value}:p))} className="p-2 border rounded col-span-2">
                                                    <option value="">Selecciona un tipo</option>
                                                    <option value="Entrada">Entrada</option>
                                                    <option value="Plato_fuerte">Plato_fuerte</option>
                                                    <option value="Postre">Postre</option>
                                                    <option value="Acompañamiento">Acompañamiento</option>
                                                </select>
                                                <textarea placeholder="Descripción" value={form.description} onChange={(e) => setDishForms(prev => prev.map((p, i) => i===idx?{...p,description:e.target.value}:p))} className="p-2 border rounded col-span-2" />
                                                <label className="flex items-center gap-2 col-span-2"><input type="checkbox" checked={form.available} onChange={(e) => setDishForms(prev => prev.map((p, i) => i===idx?{...p,available:e.target.checked}:p))} /> Disponible</label>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {beverageForms.map((form, idx) => (
                                        <div key={idx} className="p-3 border rounded-lg bg-white">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <strong>Bebida #{idx + 1}</strong>
                                                    {form.id && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setRecipeProductId(form.id);
                                                                setRecipeProductType('beverage');
                                                                setShowRecipeModal(true);
                                                            }}
                                                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                                                        >
                                                            📝 Receta
                                                        </button>
                                                    )}
                                                </div>
                                                <button type="button" onClick={() => setBeverageForms(prev => prev.filter((_, i) => i !== idx))} className="text-sm text-red-500">Eliminar</button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input placeholder="Nombre" value={form.name} onChange={(e) => setBeverageForms(prev => prev.map((p, i) => i===idx?{...p,name:e.target.value}:p))} className="p-2 border rounded" />
                                                <input placeholder="Imagen URL" value={form.image || ''} onChange={(e) => setBeverageForms(prev => prev.map((p, i) => i===idx?{...p,image:e.target.value}:p))} className="p-2 border rounded" />
                                                <input placeholder="Precio" type="number" value={form.price} onChange={(e) => setBeverageForms(prev => prev.map((p, i) => i===idx?{...p,price:e.target.value}:p))} className="p-2 border rounded" />
                                                <select value={form.type} onChange={(e) => setBeverageForms(prev => prev.map((p, i) => i===idx?{...p,type:e.target.value}:p))} className="p-2 border rounded col-span-2">
                                                    <option value="">Selecciona un tipo</option>
                                                    {beverageTypeOptions.map((option) => (
                                                        <option key={option} value={option}>
                                                            {option.replaceAll('_', ' ')}
                                                        </option>
                                                    ))}
                                                </select>
                                                <textarea placeholder="Descripción" value={form.description} onChange={(e) => setBeverageForms(prev => prev.map((p, i) => i===idx?{...p,description:e.target.value}:p))} className="p-2 border rounded col-span-2" />
                                                <label className="flex items-center gap-2 col-span-2"><input type="checkbox" checked={form.available} onChange={(e) => setBeverageForms(prev => prev.map((p, i) => i===idx?{...p,available:e.target.checked}:p))} /> Disponible</label>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={saveCurrentForms}
                                    disabled={savingItems}
                                    className="flex-1 py-2 bg-[#2E6B2E] text-white rounded-xl font-bold disabled:opacity-50"
                                >
                                    {savingItems ? <Spinner /> : 'Guardar'}
                                </button>
                                <button 
                                    onClick={() => {
                                        if (subType === 'dish') {
                                            setDishForms(prev => [...prev, { name: '', price: '', type: '', description: '', available: true }]);
                                        } else {
                                            setBeverageForms(prev => [...prev, { name: '', price: '', type: '', description: '', image: '', available: true, estado: true }]);
                                        }
                                    }}
                                    className="flex-1 py-2 bg-[#5B300E] text-white rounded-xl font-bold"
                                >
                                    Agregar otro
                                </button>
                                <button 
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-2 bg-gray-200 rounded-xl font-bold text-[#2E160C]"
                                >
                                    Volver
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PASO 4: AGREGAR RECETAS A PRODUCTOS CREADOS */}
                    {step === 4 && createdProducts.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Agregar Recetas</h3>
                            <p className="text-sm text-gray-600">
                                Se han creado {createdProducts.length} producto(s). Ahora puedes agregar recetas a cada uno.
                            </p>

                            <div className="space-y-3">
                                {createdProducts.map((product, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{product.name}</p>
                                            <p className="text-xs text-gray-600">
                                                {product.type === 'dish' ? 'Platillo' : 'Bebida'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRecipeProductId(product.id);
                                                setRecipeProductType(product.type);
                                                setShowRecipeModal(true);
                                            }}
                                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                                        >
                                            📝 Receta
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={() => {
                                        setCreatedProducts([]);
                                        onClose();
                                    }}
                                    className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition"
                                >
                                    Finalizar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
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


