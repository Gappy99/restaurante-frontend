import adminClient from '../../../shared/api/adminClient'

export const createOrder = async (data) => {
    const response = await adminClient.post('/order', data)
    return response.data;
};

export const getOrders = async () => {
    const response = await adminClient.get('/order')
    return response.data;
};

export const getOrderById = async (id) => {
    const response = await adminClient.get(`/order/${id}`)
    return response.data;
};

export const getOrderByIdWithDetails = async (id) => {
    const response = await adminClient.get(`/order/${id}/details`)
    return response.data;
};

export const searchOrders = async (searchTerm) => {
    const response = await adminClient.get(`/order/search?searchTerm=${encodeURIComponent(searchTerm)}`)
    return response.data;
};

export const updateOrder = async (id, data) => {
    const response = await adminClient.put(`/order/${id}`, data)
    return response.data;
};

export const deleteOrder = async (id) => {
    const response = await adminClient.delete(`/order/${id}`)
    return response.data;
};
