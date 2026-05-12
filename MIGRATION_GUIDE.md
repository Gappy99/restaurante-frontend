# Guía de Migración a Feature-Based Architecture

## Descripción

Este documento guía la migración de los otros features (auth, dashboard, fields, users) a la arquitectura Feature-Based seguida en `restaurant`.

## Estructura Estándar por Feature

Cada feature debe tener esta estructura:

```
src/features/{featureName}/
├── pages/
│   ├── {Feature}Page.jsx
│   └── index.js
├── components/
│   ├── {Component1}.jsx
│   ├── {Component2}.jsx
│   └── index.js
├── hooks/
│   ├── use{Features}.js (archivo único con todos los hooks)
│   └── index.js
├── store/
│   └── use{Feature}Store.js
├── services/
│   └── {feature}Service.js
├── utils/
│   └── {feature}Utils.js
├── constants/
│   └── {feature}Constants.js
├── types/
│   └── {feature}.types.js
├── index.js (barrel export)
└── README.md
```

## Features Actuales y Estado

### ✅ Restaurant
- Estado: **Implementado** completamente con la nueva arquitectura

### 🔄 Auth (Prioridad: Alta)
- Archivos actuales:
  - `src/features/auth/pages/LoginPage.jsx`
  - `src/features/auth/pages/RegisterPage.jsx`
  - `src/shared/stores/useAuthStore.js` (debe moverse a `features/auth/store/`)
  - `src/shared/api/services/authService.js` (debe moverse a `features/auth/services/`)

**Acciones**:
1. Mover `useAuthStore.js` a `src/features/auth/store/`
2. Mover `authService.js` a `src/features/auth/services/`
3. Crear hooks en `src/features/auth/hooks/useAuth.js`:
   - `useLogin()`
   - `useRegister()`
   - `useLogout()`
   - `useAuthUser()`
4. Crear `src/features/auth/utils/authUtils.js`
5. Crear `src/features/auth/constants/authConstants.js`
6. Crear `src/features/auth/types/auth.types.js`
7. Crear barrel exports

### 🔄 Users (Prioridad: Alta)
- Archivos actuales:
  - `src/features/users/pages/UsersPage.jsx`
  - `src/shared/stores/useUserStore.js` (debe moverse)
  - `src/shared/api/services/userService.js` (debe moverse)

**Acciones**:
1. Seguir patrón similar a Restaurant

### 🔄 Dashboard (Prioridad: Media)
- Archivos actuales:
  - `src/features/dashboard/pages/DashboardPage.jsx`

**Acciones**:
1. Crear estructura básica
2. Si necesita estado compartido, crear store
3. Si necesita datos, crear service

### 🔄 Fields (Prioridad: Baja/Futura)
- Archivos actuales:
  - `src/features/fields/pages/FieldsPage.jsx`

## Paso a Paso para Migrar un Feature

### Ejemplo: Migrar `auth`

#### 1. Crear estructura de carpetas
```bash
mkdir -p src/features/auth/{pages,components,hooks,store,services,utils,constants,types}
```

#### 2. Mover archivos existentes
```bash
# Mover páginas
mv src/features/auth/pages/* src/features/auth/pages/

# Mover store
cp src/shared/stores/useAuthStore.js src/features/auth/store/useAuthStore.js

# Mover services
cp src/shared/api/services/authService.js src/features/auth/services/authService.js
```

#### 3. Crear nuevos archivos siguiendo el patrón de `restaurant`
- `src/features/auth/hooks/useAuth.js`
- `src/features/auth/utils/authUtils.js`
- `src/features/auth/constants/authConstants.js`
- `src/features/auth/types/auth.types.js`
- `src/features/auth/components/index.js`
- `src/features/auth/pages/index.js`
- `src/features/auth/index.js` (barrel export)

#### 4. Actualizar imports en archivos trasladados
- Cambiar imports relativos del store y services
- Usar imports relativos correctos o desde barrel exports

#### 5. Crear README.md para el feature

#### 6. Actualizar imports globales
- En `src/shared/` actualizar referencias
- En otros features actualizar referencias

## Orden Recomendado de Migración

1. **Auth** (High Priority - Many dependencies)
2. **Users** (High Priority - Admin functionality)
3. **Dashboard** (Medium Priority)
4. **Fields** (Low Priority)

## Beneficios

✅ Código más organizado y escalable
✅ Fácil mantener features aislados
✅ Reducir imports complejos
✅ Facilitar testing
✅ Documentación clara

## Validación

Después de migrar cada feature, verificar:

```javascript
// ✅ Importaciones limpias desde barrel exports
import { useAuthStore, loginService } from '@/features/auth'

// ✅ Tipos y constantes accesibles
import { AUTH_MESSAGES, AUTH_STATUS } from '@/features/auth'

// ✅ Sin importaciones profundas
// ❌ import useAuthStore from '@/features/auth/store/useAuthStore'
```

---

**Próximo paso**: Migrar el feature `auth` siguiendo este patrón.
