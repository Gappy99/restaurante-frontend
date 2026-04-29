# Mapeo Frontend-Backend: Restaurant Feature

## 🔄 Estructura de Datos

### Backend (MongoDB)
```javascript
{
  _id: ObjectId,
  restaurant_name: String,           // Nombre del restaurante
  restaurant_type: String,           // Tipo: Fast Food, Casual, Fine Dining, etc
  restaurant_type_gastronomic: String, // Tipo gastronómico: Italiana, Mexicana, etc
  restaurant_direction: String,      // Dirección/ubicación
  restaurant_time_start: String,     // Horario apertura (HH:MM)
  restaurant_time_close: String,     // Horario cierre (HH:MM)
  restaurant_mean_price: Number,     // Precio promedio
  restaurant_images: [String],       // Array de URLs de imágenes
  contact_id: ObjectId,              // Referencia a contacto
  table_id: ObjectId,                // Referencia a mesa
  estado: Boolean,                   // true = activo, false = inactivo
  createdAt: Date,
  updatedAt: Date
}
```

### Frontend (Formulario)
```javascript
{
  name: String,                      // → restaurant_name
  type: String,                      // → restaurant_type
  gastronomicType: String,           // → restaurant_type_gastronomic
  address: String,                   // → restaurant_direction
  timeStart: String,                 // → restaurant_time_start
  timeClose: String,                 // → restaurant_time_close
  meanPrice: Number,                 // → restaurant_mean_price
  image: File                        // → restaurant_images (se envía como FormData)
}
```

## 🔗 Mapeo de Campos

| Backend | Frontend | Tipo | Descripción |
|---------|----------|------|-------------|
| `restaurant_name` | `name` | String | Nombre del restaurante |
| `restaurant_type` | `type` | Select | Tipo de restaurante |
| `restaurant_type_gastronomic` | `gastronomicType` | Select | Tipo gastronómico |
| `restaurant_direction` | `address` | String | Dirección |
| `restaurant_time_start` | `timeStart` | Time | Hora de apertura |
| `restaurant_time_close` | `timeClose` | Time | Hora de cierre |
| `restaurant_mean_price` | `meanPrice` | Number | Precio promedio |
| `restaurant_images[0]` | `image` | File | Imagen principal |
| `estado` | (No editable) | Boolean | Estado del restaurante |

## 📤 Envío de Datos

### Crear Restaurante
```javascript
const formData = new FormData()
formData.append('restaurant_name', 'Mi Restaurante')
formData.append('restaurant_type', 'Casual')
formData.append('restaurant_type_gastronomic', 'Italiana')
formData.append('restaurant_direction', 'Calle 123')
formData.append('restaurant_time_start', '10:00')
formData.append('restaurant_time_close', '23:00')
formData.append('restaurant_mean_price', '45.50')
formData.append('restaurant_images', imageFile) // Archivo de imagen

// POST /api/restaurants
const response = await adminClient.post('/restaurants', formData)
```

### Actualizar Restaurante
```javascript
const formData = new FormData()
formData.append('restaurant_name', 'Mi Restaurante Actualizado')
// ... otros campos

// PUT /api/restaurants/:id
const response = await adminClient.put(`/restaurants/${id}`, formData)
```

## 📥 Recepción de Datos

### Listar Restaurantes
```javascript
// GET /api/restaurants
const response = await adminClient.get('/restaurants')

response.data: {
  success: true,
  total: 5,
  restaurants: [
    {
      _id: '...',
      restaurant_name: 'La Pizzería',
      restaurant_type: 'Casual',
      // ... campos del restaurante
    }
  ]
}
```

### Obtener por ID
```javascript
// GET /api/restaurants/:id
const response = await adminClient.get(`/restaurants/${id}`)

response.data: {
  success: true,
  restaurant: { ... }
}
```

## ✅ Validaciones

### Backend
- `restaurant_name` - Requerido, string, trimmed
- `restaurant_type` - Requerido
- `restaurant_type_gastronomic` - Requerido
- `restaurant_direction` - Requerido, string, trimmed
- `restaurant_time_start` - Requerido, formato HH:MM
- `restaurant_time_close` - Requerido, formato HH:MM
- `restaurant_mean_price` - Requerido, número >= 0

### Frontend
- Mismos campos requeridos
- Validación de horarios (timeStart < timeClose)
- Validación de precio > 0
- Validación de imagen (opcional)

## 🔄 Flujo Completo

### 1. Crear Restaurante
```
User Input (RestaurantModal)
    ↓
formatRestaurantData() - Mapea nombres de campos
    ↓
FormData object
    ↓
adminClient.post('/restaurants') - Envía al backend
    ↓
Backend crear documento
    ↓
Respuesta con _id
    ↓
Store actualiza (useRestaurantStore)
    ↓
UI re-renderiza
```

### 2. Mostrar Restaurante
```
Backend data
    ↓
Recibido en Store
    ↓
RestaurantCard recibe props
    ↓
Accede a restaurant_name, restaurant_direction, etc
    ↓
Muestra en UI
```

## 🛠️ Funciones Auxiliares

### `formatRestaurantData()`
Convierte del frontend al formato del backend.

```javascript
import { formatRestaurantData } from '@/features/restaurant'

const payload = formatRestaurantData({
  name: 'La Pizzería',
  type: 'Casual',
  // ...
})
// Retorna FormData con nombres correctos del backend
```

### `validateRestaurantForm()`
Valida los campos del formulario.

```javascript
import { validateRestaurantForm } from '@/features/restaurant'

const { isValid, errors } = validateRestaurantForm(formData)
if (!isValid) {
  // errors = { name: 'El nombre es requerido', ... }
}
```

## 🎯 Consideraciones

1. **Imagen**: Se envía como `FormData` con nombre `restaurant_images`
2. **Estado**: El backend usa booleano (true/false), frontend muestra "Activo"/"Inactivo"
3. **Horarios**: Formato HH:MM en HTML input[type=time]
4. **ID**: El backend usa `_id` (MongoDB), no es editable
5. **Mesas**: El backend crea 3 mesas por defecto al crear restaurante

## 📝 Notas Importantes

- El frontend **NO** maneja `contact_id` ni `table_id` - estos se generan automáticamente en el backend
- Las imágenes se suben a **Cloudinary**
- El soft delete usa el campo `estado: false`
- Los timestamps (`createdAt`, `updatedAt`) se generan automáticamente en el backend

---

**Última actualización**: 2024-04-29
**Versión**: 1.0
