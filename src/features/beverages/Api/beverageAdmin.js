import { axiosAdmin } from "../../menus/Api/api.js"

export const createBeverage = async (data) => {
    const response = await axiosAdmin.post("/beverage", data);
    return response.data;
}

export const getBeveragesByRestaurant = async (restaurantId) => {
    const response = await axiosAdmin.get(`/beverage/restaurant/${restaurantId}`);
    return response.data;
}

export const getBeverageById = async (id) => {
    const response = await axiosAdmin.get(`/beverage/${id}`);
    return response.data;
}

export const updateBeverage = async (id, data) => {
    const response = await axiosAdmin.put(`/beverage/${id}`, data);
    return response.data;
}

export const deleteBeverage = async (id) => {
    const response = await axiosAdmin.delete(`/beverage/${id}`);
    return response.data;
}

export const searchBeveragesByName = async (restaurantId, name) => {
    const response = await axiosAdmin.get(`/beverage/restaurant/${restaurantId}/search?name=${name}`);
    return response.data;
}
