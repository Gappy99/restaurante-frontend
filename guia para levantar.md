# 🔗 Guía de Configuración: Frontend + Backend Separados

## Estructura de Repositorios

```
gestor-restaurante-backend (Node.js + .NET)
gestor-restaurante-frontend (React + Vite)
```

## 📋 Requisitos

- Backend corriendo en `http://localhost:3000` (desarrollo)
- Node.js 18+
- pnpm 10.29.3+

---

## 🚀 Setup Completo - Opción 1: Local sin Docker

### 1️⃣ Backend (en el repositorio original)

```bash
# En la carpeta del backend
cd gestor-restaurante-backend

# Instalar dependencias
pnpm install

# Configurar .env (asegurar que CORS está habilitado)
# IMPORTANT: El backend debe estar en puerto 3000

# Iniciar el backend
pnpm dev
# o
npm start

```

**Verificar que el backend está corriendo:**
```
http://localhost:3000
http://localhost:3000/GestorRestaurante/v1/health
```

### 2️⃣ Frontend (en el nuevo repositorio)

```bash
# En la carpeta del frontend
cd gestor-restaurante-frontend

# Instalar dependencias
pnpm install

# Asegurar que .env.local esté configurado
# (por defecto ya apunta a localhost:3000)
cat .env.local

# Iniciar el frontend
pnpm dev
```

El frontend se abrirá en `http://localhost:5173`

---

## 🐳 Setup Completo - Opción 2: Con Docker Compose

### Crea un `docker-compose.yml` en la raíz del proyecto backend:

```yaml
version: "3.8"

services:
  # Base de datos MongoDB
  mongodb:
    image: mongo:7
    container_name: gestor_restaurante_mongo
    restart: always
    environment:
      MONGO_INITDB_DATABASE: gestor_restaurante
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - gestor_network

  # Backend Node.js
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: gestor_restaurante_backend
    restart: always
    environment:
      MONGO_URI: mongodb://mongodb:27017/gestor_restaurante
      NODE_ENV: development
      PORT: 3000
      CORS_ORIGIN: http://localhost:5173
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
    networks:
      - gestor_network

  # Frontend React + Vite
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: gestor_restaurante_frontend
    restart: always
    environment:
      VITE_API_URL: http://backend:3000
      VITE_AUTH_URL: http://backend:3000/GestorRestaurante/v1/auth
      VITE_ADMIN_URL: http://backend:3000/GestorRestaurante/v1
    ports:
      - "5173:5173"
    depends_on:
      - backend
    networks:
      - gestor_network

volumes:
  mongo_data:

networks:
  gestor_network:
    driver: bridge
```

### Levantar con Docker Compose:

```bash
docker-compose up -d

# Verificar estado
docker-compose ps

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Detener
docker-compose down
```

---

## ✅ Verificación de Conectividad

### 1. Verificar que el Backend está corriendo
```bash
curl http://localhost:3000
# Debe retornar respuesta del servidor
```

### 2. Verificar que el Frontend se conecta
```
Abre http://localhost:5173 en el navegador
Abre DevTools (F12) → Network
Intenta hacer login o cualquier acción que llame al API
Verifica que las llamadas a /GestorRestaurante/* no tengan CORS errors
```

---

## 🔧 Configuración de CORS en el Backend

**El backend DEBE tener CORS habilitado para que el frontend funcione.**

En `index.js` o `app.js` del backend:

```javascript
import cors from 'cors';

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',        // Desarrollo local
    'http://localhost:3000',        // Si sirves frontend desde aquí
    'http://frontend:5173',         // Si usas Docker
    'https://tudominio.com',        // Producción
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

---

## 🌍 Variables de Entorno por Entorno

### Desarrollo (.env.local)
```env
VITE_API_URL=http://localhost:3000
VITE_AUTH_URL=http://localhost:3000/GestorRestaurante/v1/auth
VITE_ADMIN_URL=http://localhost:3000/GestorRestaurante/v1
VITE_ENVIRONMENT=development
```

### Staging (.env.staging)
```env
VITE_API_URL=https://api-staging.tudominio.com
VITE_AUTH_URL=https://api-staging.tudominio.com/GestorRestaurante/v1/auth
VITE_ADMIN_URL=https://api-staging.tudominio.com/GestorRestaurante/v1
VITE_ENVIRONMENT=staging
```

### Producción (.env.production)
```env
VITE_API_URL=https://api.tudominio.com
VITE_AUTH_URL=https://api.tudominio.com/GestorRestaurante/v1/auth
VITE_ADMIN_URL=https://api.tudominio.com/GestorRestaurante/v1
VITE_ENVIRONMENT=production
```

---

## 🚀 Levantar el proyecto

### Opción 1: Docker directo
1. Abre PowerShell en `c:\restaurante-frontend`
2. Construye la imagen:
```powershell
docker build -t restaurante-frontend .
```
3. Ejecuta el contenedor:
```powershell
docker run -p 5173:5173 restaurante-frontend
```
4. Abre en el navegador:
```text
http://localhost:5173
```

> Si quieres ejecutarlo en segundo plano:
> ```powershell
docker run -d -p 5173:5173 restaurante-frontend
> ```

### Opción 2: Docker Compose
1. Abre PowerShell en `c:\restaurante-frontend`
2. Ejecuta:
```powershell
docker compose up -d
```
3. Abre en el navegador:
```text
http://localhost:5173
```

> Para detenerlo:
> ```powershell
docker compose down
> ```

---

## ✅ Notas rápidas
- `Dockerfile` se usa con la opción 1.
- `docker-compose.yml` se usa con la opción 2.
- Ambas opciones sirven si ya has creado la imagen y el archivo de configuración.

## 🚨 Troubleshooting

### ❌ Error: CORS error
- Verifica que el backend tiene CORS habilitado
- Verifica que `VITE_API_URL` es correcto
- En navegador, ve a DevTools → Network y revisa la llamada que falla

### ❌ Error: 404 en las APIs
- Verifica que el backend está corriendo: `curl http://localhost:3000`
- Verifica que las rutas en el backend empiezan con `/GestorRestaurante/v1/`
- Verifica en los logs del backend qué ruta se está recibiendo

### ❌ Error: "Cannot GET /"
- El frontend necesita un servidor HTTP
- Si usas `http-server` o similar, necesita configuración para SPA (index.html fallback)

### ❌ Docker: contenedores no se conectan
- Verifica que están en la misma red
- Usa nombres de servicio como hostname: `http://backend:3000` dentro de Docker
- Pero desde el host, usa `http://localhost:3000`