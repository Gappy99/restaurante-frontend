import { useCallback } from "react";
import useOrderStore from "../store/useOrderStore.js";

export const useOrders = () => {
    const { orders, loading, error, fetchOrders } = useOrderStore();

    const handleFetchOrders = useCallback(async () => {
        return await fetchOrders();
    }, [fetchOrders]);

    return {
        orders,
        loading,
        error,
        fetchOrders: handleFetchOrders,
    };
};

export const useOrder = (id) => {
    const { orders, loading } = useOrderStore();
    const order = orders.find((o) => (o._id || o.id) === id) || null;

    return {
        order,
        loading,
    };
};

export const useSaveOrder = (orderId = null) => {
    const { saveOrder, orders, loading, error } = useOrderStore();

    const currentOrder = orderId
        ? orders.find((o) => (o._id || o.id) === orderId)
        : null;

    const handleSave = useCallback(
        async (formData) => {
            if (!formData?.Orders_domicile) {
                return {
                    success: false,
                    error: "La direccion de domicilio es obligatoria",
                };
            }

            if (!formData?.Orders_number) {
                return {
                    success: false,
                    error: "El numero de la orden es obligatorio",
                };
            }

            if (!formData?.Orders_facture) {
                return {
                    success: false,
                    error: "La factura es obligatoria",
                };
            }

            if (!formData?.Orders_facture_descripcion) {
                return {
                    success: false,
                    error: "La descripcion de factura es obligatoria",
                };
            }

            if (!formData?.Restaurant_id || !formData?.Menu_id || !formData?.User_id) {
                return {
                    success: false,
                    error: "Restaurante, menu y usuario son obligatorios",
                };
            }

            return await saveOrder(formData, orderId);
        },
        [saveOrder, orderId]
    );

    return {
        handleSave,
        currentOrder,
        loading,
        error,
        isEditing: !!orderId,
    };
};

export const useDeleteOrder = () => {
    const { removeOrder, loading, error } = useOrderStore();

    const handleDelete = useCallback(
        async (id) => {
            return await removeOrder(id);
        },
        [removeOrder]
    );

    return {
        handleDelete,
        loading,
        error,
    };
};

export const useSearchOrders = () => {
    const store = useOrderStore();

    const handleSearch = useCallback(
        async (term) => {
            if (!term) {
                return await store.fetchOrders();
            }
            return await store.searchOrders(term);
        },
        [store]
    );

    return {
        search: handleSearch,
        loading: store.loading,
        orders: store.orders,
    };
};

export const useOrdersByStatus = (status) => {
    const { orders } = useOrderStore();
    const filtered = orders.filter((o) => o.Orders_status === status);

    return {
        orders: filtered,
        count: filtered.length,
    };
};

export default useOrderStore;
