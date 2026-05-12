import { axiosAdmin } from "../../menus/Api/api.js"

export const createDish = async (data) => {
    const response = await axiosAdmin.post("/dish", data);
    return response.data;
}

export const getDishesByRestaurant = async (restaurantId) => {
    const response = await axiosAdmin.get(`/dish/restaurant/${restaurantId}`);
    return response.data;
}

export const getDishById = async (id) => {
    const response = await axiosAdmin.get(`/dish/${id}`);
    return response.data;
}

export const updateDish = async (id, data) => {
    const response = await axiosAdmin.put(`/dish/${id}`, data);
    return response.data;
}

export const deleteDish = async (id) => {
    const response = await axiosAdmin.delete(`/dish/${id}`);
    return response.data;
}

export const searchDishesByName = async (restaurantId, name) => {
    const response = await axiosAdmin.get(`/dish/restaurant/${restaurantId}/search?name=${name}`);
    return response.data;
}
