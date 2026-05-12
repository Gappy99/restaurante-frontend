import {
    createOrder as createOrderRequest,
    getOrders as getOrdersRequest,
    getOrderById as getOrderByIdRequest,
    getOrderByIdWithDetails as getOrderByIdWithDetailsRequest,
    searchOrders as searchOrdersRequest,
    updateOrder as updateOrderRequest,
    deleteOrder as deleteOrderRequest,
} from "../Api/ordersAdmin.js";

export const createOrderService = async (data) => {
    try {
        const response = await createOrderRequest(data);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al crear orden";
    }
};

export const getOrdersService = async () => {
    try {
        const response = await getOrdersRequest();
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al obtener ordenes";
    }
};

export const getOrderByIdService = async (id) => {
    try {
        const response = await getOrderByIdRequest(id);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al obtener orden";
    }
};

export const getOrderByIdWithDetailsService = async (id) => {
    try {
        const response = await getOrderByIdWithDetailsRequest(id);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al obtener detalle de orden";
    }
};

export const searchOrdersService = async (searchTerm) => {
    try {
        const response = await searchOrdersRequest(searchTerm);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al buscar ordenes";
    }
};

export const updateOrderService = async (id, data) => {
    try {
        const response = await updateOrderRequest(id, data);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al actualizar orden";
    }
};

export const deleteOrderService = async (id) => {
    try {
        const response = await deleteOrderRequest(id);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al eliminar orden";
    }
};

export default {
    createOrderService,
    getOrdersService,
    getOrderByIdService,
    getOrderByIdWithDetailsService,
    searchOrdersService,
    updateOrderService,
    deleteOrderService,
};
