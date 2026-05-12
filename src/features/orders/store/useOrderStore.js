import { create } from "zustand";
import toast from "react-hot-toast";
import {
    createOrderService,
    getOrdersService,
    getOrderByIdService,
    getOrderByIdWithDetailsService,
    searchOrdersService,
    updateOrderService,
    deleteOrderService,
} from "../services/OrderService.js";

const normalizeOrderList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.orders)) return payload.orders;
    return [];
};

const orderId = (order) => order?._id || order?.id;

export const useOrderStore = create((set, get) => ({
    // State
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
    filters: {
        search: "",
        status: null,
        restaurant: null,
        user: null,
    },

    // Setters
    setOrders: (orders) => set({ orders }),
    setCurrentOrder: (order) => set({ currentOrder: order }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setFilters: (filters) =>
        set((state) => ({
            filters: { ...state.filters, ...filters },
        })),

    clearError: () => set({ error: null }),
    clearCurrentOrder: () => set({ currentOrder: null }),

    resolveOrderId: (order) => orderId(order),

    // Async actions
    fetchOrders: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getOrdersService();
            const orders = normalizeOrderList(response);
            set({ orders, loading: false });
            return { success: true, data: orders };
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar ordenes";
            set({ error: message, loading: false, orders: [] });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    fetchOrderById: async (id) => {
        try {
            set({ loading: true, error: null });
            const response = await getOrderByIdService(id);
            const order = response?.data || response;
            set({ currentOrder: order, loading: false });
            return { success: true, data: order };
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar la orden";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    fetchOrderWithDetails: async (id) => {
        try {
            set({ loading: true, error: null });
            const response = await getOrderByIdWithDetailsService(id);
            const order = response?.data || response;
            set({ currentOrder: order, loading: false });
            return { success: true, data: order };
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar el detalle de la orden";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    saveOrder: async (formData, id = null) => {
        try {
            set({ loading: true, error: null });

            if (id) {
                await updateOrderService(id, formData);
                toast.success("Orden actualizada exitosamente");
            } else {
                await createOrderService(formData);
                toast.success("Orden creada exitosamente");
            }

            await get().fetchOrders();
            set({ loading: false });
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Error al guardar la orden";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    removeOrder: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteOrderService(id);
            toast.success("Orden eliminada exitosamente");
            await get().fetchOrders();
            set({ loading: false });
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Error al eliminar la orden";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    searchOrders: async (searchTerm) => {
        try {
            set({ loading: true, error: null });
            if (!searchTerm) {
                return await get().fetchOrders();
            }
            const response = await searchOrdersService(searchTerm);
            const orders = normalizeOrderList(response);
            set({
                orders,
                filters: { ...get().filters, search: searchTerm },
                loading: false,
            });
            return { success: true, data: orders };
        } catch (err) {
            const message = err.response?.data?.message || "Error al buscar ordenes";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    // Local mutations
    addOrder: (order) => {
        set((state) => ({ orders: [...state.orders, order] }));
    },

    updateOrderLocal: (id, updatedOrder) => {
        set((state) => ({
            orders: state.orders.map((order) =>
                orderId(order) === id ? { ...order, ...updatedOrder } : order
            ),
        }));
    },

    deleteOrderLocal: (id) => {
        set((state) => ({
            orders: state.orders.filter((order) => orderId(order) !== id),
        }));
    },

    // Getters
    getFilteredOrders: () => {
        const state = get();
        let filtered = state.orders;

        if (state.filters.search) {
            const term = state.filters.search.toLowerCase();
            filtered = filtered.filter((o) =>
                String(o.Orders_number || "").toLowerCase().includes(term) ||
                String(o.Orders_domicile || "").toLowerCase().includes(term) ||
                String(o.Orders_facture || "").toLowerCase().includes(term) ||
                String(o.Orders_cupon || "").toLowerCase().includes(term)
            );
        }

        if (state.filters.status) {
            filtered = filtered.filter((o) => o.Orders_status === state.filters.status);
        }

        if (state.filters.restaurant) {
            filtered = filtered.filter((o) => {
                const rid = o.Restaurant_id?._id || o.Restaurant_id;
                return rid === state.filters.restaurant;
            });
        }

        if (state.filters.user) {
            filtered = filtered.filter((o) => {
                const uid = o.User_id?._id || o.User_id;
                return uid === state.filters.user;
            });
        }

        return filtered;
    },

    getTotalCount: () => get().orders.length,

    getOrderByIdLocal: (id) => get().orders.find((o) => orderId(o) === id) || null,
}));

export default useOrderStore;
