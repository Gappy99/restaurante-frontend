import { axiosAdmin } from "../../menus/Api/api.js";

export const getMenusRequest = async () => {
    try {
        const response = await axiosAdmin.get("/fields");
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Error al obtener menús";
    }
};

export const createMenuRequest = async (menuData) => {
    try {
        const response = await axiosAdmin.post("/fields", menuData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Error al crear menú";
    }
};

export const updateMenuRequest = async (id, menuData) => {
    try {
        const response = await axiosAdmin.put(`/fields/${id}`, menuData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Error al actualizar";
    }
};

export const deleteMenuRequest = async (id) => {
    try {
        const response = await axiosAdmin.put(`/fields/${id}/desactivate`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Error al eliminar";
    }
};