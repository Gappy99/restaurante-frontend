import { create } from "zustand";
import { 
    getMenus as getMenusRequest, 
    createMenu as createMenuRequest, 
    updateMenu as updateMenuRequest, 
    deleteMenu as deleteMenuRequest 
} from "../Api/menuAdmin.js"; 
import toast from "react-hot-toast";

export const useMenuStore = create((set, get) => ({
    menus: [],
    loading: false,
    error: null,

    fetchMenus: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getMenusRequest();
            set({ menus: response.data || [], loading: false });
            return { success: true, data: response.data };
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar los menús";
            set({ error: message, loading: false, menus: [] });
            toast.error(message);
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
            return { success: false };
        }
    },

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

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
