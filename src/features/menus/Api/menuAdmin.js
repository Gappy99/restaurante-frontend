import { axiosAdmin } from "../Api/api.js"

export const getMenus = async () => {
    return axiosAdmin.get("/menus");
}

export const createMenu = async (data) => {
    return await axiosAdmin.post("/menus", data, {
        headers: { "Content-Type": "multipart/form-data"}
    })
}

export const updateMenu = async (id, data) => {
    return await axiosAdmin.put(`/menus/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data"}
    })
}

export const deleteMenu = async (id) => {
    return await axiosAdmin.put(`/menus/${id}/desactivate`)
}