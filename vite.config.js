import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Mantenemos tu estructura y aseguramos la redirección
      '/GestorRestaurante': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // Esta línea es opcional pero ayuda si el backend espera la ruta limpia
        rewrite: (path) => path.replace(/^\/GestorRestaurante/, '/GestorRestaurante')
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
})