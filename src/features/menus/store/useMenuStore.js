import { create } from "zustand";
import { 
    getMenusRequest, 
    createMenuRequest, 
    updateMenuRequest, 
    deleteMenuRequest 
} from "../services/MenuService.js"; 
import toast from "react-hot-toast";

const normalizeMenuList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.menus)) return payload.menus;
    return [];
};

export const useMenuStore = create((set, get) => ({
    // State
    menus: [],
    currentMenu: null,
    loading: false,
    error: null,
    filters: {
        search: '',
        restaurant: null,
        available: null,
    },

    // Setters
    setMenus: (menus) => set({ menus }),
    setCurrentMenu: (menu) => set({ currentMenu: menu }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setFilters: (filters) =>
        set((state) => ({
            filters: { ...state.filters, ...filters },
        })),

    clearError: () => set({ error: null }),
    clearCurrentMenu: () => set({ currentMenu: null }),

    resolveMenuId: (menu) => menu?._id || menu?.id,

    // Async Actions
    fetchMenus: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getMenusRequest();
            const menus = normalizeMenuList(response);
            set({ menus, loading: false });
            return { success: true, data: menus };
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar los menús";
            set({ error: message, loading: false, menus: [] });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    fetchMenuById: async (id) => {
        try {
            set({ loading: true, error: null });
            // Buscar en la lista local
            const menu = get().menus.find(m => (m._id || m.id) === id);
            if (menu) {
                set({ currentMenu: menu, loading: false });
                return { success: true, data: menu };
            }
            set({ loading: false, error: "Menú no encontrado" });
            return { success: false, error: "Menú no encontrado" };
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar el menú";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    saveMenu: async (formData, id = null) => {
        try {
            set({ loading: true, error: null });
            
            if (id) {
                await updateMenuRequest(id, formData);
                toast.success("Menú actualizado exitosamente");
            } else {
                await createMenuRequest(formData);
                toast.success("Menú creado exitosamente");
            }

            await get().fetchMenus();
            set({ loading: false });
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Error al guardar el menú";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    removeMenu: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteMenuRequest(id);
            toast.success("Menú desactivado exitosamente");
            await get().fetchMenus();
            set({ loading: false });
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Error al desactivar el menú";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    // Local mutations
    addMenu: (menu) => {
        set(state => ({ menus: [...state.menus, menu] }));
    },

    updateMenuLocal: (id, updatedMenu) => {
        set(state => ({
            menus: state.menus.map(menu => 
                (menu._id || menu.id) === id ? { ...menu, ...updatedMenu } : menu
            )
        }));
    },

    deleteMenuLocal: (id) => {
        set(state => ({
            menus: state.menus.filter(menu => (menu._id || menu.id) !== id)
        }));
    },

    // Getters
    getFilteredMenus: () => {
        const state = get();
        let filtered = state.menus;

        if (state.filters.search) {
            filtered = filtered.filter((m) =>
                (m.name || m.Menu_Plate || '')
                    .toLowerCase()
                    .includes(state.filters.search.toLowerCase())
            );
        }

        if (state.filters.available !== null) {
            filtered = filtered.filter((m) => m.available === state.filters.available);
        }

        if (state.filters.restaurant) {
            filtered = filtered.filter((m) => 
                (m.restaurant_id || m.Restaurant_id) === state.filters.restaurant
            );
        }

        return filtered;
    },

    getTotalCount: () => get().menus.length,

    getMenuById: (id) =>
        get().menus.find((m) => (m._id || m.id) === id),
}));

export default useMenuStore;

