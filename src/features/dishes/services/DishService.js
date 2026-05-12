import {
    createDish as createDishRequest,
    getDishesByRestaurant as getDishesByRestaurantRequest,
    getDishById as getDishByIdRequest,
    updateDish as updateDishRequest,
    deleteDish as deleteDishRequest,
    searchDishesByName as searchDishesByNameRequest
} from "../Api/dishAdmin.js";

export const createDishService = async (data) => {
    try {
        const response = await createDishRequest(data);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al crear platillo";
    }
};

export const getDishesByRestaurantService = async (restaurantId) => {
    try {
        const response = await getDishesByRestaurantRequest(restaurantId);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al obtener platillos";
    }
};

export const getDishByIdService = async (id) => {
    try {
        const response = await getDishByIdRequest(id);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al obtener platillo";
    }
};

export const updateDishService = async (id, data) => {
    try {
        const response = await updateDishRequest(id, data);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al actualizar platillo";
    }
};

export const deleteDishService = async (id) => {
    try {
        const response = await deleteDishRequest(id);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al eliminar platillo";
    }
};

export const searchDishesByNameService = async (restaurantId, name) => {
    try {
        const response = await searchDishesByNameRequest(restaurantId, name);
        return response;
    } catch (error) {
        throw error.response?.data?.message || "Error al buscar platillos";
    }
};

export default {
    createDishService,
    getDishesByRestaurantService,
    getDishByIdService,
    updateDishService,
    deleteDishService,
    searchDishesByNameService
}
