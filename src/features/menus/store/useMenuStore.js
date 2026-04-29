import { create } from "zustand";
import { 
    getMenus as getMenusRequest, 
    createMenu as createMenuRequest, 
    updateMenu as updateMenuRequest, 
    deleteMenu as deleteMenuRequest 
} from "../../menus/Api/menuAdmin.js"; 
import { showError } from "../../../shared/utils/toast";

export const useAuthStore = create((set, get) => ({
    menus: [],
    loading: false,
    error: null,

    fetchMenus: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getMenusRequest();
            set({ menus: response.data, loading: false });
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar los menús";
            set({ error: message, loading: false });
            showError(message);
        }
    },

    saveMenu: async (formData, id = null) => {
        try {
            set({ loading: true, error: null });
            
            if (id) {
                await updateMenuRequest(id, formData);
            } else {
                await createMenuRequest(formData);
            }

            await get().fetchMenus();
            set({ loading: false });
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Error al guardar el menú";
            set({ error: message, loading: false });
            showError(message);
            return { success: false, error: message };
        }
    },

    removeMenu: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteMenuRequest(id);
            await get().fetchMenus();
            set({ loading: false });
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Error al desactivar el menú";
            set({ error: message, loading: false });
            showError(message);
            return { success: false };
        }
    }
}));
