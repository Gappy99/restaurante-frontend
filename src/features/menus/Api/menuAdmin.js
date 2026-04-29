import { axiosAdmin } from "../Api/api.js"

export const getMenus = async () => {
    return axiosAdmin.get("/fields");
}

export const createMenu = async (data) => {
    return await axiosAdmin.post("/fields", data, {
        headers: { "Content-Type": "multipart/form-data"}
    })
}

export const updateMenu = async (id, data) => {
    return await axiosAdmin.put(`/fields/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data"}
    })
}

export const deleteMenu = async (id) => {
    return await axiosAdmin.put(`/fields/${id}/desactivate`)
}