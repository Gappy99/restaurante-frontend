import { create } from "zustand";
import {
    createDishService,
    getDishesByRestaurantService,
    getDishByIdService,
    updateDishService,
    deleteDishService,
    searchDishesByNameService
} from "../services/DishService.js";
import toast from "react-hot-toast";

const normalizeDishList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.dishes)) return payload.dishes;
    return [];
};

export const useDishStore = create((set, get) => ({
    // State
    dishes: [],
    currentDish: null,
    loading: false,
    error: null,
    filters: {
        search: '',
        restaurant: null,
        type: null,
        available: null,
    },

    // Setters
    setDishes: (dishes) => set({ dishes }),
    setCurrentDish: (dish) => set({ currentDish: dish }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setFilters: (filters) =>
        set((state) => ({
            filters: { ...state.filters, ...filters },
        })),

    clearError: () => set({ error: null }),
    clearCurrentDish: () => set({ currentDish: null }),

    resolveDishId: (dish) => dish?._id || dish?.id,

    // Async Actions
    fetchDishesByRestaurant: async (restaurantId) => {
        try {
            set({ loading: true, error: null });
            const response = await getDishesByRestaurantService(restaurantId);
            const dishes = normalizeDishList(response);
            set({ dishes, loading: false });
            return { success: true, data: dishes };
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar platillos";
            set({ error: message, loading: false, dishes: [] });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    fetchDishById: async (id) => {
        try {
            set({ loading: true, error: null });
            const response = await getDishByIdService(id);
            set({ currentDish: response.data, loading: false });
            return { success: true, data: response.data };
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar platillo";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    saveDish: async (formData, id = null) => {
        try {
            set({ loading: true, error: null });

            if (id) {
                await updateDishService(id, formData);
                toast.success("Platillo actualizado exitosamente");
            } else {
                await createDishService(formData);
                toast.success("Platillo creado exitosamente");
            }

            // Refetch si tenemos restaurante activo
            const state = get();
            if (state.filters.restaurant) {
                await state.fetchDishesByRestaurant(state.filters.restaurant);
            }

            set({ loading: false });
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Error al guardar platillo";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    removeDish: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteDishService(id);
            toast.success("Platillo eliminado exitosamente");
            
            // Refetch si tenemos restaurante activo
            const state = get();
            if (state.filters.restaurant) {
                await state.fetchDishesByRestaurant(state.filters.restaurant);
            }
            
            set({ loading: false });
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Error al eliminar platillo";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    searchDishes: async (restaurantId, searchTerm) => {
        try {
            set({ loading: true, error: null });
            const response = await searchDishesByNameService(restaurantId, searchTerm);
            const dishes = normalizeDishList(response);
            set({
                dishes,
                filters: { ...get().filters, search: searchTerm },
                loading: false,
            });
            return { success: true, data: dishes };
        } catch (err) {
            const message = err.response?.data?.message || "Error al buscar platillos";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    // Local mutations
    addDish: (dish) => {
        set(state => ({ dishes: [...state.dishes, dish] }));
    },

    updateDishLocal: (id, updatedDish) => {
        set(state => ({
            dishes: state.dishes.map(dish =>
                (dish._id || dish.id) === id ? { ...dish, ...updatedDish } : dish
            )
        }));
    },

    deleteDishLocal: (id) => {
        set(state => ({
            dishes: state.dishes.filter(dish => (dish._id || dish.id) !== id)
        }));
    },

    // Getters
    getFilteredDishes: () => {
        const state = get();
        let filtered = state.dishes;

        if (state.filters.search) {
            filtered = filtered.filter((d) =>
                (d.name || '')
                    .toLowerCase()
                    .includes(state.filters.search.toLowerCase())
            );
        }

        if (state.filters.type) {
            filtered = filtered.filter((d) => d.type === state.filters.type);
        }

        if (state.filters.available !== null) {
            filtered = filtered.filter((d) => d.available === state.filters.available);
        }

        return filtered;
    },

    getTotalCount: () => get().dishes.length,

    getDishById: (id) =>
        get().dishes.find((d) => (d._id || d.id) === id),

    getDishesByType: (type) =>
        get().dishes.filter((d) => d.type === type && d.available),
}));

export default useDishStore;
