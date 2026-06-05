import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Cambiá '/abh-hockey/' por el nombre real de tu repositorio en GitHub
  // Si el repo se llama 'abh-hockey', la base debe ser '/abh-hockey/'
  // Si usás un dominio custom (abh.com.ar), dejá base: '/'
  base: process.env.NODE_ENV === 'production' ? '/abh-hockey/' : '/',
})
