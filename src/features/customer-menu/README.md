Customer Menu feature
=====================

Estructura propuesta para el menú orientado a cliente.

Arquitectura:
- `pages/CustomerMenuPage.jsx`: Página principal del cliente (lectura).
- `components/CustomerMenuList.jsx`: Lista de platillos para UI cliente.
- `components/CustomerMenuCard.jsx`: Tarjeta de platillo cliente.
- `hooks/useCustomerMenu.js`: Hook que encapsula la llamada GET al backend.
- `services/customerMenuService.js`: Servicio con funciones GET para menús.
- `store/useCustomerMenuStore.js`: (Opcional) store ligero para caché compartida.

Rutas sugeridas:
- Pública: `/restaurants/:id/menu` (sin auth).
- Protegida: `/loby/restaurants/:id/menu` (si quieres restringir a clientes autenticados).

Notas:
- No se deben mezclar endpoints de gestión (POST/PUT/DELETE) con esta feature; esas operaciones quedan en `features/menus`.
- Componentes y hooks deben reutilizar utilidades comunes en `shared/` cuando aplique.
