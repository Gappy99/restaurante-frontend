import {
    createInventory as createInventoryRequest,
    getInventory as getInventoryRequest,
    getInventoryByRestaurant as getInventoryByRestaurantRequest,
    getInventoryById as getInventoryByIdRequest,
    updateInventory as updateInventoryRequest,
    deleteInventory as deleteInventoryRequest,
    decreaseInventory as decreaseInventoryRequest,
    increaseInventory as increaseInventoryRequest,
    searchInventoryByName as searchInventoryByNameRequest,
} from "../Api/inventoryAdmin.js";

export const createInventoryService = async (data) => {
    try {
        const response = await createInventoryRequest(data);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al crear inventario";
    }
};

export const getInventoryService = async (restaurantId = null) => {
    try {
        const response = await getInventoryRequest(restaurantId);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al obtener inventario";
    }
};

export const getInventoryByRestaurantService = async (restaurantId) => {
    try {
        const response = await getInventoryByRestaurantRequest(restaurantId);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al obtener inventario por restaurante";
    }
};

export const getInventoryByIdService = async (id) => {
    try {
        const response = await getInventoryByIdRequest(id);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al obtener articulo de inventario";
    }
};

export const updateInventoryService = async (id, data) => {
    try {
        const response = await updateInventoryRequest(id, data);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al actualizar inventario";
    }
};

export const deleteInventoryService = async (id) => {
    try {
        const response = await deleteInventoryRequest(id);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al eliminar inventario";
    }
};

export const decreaseInventoryService = async (id, quantity, restaurantId = null) => {
    try {
        const response = await decreaseInventoryRequest(id, quantity, restaurantId);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al descontar inventario";
    }
};

export const increaseInventoryService = async (id, quantity) => {
    try {
        const response = await increaseInventoryRequest(id, quantity);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al incrementar inventario";
    }
};

export const searchInventoryByNameService = async (restaurantId, name) => {
    try {
        const response = await searchInventoryByNameRequest(restaurantId, name);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al buscar inventario por nombre";
    }
};

export default {
    createInventoryService,
    getInventoryService,
    getInventoryByRestaurantService,
    getInventoryByIdService,
    updateInventoryService,
    deleteInventoryService,
    decreaseInventoryService,
    increaseInventoryService,
    searchInventoryByNameService,
};
