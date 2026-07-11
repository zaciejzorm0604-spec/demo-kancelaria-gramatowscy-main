import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/demo/e-kancelaria/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
