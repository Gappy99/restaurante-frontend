import {
    createDetallePedido as createDetallePedidoRequest,
    getDetallePedidos as getDetallePedidosRequest,
    getDetallePedidoById as getDetallePedidoByIdRequest,
    getDetallePedidosByOrder as getDetallePedidosByOrderRequest,
    updateDetallePedido as updateDetallePedidoRequest,
    deleteDetallePedido as deleteDetallePedidoRequest,
} from "../Api/detallePedidoAdmin.js";

export const createDetallePedidoService = async (data) => {
    try {
        const response = await createDetallePedidoRequest(data)
        return response
    } catch (error) {
        throw error
    }
}

export const getDetallePedidosService = async () => {
    try {
        const response = await getDetallePedidosRequest()
        return response
    } catch (error) {
        throw error
    }
}

export const getDetallePedidoByIdService = async (id) => {
    try {
        const response = await getDetallePedidoByIdRequest(id)
        return response
    } catch (error) {
        throw error
    }
}

export const getDetallePedidosByOrderService = async (orderId) => {
    try {
        const response = await getDetallePedidosByOrderRequest(orderId)
        return response
    } catch (error) {
        throw error
    }
}

export const updateDetallePedidoService = async (id, data) => {
    try {
        const response = await updateDetallePedidoRequest(id, data)
        return response
    } catch (error) {
        throw error
    }
}

export const deleteDetallePedidoService = async (id) => {
    try {
        const response = await deleteDetallePedidoRequest(id)
        return response
    } catch (error) {
        throw error
    }
}

export default {
    createDetallePedidoService,
    getDetallePedidosService,
    getDetallePedidoByIdService,
    getDetallePedidosByOrderService,
    updateDetallePedidoService,
    deleteDetallePedidoService,
};
