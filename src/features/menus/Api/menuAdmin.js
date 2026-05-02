import { axiosAdmin } from "../Api/api.js"

export const getMenus = async () => {
    const response = await axiosAdmin.get("/menu");
    return response.data;
}

export const createMenu = async (data) => {
    const response = await axiosAdmin.post("/menu", data);
    return response.data;
}

export const updateMenu = async (id, data) => {
    const response = await axiosAdmin.put(`/menu/${id}`, data);
    return response.data;
}

export const deleteMenu = async (id) => {
    const response = await axiosAdmin.delete(`/menu/${id}`)
    return response.data;
}