import { create } from "zustand";
import toast from "react-hot-toast";
import {
    createDetallePedidoService,
    getDetallePedidosService,
    getDetallePedidoByIdService,
    getDetallePedidosByOrderService,
    updateDetallePedidoService,
    deleteDetallePedidoService,
} from "../services/DetallePedidoService.js";

const normalizeDetallePedidoList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.detallePedidos)) return payload.detallePedidos;
    return [];
};

const normalizeOneDetallePedido = (payload) => {
    if (payload?.detallePedido) return payload.detallePedido;
    if (payload?.data) return payload.data;
    return payload;
};

const detallePedidoId = (detalle) => detalle?._id || detalle?.id;

export const useDetallePedidoStore = create((set, get) => ({
    detallePedidos: [],
    currentDetallePedido: null,
    loading: false,
    error: null,
    filters: {
        orderId: null,
        productType: null,
    },

    setDetallePedidos: (detallePedidos) => set({ detallePedidos }),
    setCurrentDetallePedido: (detallePedido) => set({ currentDetallePedido: detallePedido }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setFilters: (filters) =>
        set((state) => ({
            filters: { ...state.filters, ...filters },
        })),

    clearError: () => set({ error: null }),
    clearCurrentDetallePedido: () => set({ currentDetallePedido: null }),

    resolveDetallePedidoId: (detallePedido) => detallePedidoId(detallePedido),

    fetchDetallePedidos: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getDetallePedidosService();
            const detallePedidos = normalizeDetallePedidoList(response);
            set({ detallePedidos, loading: false });
            return { success: true, data: detallePedidos };
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar detalles de pedido";
            set({ error: message, loading: false, detallePedidos: [] });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    fetchDetallePedidoById: async (id) => {
        try {
            set({ loading: true, error: null });
            const response = await getDetallePedidoByIdService(id);
            const detallePedido = normalizeOneDetallePedido(response);
            set({ currentDetallePedido: detallePedido, loading: false });
            return { success: true, data: detallePedido };
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar el detalle de pedido";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    fetchDetallePedidosByOrder: async (orderId) => {
        try {
            set({ loading: true, error: null });
            const response = await getDetallePedidosByOrderService(orderId);
            const detallePedidos = normalizeDetallePedidoList(response);
            set({
                detallePedidos,
                filters: { ...get().filters, orderId },
                loading: false,
            });
            return { success: true, data: detallePedidos };
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar detalles por orden";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    saveDetallePedido: async (formData, id = null) => {
        try {
            set({ loading: true, error: null });

            if (id) {
                await updateDetallePedidoService(id, formData);
                toast.success("Detalle de pedido actualizado exitosamente");
            } else {
                await createDetallePedidoService(formData);
                toast.success("Detalle de pedido creado exitosamente");
            }

            if (get().filters.orderId) {
                await get().fetchDetallePedidosByOrder(get().filters.orderId);
            } else {
                await get().fetchDetallePedidos();
            }

            set({ loading: false });
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Error al guardar detalle de pedido";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    removeDetallePedido: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteDetallePedidoService(id);
            toast.success("Detalle de pedido eliminado exitosamente");

            if (get().filters.orderId) {
                await get().fetchDetallePedidosByOrder(get().filters.orderId);
            } else {
                await get().fetchDetallePedidos();
            }

            set({ loading: false });
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Error al eliminar detalle de pedido";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    addDetallePedido: (detallePedido) => {
        set((state) => ({ detallePedidos: [...state.detallePedidos, detallePedido] }));
    },

    updateDetallePedidoLocal: (id, updatedDetallePedido) => {
        set((state) => ({
            detallePedidos: state.detallePedidos.map((detalle) =>
                detallePedidoId(detalle) === id ? { ...detalle, ...updatedDetallePedido } : detalle
            ),
        }));
    },

    deleteDetallePedidoLocal: (id) => {
        set((state) => ({
            detallePedidos: state.detallePedidos.filter((detalle) => detallePedidoId(detalle) !== id),
        }));
    },

    getFilteredDetallePedidos: () => {
        const state = get();
        let filtered = state.detallePedidos;

        if (state.filters.productType) {
            filtered = filtered.filter((d) => d.productType === state.filters.productType);
        }

        if (state.filters.orderId) {
            filtered = filtered.filter((d) => {
                const oid = d.orders_id?._id || d.orders_id;
                return oid === state.filters.orderId;
            });
        }

        return filtered;
    },

    getDetallePedidoByIdLocal: (id) =>
        get().detallePedidos.find((d) => detallePedidoId(d) === id) || null,

    getTotalCount: () => get().detallePedidos.length,
}));

export default useDetallePedidoStore;
