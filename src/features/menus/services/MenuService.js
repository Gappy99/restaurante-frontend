import { axiosAdmin } from "../../menus/Api/api.js";

export const getMenusRequest = async () => {
    try {
        const response = await axiosAdmin.get("/menu");
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Error al obtener menús";
    }
};

export const createMenuRequest = async (menuData) => {
    try {
        const response = await axiosAdmin.post("/menu", menuData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Error al crear menú";
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