import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
          base: '/memorise/',
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(AIzaSyDUZcyzLfl-e_xHyzKIDE1kwSUPT0Ibws8),
        'process.env.GEMINI_API_KEY': JSON.stringify(AIzaSyDUZcyzLfl-e_xHyzKIDE1kwSUPT0Ibws8),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
