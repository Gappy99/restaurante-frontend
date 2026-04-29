# ✅ Frontend Restaurant - Alineado con Backend

## 📊 Resumen de Cambios

He alineado completamente el frontend del feature `restaurant` con la estructura y endpoints del backend.

## 🔄 Cambios Principales

### 1. **Actualización de Constantes**
- ✅ Cambié nombres de campos para que coincidan con el backend
- ✅ Agregué `RESTAURANT_TYPES` y `GASTRONOMIC_TYPES` (en lugar de `CUISINE_TYPES`)
- ✅ Agregué horarios por defecto (`DEFAULT_TIME_START`, `DEFAULT_TIME_CLOSE`)

**Archivo**: `constants/restaurantConstants.js`

### 2. **Mapeo de Datos Frontend ↔ Backend**
```
Frontend           →  Backend
name               →  restaurant_name
type               →  restaurant_type
gastronomicType    →  restaurant_type_gastronomic
address            →  restaurant_direction
timeStart          →  restaurant_time_start
timeClose          →  restaurant_time_close
meanPrice          →  restaurant_mean_price
image              →  restaurant_images
```

**Archivo**: `utils/restaurantUtils.js`

### 3. **Funciones Actualizadas**
- ✅ `formatRestaurantData()` - Ahora retorna `FormData` con campos correctos del backend
- ✅ `validateRestaurantForm()` - Valida según campos del backend
- ✅ `getRestaurantStatusLabel()` - Usa booleano (true/false) del backend

### 4. **Componentes Completados**

#### RestaurantModal.jsx
- ✅ Formulario completo con todos los campos
- ✅ Upload de imagen
- ✅ Validaciones en tiempo real
- ✅ Soporte para crear y editar
- ✅ Manejo de errores

#### Restaurants.jsx
- ✅ Lista de restaurantes
- ✅ Estados de carga y vacío
- ✅ Usa RestaurantCard para cada item

#### RestaurantCard.jsx
- ✅ Muestra información del restaurante
- ✅ Botones de editar y eliminar
- ✅ Usa campos correctos del backend
- ✅ Imagen responsive

#### RestaurantPage.jsx
- ✅ Página principal funcional
- ✅ Carga restaurantes al montar
- ✅ Crear, editar y eliminar
- ✅ Manejo de errores con toast

### 5. **Tipos Actualizados**
- ✅ Alineados con estructura MongoDB
- ✅ JSDoc con todos los campos del backend
- ✅ IDs uses `_id` (MongoDB)

**Archivo**: `types/restaurant.types.js`

## 📡 Endpoints Mapeados

```javascript
POST   /restaurants              ← Crear restaurante
GET    /restaurants              ← Listar restaurantes
GET    /restaurants/:id          ← Obtener por ID
PUT    /restaurants/:id          ← Actualizar restaurante
DELETE /restaurants/:id          ← Eliminar (soft delete)
```

## 📋 Estructura de Datos

### Backend Response
```javascript
{
  _id: ObjectId,
  restaurant_name: "La Pizzería",
  restaurant_type: "Casual",
  restaurant_type_gastronomic: "Italiana",
  restaurant_direction: "Calle Principal 123",
  restaurant_time_start: "10:00",
  restaurant_time_close: "23:00",
  restaurant_mean_price: 45.50,
  restaurant_images: ["https://cloudinary.com/image.jpg"],
  contact_id: ObjectId,
  table_id: ObjectId,
  estado: true,
  createdAt: "2024-04-29T...",
  updatedAt: "2024-04-29T..."
}
```

### Frontend Form Data
```javascript
{
  name: "La Pizzería",
  type: "Casual",
  gastronomicType: "Italiana",
  address: "Calle Principal 123",
  timeStart: "10:00",
  timeClose: "23:00",
  meanPrice: 45.50,
  image: File
}
```

## 🚀 Cómo Usar

### 1. Crear Restaurante
```javascript
import { useRestaurantForm, formatRestaurantData } from '@/features/restaurant'

const { handleCreate, loading } = useRestaurantForm()

const onSubmit = async (formData) => {
  const payload = formatRestaurantData(formData)
  const result = await handleCreate(payload)
}
```

### 2. Listar Restaurantes
```javascript
import { useRestaurants } from '@/features/restaurant'

const { restaurants, loading, error, fetchRestaurants } = useRestaurants()

useEffect(() => {
  fetchRestaurants()
}, [])
```

### 3. Actualizar Restaurante
```javascript
const { handleUpdate } = useRestaurantForm()

const result = await handleUpdate(id, payload)
```

### 4. Eliminar Restaurante
```javascript
import { useRestaurantDelete } from '@/features/restaurant'

const { handleDelete } = useRestaurantDelete()

const result = await handleDelete(restaurantId)
```

## 📚 Documentación

Creé un archivo de mapeo detallado: **`FRONTEND_BACKEND_MAPPING.md`**

Contiene:
- ✅ Mapeo campo por campo
- ✅ Ejemplos de solicitudes/respuestas
- ✅ Flujo completo de datos
- ✅ Consideraciones importantes

## ✨ Características

- ✅ Validación de formulario completa
- ✅ Manejo de errores
- ✅ Loading states
- ✅ Toast notifications (con `react-hot-toast`)
- ✅ Upload de imágenes
- ✅ Edición inline
- ✅ Soft delete
- ✅ Responsive design ready

## 🔧 Próximos Pasos

1. **Estilos CSS** - Agregar clases CSS para los componentes
2. **Rutas** - Agregar `RestaurantPage` a las rutas de la app
3. **Testing** - Crear tests unitarios
4. **Integración** - Probar con backend real

## 📝 Archivo de Referencia

| Archivo | Cambios |
|---------|---------|
| `constants/restaurantConstants.js` | ✅ Actualizado |
| `utils/restaurantUtils.js` | ✅ Actualizado |
| `types/restaurant.types.js` | ✅ Actualizado |
| `components/RestaurantModal.jsx` | ✅ Creado |
| `components/RestaurantCard.jsx` | ✅ Actualizado |
| `components/Restaurants.jsx` | ✅ Creado |
| `pages/RestaurantPage.jsx` | ✅ Actualizado |
| `index.js` | ✅ Actualizado |

---

**Estado**: ✅ Listo para usar
**Última actualización**: 2024-04-29
