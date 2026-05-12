import { axiosAdmin } from "../../menus/Api/api.js";

export const createDetallePedido = async (data) => {
    const response = await axiosAdmin.post("/detallepedido", data);
    return response.data;
};

export const getDetallePedidos = async () => {
    const response = await axiosAdmin.get("/detallepedido");
    return response.data;
};

export const getDetallePedidoById = async (id) => {
    const response = await axiosAdmin.get(`/detallepedido/${id}`);
    return response.data;
};

export const getDetallePedidosByOrder = async (orderId) => {
    const response = await axiosAdmin.get(`/detallepedido/order/${orderId}`);
    return response.data;
};

export const updateDetallePedido = async (id, data) => {
    const response = await axiosAdmin.put(`/detallepedido/${id}`, data);
    return response.data;
};

export const deleteDetallePedido = async (id) => {
    const response = await axiosAdmin.delete(`/detallepedido/${id}`);
    return response.data;
};
