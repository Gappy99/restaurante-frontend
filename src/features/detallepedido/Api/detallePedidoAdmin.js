import adminClient from '../../../shared/api/adminClient'

export const createDetallePedido = async (data) => {
    const response = await adminClient.post('/detallepedido', data)
    return response.data
}

export const getDetallePedidos = async () => {
    const response = await adminClient.get('/detallepedido')
    return response.data
}

export const getDetallePedidoById = async (id) => {
    const response = await adminClient.get(`/detallepedido/${id}`)
    return response.data
}

export const getDetallePedidosByOrder = async (orderId) => {
    const response = await adminClient.get(`/detallepedido/order/${orderId}`)
    return response.data
}

export const updateDetallePedido = async (id, data) => {
    const response = await adminClient.put(`/detallepedido/${id}`, data)
    return response.data
}

export const deleteDetallePedido = async (id) => {
    const response = await adminClient.delete(`/detallepedido/${id}`)
    return response.data
}
