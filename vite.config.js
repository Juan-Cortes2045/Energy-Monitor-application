import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    plugins: [react()],
    server: {
      // En desarrollo la web llama a /api en su propio origen y Vite lo reenvía al gateway, igual
      // que nginx en la pila de Docker: las cookies HttpOnly de la sesión funcionan sin CORS.
      proxy: {
        '/api': env.VITE_DEV_API_TARGET || 'http://localhost:8080',
      },
    },
  }
})
