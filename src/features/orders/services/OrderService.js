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
        throw error;
    }
};

export const getOrdersService = async (params = {}) => {
    try {
        const response = await getOrdersRequest(params);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getOrderByIdService = async (id) => {
    try {
        const response = await getOrderByIdRequest(id);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getOrderByIdWithDetailsService = async (id) => {
    try {
        const response = await getOrderByIdWithDetailsRequest(id);
        return response;
    } catch (error) {
        throw error;
    }
};

export const searchOrdersService = async (searchTerm) => {
    try {
        const response = await searchOrdersRequest(searchTerm);
        return response;
    } catch (error) {
        throw error;
    }
};

export const updateOrderService = async (id, data) => {
    try {
        const response = await updateOrderRequest(id, data);
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteOrderService = async (id) => {
    try {
        const response = await deleteOrderRequest(id);
        return response;
    } catch (error) {
        throw error;
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
