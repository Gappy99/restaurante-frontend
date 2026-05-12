import { useCallback } from "react";
import useDetallePedidoStore from "../store/useDetallePedidoStore.js";

export const useDetallePedidos = () => {
    const { detallePedidos, loading, error, fetchDetallePedidos } = useDetallePedidoStore();

    const handleFetchDetallePedidos = useCallback(async () => {
        return await fetchDetallePedidos();
    }, [fetchDetallePedidos]);

    return {
        detallePedidos,
        loading,
        error,
        fetchDetallePedidos: handleFetchDetallePedidos,
    };
};

export const useDetallePedido = (id) => {
    const { detallePedidos, loading } = useDetallePedidoStore();
    const detallePedido = detallePedidos.find((d) => (d._id || d.id) === id) || null;

    return {
        detallePedido,
        loading,
    };
};

export const useDetallePedidosByOrder = (orderId = null) => {
    const { detallePedidos, loading, error, fetchDetallePedidosByOrder, setFilters } = useDetallePedidoStore();

    const handleFetchByOrder = useCallback(async () => {
        if (!orderId) return;
        setFilters({ orderId });
        return await fetchDetallePedidosByOrder(orderId);
    }, [fetchDetallePedidosByOrder, orderId, setFilters]);

    return {
        detallePedidos,
        loading,
        error,
        fetchDetallePedidosByOrder: handleFetchByOrder,
    };
};

export const useSaveDetallePedido = (detallePedidoId = null) => {
    const { saveDetallePedido, detallePedidos, loading, error } = useDetallePedidoStore();

    const currentDetallePedido = detallePedidoId
        ? detallePedidos.find((d) => (d._id || d.id) === detallePedidoId)
        : null;

    const handleSave = useCallback(
        async (formData) => {
            if (!formData?.orders_id || !formData?.producto || !formData?.restaurant_id) {
                return {
                    success: false,
                    error: "La orden, producto y restaurante son obligatorios",
                };
            }

            if (!["dish", "beverage"].includes(formData?.productType)) {
                return {
                    success: false,
                    error: "El tipo de producto debe ser dish o beverage",
                };
            }

            if (!formData?.candidadproducto || formData.candidadproducto < 1) {
                return {
                    success: false,
                    error: "La cantidad del producto debe ser mayor a 0",
                };
            }

            if (formData?.preciounitario === undefined || formData?.preciounitario < 0) {
                return {
                    success: false,
                    error: "El precio unitario es obligatorio y no puede ser negativo",
                };
            }

            return await saveDetallePedido(formData, detallePedidoId);
        },
        [saveDetallePedido, detallePedidoId]
    );

    return {
        handleSave,
        currentDetallePedido,
        loading,
        error,
        isEditing: !!detallePedidoId,
    };
};

export const useDeleteDetallePedido = () => {
    const { removeDetallePedido, loading, error } = useDetallePedidoStore();

    const handleDelete = useCallback(
        async (id) => {
            return await removeDetallePedido(id);
        },
        [removeDetallePedido]
    );

    return {
        handleDelete,
        loading,
        error,
    };
};

export const useDetallePedidosByProductType = (productType) => {
    const { detallePedidos } = useDetallePedidoStore();
    const filtered = detallePedidos.filter((d) => d.productType === productType);

    return {
        detallePedidos: filtered,
        count: filtered.length,
    };
};

export default useDetallePedidoStore;
