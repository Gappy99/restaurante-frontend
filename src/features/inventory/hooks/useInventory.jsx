import { useCallback } from "react";
import useInventoryStore from "../store/useInventoryStore.js";

export const useInventory = (restaurantId = null) => {
    const { items, loading, error, fetchInventory, fetchInventoryByRestaurant, setFilters } = useInventoryStore();

    const handleFetch = useCallback(async () => {
        if (restaurantId) {
            setFilters({ restaurant: restaurantId });
            return await fetchInventoryByRestaurant(restaurantId);
        }
        return await fetchInventory();
    }, [restaurantId, fetchInventory, fetchInventoryByRestaurant, setFilters]);

    return {
        items,
        loading,
        error,
        fetchInventory: handleFetch,
    };
};

export const useInventoryItem = (id) => {
    const { items, loading } = useInventoryStore();
    const item = items.find((it) => (it._id || it.id) === id) || null;

    return {
        item,
        loading,
    };
};

export const useSaveInventoryItem = (itemId = null) => {
    const { saveInventoryItem, items, loading, error } = useInventoryStore();

    const currentItem = itemId
        ? items.find((it) => (it._id || it.id) === itemId)
        : null;

    const handleSave = useCallback(
        async (formData) => {
            if (!formData?.item_name || !formData?.category || !formData?.unit || !formData?.provider) {
                return {
                    success: false,
                    error: "Nombre, categoria, unidad y proveedor son obligatorios",
                };
            }

            if (formData?.quantity === undefined || Number(formData.quantity) < 0) {
                return {
                    success: false,
                    error: "La cantidad es obligatoria y debe ser mayor o igual a 0",
                };
            }

            if (formData?.price === undefined || Number(formData.price) < 0) {
                return {
                    success: false,
                    error: "El precio es obligatorio y debe ser mayor o igual a 0",
                };
            }

            if (!formData?.restaurant_id) {
                return {
                    success: false,
                    error: "El restaurante es obligatorio",
                };
            }

            return await saveInventoryItem(formData, itemId);
        },
        [saveInventoryItem, itemId]
    );

    return {
        handleSave,
        currentItem,
        loading,
        error,
        isEditing: !!itemId,
    };
};

export const useDeleteInventoryItem = () => {
    const { removeInventoryItem, loading, error } = useInventoryStore();

    const handleDelete = useCallback(
        async (id) => {
            return await removeInventoryItem(id);
        },
        [removeInventoryItem]
    );

    return {
        handleDelete,
        loading,
        error,
    };
};

export const useSearchInventory = (restaurantId = null) => {
    const store = useInventoryStore();

    const handleSearch = useCallback(
        async (name) => {
            if (!restaurantId) {
                return { success: false, error: "Se requiere restaurantId para buscar" };
            }
            if (!name) {
                return await store.fetchInventoryByRestaurant(restaurantId);
            }
            return await store.searchInventoryByName(restaurantId, name);
        },
        [store, restaurantId]
    );

    return {
        search: handleSearch,
        loading: store.loading,
        items: store.items,
    };
};

export const useInventoryStockActions = () => {
    const { decreaseStock, increaseStock, loading, error } = useInventoryStore();

    const handleDecrease = useCallback(
        async (id, quantity, restaurantId = null) => {
            return await decreaseStock(id, quantity, restaurantId);
        },
        [decreaseStock]
    );

    const handleIncrease = useCallback(
        async (id, quantity) => {
            return await increaseStock(id, quantity);
        },
        [increaseStock]
    );

    return {
        decreaseStock: handleDecrease,
        increaseStock: handleIncrease,
        loading,
        error,
    };
};

export default useInventoryStore;
