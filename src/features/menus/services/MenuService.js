import { axiosAdmin } from "../Api/api.js";

export const getMenusRequest = async (params = {}) => {
    try {
        const response = await axiosAdmin.get("/menu", { params });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Error al obtener menús";
    }
};

export const createMenuRequest = async (menuData) => {
    try {
        console.debug("[MenuService] createMenu payload:", menuData);
        const response = await axiosAdmin.post("/menu", menuData);
        return response.data;
    } catch (error) {
        const backendError = error.response?.data;
        console.error("[MenuService] createMenu error response:", backendError || error.message || error);
        const detailMessage = backendError?.errors?.length
            ? `${backendError.message || "Error de validación"}: ${backendError.errors.map((item) => item?.msg || item?.message || item?.path || JSON.stringify(item)).join(" | ")}`
            : backendError?.message || "Error al crear menú";
        throw detailMessage;
    }
};

export const updateMenuRequest = async (id, menuData) => {
    try {
        const response = await axiosAdmin.put(`/menu/${id}`, menuData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Error al actualizar";
    }
};

export const deleteMenuRequest = async (id) => {
    try {
        const response = await axiosAdmin.delete(`/menu/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Error al eliminar";
    }
};