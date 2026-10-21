import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Configuración de Vite preparada para despliegue estático en GitHub Pages.
 * `base: './'` genera rutas relativas en `dist/index.html`, permitiendo que la web
 * funcione tanto en `https://<usuario>.github.io/<repositorio>/` como en un dominio propio.
 */
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
