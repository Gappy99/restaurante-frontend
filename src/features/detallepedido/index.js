// DetallePedido Pages
export { default as DetallePedidosPage } from "./pages/DetallePedidosPage.jsx";

// DetallePedido Hooks
export {
  useDetallePedidos,
  useDetallePedido,
  useDetallePedidosByOrder,
  useSaveDetallePedido,
  useDeleteDetallePedido,
  useDetallePedidosByProductType,
} from "./hooks/index.js";

// DetallePedido Services
export {
  createDetallePedidoService,
  getDetallePedidosService,
  getDetallePedidoByIdService,
  getDetallePedidosByOrderService,
  updateDetallePedidoService,
  deleteDetallePedidoService,
} from "./services/DetallePedidoService.js";

// DetallePedido Store
export { default as useDetallePedidoStore } from "./store/useDetallePedidoStore.js";
