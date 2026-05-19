import { create } from "zustand";
import toast from "react-hot-toast";
import useAuthStore from '../../../shared/stores/useAuthStore'
import { filterByRestaurant } from '../../../shared/utils/restaurantScope'
import { getAssignedRestaurantId, isManagerRole } from '../../../shared/utils/roles'
import {
    createInventoryService,
    getInventoryService,
    getInventoryByRestaurantService,
    getInventoryByIdService,
    updateInventoryService,
    deleteInventoryService,
    decreaseInventoryService,
    increaseInventoryService,
    searchInventoryByNameService,
} from "../services/InventoryService.js";

const normalizeInventoryList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
};

const normalizeInventoryItem = (payload) => {
    if (payload?.data) return payload.data;
    return payload;
};

const inventoryId = (item) => item?._id || item?.id;

export const useInventoryStore = create((set, get) => ({
    items: [],
    currentItem: null,
    loading: false,
    error: null,
    filters: {
        search: "",
        restaurant: null,
        category: null,
        lowStockThreshold: null,
    },

    setItems: (items) => set({ items }),
    setCurrentItem: (item) => set({ currentItem: item }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setFilters: (filters) =>
        set((state) => ({
            filters: { ...state.filters, ...filters },
        })),

    clearError: () => set({ error: null }),
    clearCurrentItem: () => set({ currentItem: null }),

    resolveInventoryId: (item) => inventoryId(item),

    fetchInventory: async (restaurantId = null) => {
        try {
            set({ loading: true, error: null });
            const user = useAuthStore.getState().user
            const managerRestaurantId = isManagerRole(user?.rol) ? getAssignedRestaurantId(user) : ''
            const scopedRestaurantId = restaurantId || managerRestaurantId || null

            const response = await getInventoryService(scopedRestaurantId);
            const items = normalizeInventoryList(response);
            const scopedItems = scopedRestaurantId
                ? filterByRestaurant(items, scopedRestaurantId)
                : items;
            set({
                items: scopedItems,
                filters: { ...get().filters, restaurant: scopedRestaurantId || get().filters.restaurant },
                loading: false,
            });
            return { success: true, data: scopedItems };
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar inventario";
            set({ error: message, loading: false, items: [] });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    fetchInventoryByRestaurant: async (restaurantId) => {
        try {
            set({ loading: true, error: null });
            const user = useAuthStore.getState().user
            const managerRestaurantId = isManagerRole(user?.rol) ? getAssignedRestaurantId(user) : ''
            const scopedRestaurantId = restaurantId || managerRestaurantId || null

            const response = await getInventoryByRestaurantService(scopedRestaurantId);
            const items = normalizeInventoryList(response);
            const scopedItems = scopedRestaurantId
                ? filterByRestaurant(items, scopedRestaurantId)
                : items;
            set({ items: scopedItems, filters: { ...get().filters, restaurant: scopedRestaurantId }, loading: false });
            return { success: true, data: scopedItems };
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar inventario del restaurante";
            set({ error: message, loading: false, items: [] });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    fetchInventoryById: async (id) => {
        try {
            set({ loading: true, error: null });
            const response = await getInventoryByIdService(id);
            const item = normalizeInventoryItem(response);
            set({ currentItem: item, loading: false });
            return { success: true, data: item };
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar articulo";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    saveInventoryItem: async (formData, id = null) => {
        try {
            set({ loading: true, error: null });

            if (id) {
                await updateInventoryService(id, formData);
                toast.success("Articulo de inventario actualizado exitosamente");
            } else {
                await createInventoryService(formData);
                toast.success("Articulo de inventario creado exitosamente");
            }

            const restaurantId = get().filters.restaurant;
            if (restaurantId) {
                await get().fetchInventoryByRestaurant(restaurantId);
            } else {
                await get().fetchInventory();
            }

            set({ loading: false });
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Error al guardar articulo de inventario";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    removeInventoryItem: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteInventoryService(id);
            toast.success("Articulo de inventario eliminado exitosamente");

            const restaurantId = get().filters.restaurant;
            if (restaurantId) {
                await get().fetchInventoryByRestaurant(restaurantId);
            } else {
                await get().fetchInventory();
            }

            set({ loading: false });
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Error al eliminar articulo de inventario";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    decreaseStock: async (id, quantity, restaurantId = null) => {
        try {
            set({ loading: true, error: null });
            const response = await decreaseInventoryService(id, quantity, restaurantId);
            const updatedItem = normalizeInventoryItem(response);
            get().updateInventoryItemLocal(id, updatedItem);
            set({ loading: false });
            return { success: true, data: updatedItem };
        } catch (err) {
            const message = err.response?.data?.message || "Error al descontar inventario";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    increaseStock: async (id, quantity) => {
        try {
            set({ loading: true, error: null });
            const response = await increaseInventoryService(id, quantity);
            const updatedItem = normalizeInventoryItem(response);
            get().updateInventoryItemLocal(id, updatedItem);
            set({ loading: false });
            return { success: true, data: updatedItem };
        } catch (err) {
            const message = err.response?.data?.message || "Error al incrementar inventario";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    searchInventoryByName: async (restaurantId, name) => {
        try {
            set({ loading: true, error: null });
            const user = useAuthStore.getState().user
            const managerRestaurantId = isManagerRole(user?.rol) ? getAssignedRestaurantId(user) : ''
            const scopedRestaurantId = restaurantId || managerRestaurantId || null

            const response = await searchInventoryByNameService(scopedRestaurantId, name);
            const items = normalizeInventoryList(response);
            const scopedItems = scopedRestaurantId
                ? filterByRestaurant(items, scopedRestaurantId)
                : items;
            set({
                items: scopedItems,
                filters: { ...get().filters, search: name, restaurant: scopedRestaurantId },
                loading: false,
            });
            return { success: true, data: scopedItems };
        } catch (err) {
            const message = err.response?.data?.message || "Error al buscar inventario";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    addInventoryItem: (item) => {
        set((state) => ({ items: [...state.items, item] }));
    },

    updateInventoryItemLocal: (id, updatedItem) => {
        set((state) => ({
            items: state.items.map((item) =>
                inventoryId(item) === id ? { ...item, ...updatedItem } : item
            ),
            currentItem:
                state.currentItem && inventoryId(state.currentItem) === id
                    ? { ...state.currentItem, ...updatedItem }
                    : state.currentItem,
        }));
    },

    deleteInventoryItemLocal: (id) => {
        set((state) => ({
            items: state.items.filter((item) => inventoryId(item) !== id),
        }));
    },

    getFilteredInventory: () => {
        const state = get();
        let filtered = state.items;

        if (state.filters.search) {
            const term = state.filters.search.toLowerCase();
            filtered = filtered.filter((item) =>
                String(item.item_name || "").toLowerCase().includes(term)
            );
        }

        if (state.filters.category) {
            filtered = filtered.filter((item) => item.category === state.filters.category);
        }

        if (state.filters.restaurant) {
            filtered = filtered.filter((item) => {
                const rid = item.restaurant_id?._id || item.restaurant_id;
                return rid === state.filters.restaurant;
            });
        }

        if (state.filters.lowStockThreshold !== null && state.filters.lowStockThreshold !== undefined) {
            filtered = filtered.filter((item) => Number(item.quantity) <= Number(state.filters.lowStockThreshold));
        }

        return filtered;
    },

    getTotalCount: () => get().items.length,

    getInventoryItemByIdLocal: (id) => get().items.find((item) => inventoryId(item) === id) || null,
}));

export default useInventoryStore;
