import { create } from "zustand";
import {
    createBeverageService,
    getBeveragesByRestaurantService,
    getBeverageByIdService,
    updateBeverageService,
    deleteBeverageService,
    searchBeveragesByNameService
} from "../services/BeverageService.js";
import toast from "react-hot-toast";

const normalizeBeverageList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.beverages)) return payload.beverages;
    return [];
};

export const useBeverageStore = create((set, get) => ({
    // State
    beverages: [],
    currentBeverage: null,
    loading: false,
    error: null,
    filters: {
        search: '',
        restaurant: null,
        type: null,
        available: null,
    },

    // Setters
    setBeverages: (beverages) => set({ beverages }),
    setCurrentBeverage: (beverage) => set({ currentBeverage: beverage }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setFilters: (filters) =>
        set((state) => ({
            filters: { ...state.filters, ...filters },
        })),

    clearError: () => set({ error: null }),
    clearCurrentBeverage: () => set({ currentBeverage: null }),

    resolveBeverageId: (beverage) => beverage?._id || beverage?.id,

    // Async Actions
    fetchBeveragesByRestaurant: async (restaurantId) => {
        try {
            set({ loading: true, error: null });
            const response = await getBeveragesByRestaurantService(restaurantId);
            const beverages = normalizeBeverageList(response);
            set({ beverages, loading: false });
            return { success: true, data: beverages };
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar bebidas";
            set({ error: message, loading: false, beverages: [] });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    fetchBeverageById: async (id) => {
        try {
            set({ loading: true, error: null });
            const response = await getBeverageByIdService(id);
            set({ currentBeverage: response.data, loading: false });
            return { success: true, data: response.data };
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar bebida";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    saveBeverage: async (formData, id = null) => {
        try {
            set({ loading: true, error: null });

            if (id) {
                await updateBeverageService(id, formData);
                toast.success("Bebida actualizada exitosamente");
            } else {
                await createBeverageService(formData);
                toast.success("Bebida creada exitosamente");
            }

            // Refetch si tenemos restaurante activo
            const state = get();
            if (state.filters.restaurant) {
                await state.fetchBeveragesByRestaurant(state.filters.restaurant);
            }

            set({ loading: false });
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Error al guardar bebida";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    removeBeverage: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteBeverageService(id);
            toast.success("Bebida eliminada exitosamente");
            
            // Refetch si tenemos restaurante activo
            const state = get();
            if (state.filters.restaurant) {
                await state.fetchBeveragesByRestaurant(state.filters.restaurant);
            }
            
            set({ loading: false });
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Error al eliminar bebida";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    searchBeverages: async (restaurantId, searchTerm) => {
        try {
            set({ loading: true, error: null });
            const response = await searchBeveragesByNameService(restaurantId, searchTerm);
            const beverages = normalizeBeverageList(response);
            set({
                beverages,
                filters: { ...get().filters, search: searchTerm },
                loading: false,
            });
            return { success: true, data: beverages };
        } catch (err) {
            const message = err.response?.data?.message || "Error al buscar bebidas";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    // Local mutations
    addBeverage: (beverage) => {
        set(state => ({ beverages: [...state.beverages, beverage] }));
    },

    updateBeverageLocal: (id, updatedBeverage) => {
        set(state => ({
            beverages: state.beverages.map(beverage =>
                (beverage._id || beverage.id) === id ? { ...beverage, ...updatedBeverage } : beverage
            )
        }));
    },

    deleteBeverageLocal: (id) => {
        set(state => ({
            beverages: state.beverages.filter(beverage => (beverage._id || beverage.id) !== id)
        }));
    },

    // Getters
    getFilteredBeverages: () => {
        const state = get();
        let filtered = state.beverages;

        if (state.filters.search) {
            filtered = filtered.filter((b) =>
                (b.name || '')
                    .toLowerCase()
                    .includes(state.filters.search.toLowerCase())
            );
        }

        if (state.filters.type) {
            filtered = filtered.filter((b) => b.type === state.filters.type);
        }

        if (state.filters.available !== null) {
            filtered = filtered.filter((b) => b.available === state.filters.available);
        }

        return filtered;
    },

    getTotalCount: () => get().beverages.length,

    getBeverageById: (id) =>
        get().beverages.find((b) => (b._id || b.id) === id),

    getBeveragesByType: (type) =>
        get().beverages.filter((b) => b.type === type && b.available),
}));

export default useBeverageStore;
