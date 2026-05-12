import { axiosAdmin } from "../../menus/Api/api.js";

export const createOrder = async (data) => {
    const response = await axiosAdmin.post("/orders", data);
    return response.data;
};

export const getOrders = async () => {
    const response = await axiosAdmin.get("/orders");
    return response.data;
};

export const getOrderById = async (id) => {
    const response = await axiosAdmin.get(`/orders/${id}`);
    return response.data;
};

export const getOrderByIdWithDetails = async (id) => {
    const response = await axiosAdmin.get(`/orders/${id}/details`);
    return response.data;
};

export const searchOrders = async (searchTerm) => {
    const response = await axiosAdmin.get(`/orders/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    return response.data;
};

export const updateOrder = async (id, data) => {
    const response = await axiosAdmin.put(`/orders/${id}`, data);
    return response.data;
};

export const deleteOrder = async (id) => {
    const response = await axiosAdmin.delete(`/orders/${id}`);
    return response.data;
};
