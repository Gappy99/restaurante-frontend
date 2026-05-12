import {
    createBeverage as createBeverageRequest,
    getBeveragesByRestaurant as getBeveragesByRestaurantRequest,
    getBeverageById as getBeverageByIdRequest,
    updateBeverage as updateBeverageRequest,
    deleteBeverage as deleteBeverageRequest,
    searchBeveragesByName as searchBeveragesByNameRequest
} from "../Api/beverageAdmin.js";

export const createBeverageService = async (data) => {
    try {
        const response = await createBeverageRequest(data);
        return response;
    } catch (error) {
        // Rethrow full backend response to surface validation details
        throw error.response?.data || error.response || error;
    }
};

export const getBeveragesByRestaurantService = async (restaurantId) => {
    try {
        const response = await getBeveragesByRestaurantRequest(restaurantId);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al obtener bebidas";
    }
};

export const getBeverageByIdService = async (id) => {
    try {
        const response = await getBeverageByIdRequest(id);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al obtener bebida";
    }
};

export const updateBeverageService = async (id, data) => {
    try {
        const response = await updateBeverageRequest(id, data);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al actualizar bebida";
    }
};

export const deleteBeverageService = async (id) => {
    try {
        const response = await deleteBeverageRequest(id);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al eliminar bebida";
    }
};

export const searchBeveragesByNameService = async (restaurantId, name) => {
    try {
        const response = await searchBeveragesByNameRequest(restaurantId, name);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al buscar bebidas";
    }
};

export default {
    createBeverageService,
    getBeveragesByRestaurantService,
    getBeverageByIdService,
    updateBeverageService,
    deleteBeverageService,
    searchBeveragesByNameService
}
