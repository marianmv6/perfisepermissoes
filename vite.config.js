import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Dev local: porta 4002 (módulo de eventos usa 4001). */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4002,
    host: true,
    strictPort: true,
    open: true,
  },
});
