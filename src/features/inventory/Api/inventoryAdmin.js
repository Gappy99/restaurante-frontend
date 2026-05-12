import { axiosAdmin } from "../../menus/Api/api.js";

export const createInventory = async (data) => {
    const response = await axiosAdmin.post("/inventory", data);
    return response.data;
};

export const getInventory = async (restaurantId = null) => {
    const query = restaurantId ? `?restaurantId=${encodeURIComponent(restaurantId)}` : "";
    const response = await axiosAdmin.get(`/inventory${query}`);
    return response.data;
};

export const getInventoryByRestaurant = async (restaurantId) => {
    const response = await axiosAdmin.get(`/inventory/restaurant/${restaurantId}`);
    return response.data;
};

export const getInventoryById = async (id) => {
    const response = await axiosAdmin.get(`/inventory/${id}`);
    return response.data;
};

export const updateInventory = async (id, data) => {
    const response = await axiosAdmin.put(`/inventory/${id}`, data);
    return response.data;
};

export const deleteInventory = async (id) => {
    const response = await axiosAdmin.delete(`/inventory/${id}`);
    return response.data;
};

export const decreaseInventory = async (id, quantity, restaurant_id = null) => {
    const payload = restaurant_id ? { quantity, restaurant_id } : { quantity };
    const response = await axiosAdmin.post(`/inventory/${id}/decrease`, payload);
    return response.data;
};

export const increaseInventory = async (id, quantity) => {
    const response = await axiosAdmin.post(`/inventory/${id}/increase`, { quantity });
    return response.data;
};

export const searchInventoryByName = async (restaurantId, name) => {
    const response = await axiosAdmin.get(
        `/inventory/restaurant/${restaurantId}/search?name=${encodeURIComponent(name)}`
    );
    return response.data;
};
