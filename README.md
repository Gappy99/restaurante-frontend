# Frontend - Gestor de Restaurante

React + Vite application para la gestión de restaurantes.

## 📋 Requisitos

- Node.js 18+ 
- pnpm 10.29.3+

## 🚀 Instalación y Setup

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/gestor-restaurante-frontend.git
cd gestor-restaurante-frontend
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Configurar variables de entorno

Crear archivo `.env.local` basado en `.env.example`:

```bash
cp .env.example .env.local
```

Editar `.env.local` con las URLs de tu backend:

```env
# Local (puerto 3000 donde corre el backend Node.js)
VITE_API_URL=http://localhost:3000
VITE_AUTH_URL=http://localhost:3000/GestorRestaurante/v1/auth
VITE_ADMIN_URL=http://localhost:3000/GestorRestaurante/v1

VITE_APP_NAME=Gestor de Restaurante
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

## 💻 Desarrollo

### Iniciar servidor de desarrollo
```bash
pnpm dev
```

El frontend se abrirá en `http://localhost:5173`

### Compilación
```bash
pnpm build
```

### Preview de producción
```bash
pnpm preview
```

### Linting
```bash
pnpm lint
```

## 🔗 Conectar con Backend

El frontend está configurado para conectarse al backend en:
- **Desarrollo**: `http://localhost:3000`
- **Staging**: `https://api-staging.tudominio.com`
- **Producción**: `https://api.tudominio.com`

### Proxy automático en desarrollo
Vite incluye un proxy que redirige llamadas a `/GestorRestaurante/*` al backend.

### En producción
La API debe servirse desde el mismo dominio o tener CORS configurado correctamente en el backend.

## 📦 Dependencias principales

- **React** 19.2.4
- **React Router DOM** 7.14.0
- **Vite** 8.0.4
- **Tailwind CSS** 4.2.2
- **Axios** 1.15.0
- **React Hook Form** 7.72.1
- **React Hot Toast** 2.6.0
- **Zustand** 5.0.12

## 🌍 Estructura del proyecto

```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── store/
│   └── App.jsx
├── .env.example
├── .env.local
├── .env.staging
├── .env.production
├── vite.config.js
└── package.json
```

## 🐳 Usar con Docker

Ver `docker-compose.yml` en el repositorio principal.

## 📝 Licencia

ISC
