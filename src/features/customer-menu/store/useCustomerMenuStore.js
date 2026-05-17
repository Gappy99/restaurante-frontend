// Espacio para un store ligero (opcional) si se desea caché compartida entre componentes.
// Responsabilidades:
// - Mantener estado de menús cliente en memoria (caché de solo lectura).
// - Exportar funciones para recargar/invalidar la caché si fuera necesario.

export function useCustomerMenuStore() {
  // Este archivo es un placeholder. La implementación puede usar zustand, redux o context.
  return {
    menus: [],
    loading: false,
    fetchMenus: async () => {},
  }
}
