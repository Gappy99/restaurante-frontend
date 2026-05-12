# Feature Restaurant - Arquitectura Feature-Based

## 📁 Estructura del Feature

```
src/features/restaurant/
├── pages/                      # Componentes de página
│   └── RestaurantPage.jsx      # Página principal del feature
├── components/                 # Componentes reutilizables del feature
│   ├── RestaurantCard.jsx      # Tarjeta de restaurante
│   ├── RestaurantList.jsx      # Lista de restaurantes
│   ├── RestaurantModal.jsx     # Modal para crear/editar
│   └── index.js                # Barrel export
├── hooks/                      # Custom hooks
│   ├── useRestaurants.jsx      # Todos los hooks del feature
│   └── index.js                # Barrel export
├── store/                      # Gestión de estado (Zustand)
│   └── useRestaurantStore.js   # Store global
├── services/                   # Lógica de negocio / API
│   └── restaurantService.js    # Servicios de API
├── utils/                      # Utilidades
│   └── restaurantUtils.js      # Helpers y validaciones
├── constants/                  # Constantes
│   └── restaurantConstants.js  # Enums, mensajes, endpoints
├── types/                      # Tipos y JSDoc
│   └── restaurant.types.js     # Definiciones de tipos
├── api/                        # (Reservado para llamadas API específicas)
├── index.js                    # Barrel export principal
└── README.md                   # Este archivo
```

## 🎯 Principios de la Arquitectura

### 1. **Encapsulación**
- Cada feature es independiente y auto-contenido
- Exporta solo lo necesario a través del `index.js` principal
- Las carpetas internas son privadas del feature

### 2. **Separación de Responsabilidades**
- **pages/**: Vistas/páginas completas
- **components/**: Componentes reutilizables dentro del feature
- **hooks/**: Lógica de estado y efectos
- **store/**: Estado centralizado (Zustand)
- **services/**: Comunicación con API
- **utils/**: Helpers y funciones puras
- **constants/**: Valores inmutables y configuración
- **types/**: Definiciones de tipos y documentación

### 3. **Importaciones Limpias**
- Desde otros features, importar desde el `index.js` del feature:
  ```javascript
  import { useRestaurants, restaurantService } from '@/features/restaurant'
  ```
- Evitar importaciones profundas:
  ```javascript
  // ❌ No hacer esto
  import { useRestaurants } from '@/features/restaurant/hooks/useRestaurants'
  
  // ✅ Hacer esto
  import { useRestaurants } from '@/features/restaurant'
  ```

## 📚 Cómo Usar

### Crear/Actualizar Restaurantes

```javascript
import { useRestaurantForm, RESTAURANT_MESSAGES } from '@/features/restaurant'

function CreateRestaurantForm() {
  const { handleCreate, loading, error, clearError } = useRestaurantForm()

  const onSubmit = async (formData) => {
    const result = await handleCreate(formData)
    if (result.success) {
      toast.success(RESTAURANT_MESSAGES.CREATE_SUCCESS)
    } else {
      toast.error(result.error)
    }
  }

  return (
    // formulario
  )
}
```

### Listar Restaurantes

```javascript
import { useRestaurants, RESTAURANT_DEFAULTS } from '@/features/restaurant'

function RestaurantList() {
  const { restaurants, loading, error, fetchRestaurants } = useRestaurants()

  useEffect(() => {
    fetchRestaurants({ pageSize: RESTAURANT_DEFAULTS.PAGE_SIZE })
  }, [])

  return (
    // lista
  )
}
```

### Buscar Restaurantes

```javascript
import { useRestaurantSearch } from '@/features/restaurant'

function SearchBar() {
  const { handleSearch, loading } = useRestaurantSearch()

  const handleChange = async (e) => {
    await handleSearch(e.target.value)
  }

  return <input onChange={handleChange} placeholder="Buscar..." />
}
```

### Eliminar Restaurantes

```javascript
import { useRestaurantDelete } from '@/features/restaurant'

function DeleteButton({ restaurantId }) {
  const { handleDelete, loading } = useRestaurantDelete()

  return (
    <button onClick={() => handleDelete(restaurantId)} disabled={loading}>
      Eliminar
    </button>
  )
}
```

## 🔄 Flujo de Datos

```
UI Component
    ↓
Custom Hook (useRestaurant*)
    ↓
Store (useRestaurantStore)
    ↓
Service (restaurantService)
    ↓
API Client (adminClient)
    ↓
Backend API
```

## 📦 Barrel Exports

### Desde el feature
```javascript
// src/features/restaurant/index.js

export { useRestaurants, useRestaurantForm, ... } from './hooks'
export { restaurantService } from './services/restaurantService'
export { RESTAURANT_MESSAGES, ... } from './constants/restaurantConstants'
```

### Desde otros features
```javascript
import {
  useRestaurants,
  restaurantService,
  RESTAURANT_MESSAGES,
  formatRestaurantData,
} from '@/features/restaurant'
```

## 🛠️ Helpers y Utils

### Validación
```javascript
import { validateRestaurantForm } from '@/features/restaurant'

const { isValid, errors } = validateRestaurantForm(formData)
```

### Formateo
```javascript
import { formatRestaurantData, getRestaurantStatusLabel } from '@/features/restaurant'

const formatted = formatRestaurantData(formData)
const label = getRestaurantStatusLabel('ACTIVE') // "Activo"
```

### Búsqueda y Ordenamiento
```javascript
import { filterRestaurants, sortRestaurants } from '@/features/restaurant'

const filtered = filterRestaurants(restaurants, 'pizza')
const sorted = sortRestaurants(filtered, 'name', 'asc')
```

## ✅ Checklist para Expandir el Feature

- [ ] Crear componentes adicionales en `components/`
- [ ] Agregar más hooks en `hooks/useRestaurants.jsx`
- [ ] Ampliar validaciones en `utils/restaurantUtils.js`
- [ ] Agregar constantes nuevas en `constants/restaurantConstants.js`
- [ ] Crear nuevas páginas en `pages/`
- [ ] Actualizar exports en `index.js` si hay nuevas exportaciones públicas

## 🎨 Ventajas de esta Arquitectura

✅ **Escalable**: Fácil agregar nuevas features sin afectar las existentes
✅ **Mantenible**: Todo relacionado a `restaurant` está junto
✅ **Testeable**: Funciones puras y servicios desacoplados
✅ **Reutilizable**: Los hooks y servicios se usan en múltiples componentes
✅ **Limpio**: Imports claros y predecibles
✅ **Documentado**: Tipos JSDoc y README por feature

---

**Nota**: Aplica este patrón a los otros features (`auth`, `dashboard`, `fields`, `users`) para mantener consistencia en toda la aplicación.
