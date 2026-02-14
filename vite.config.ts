import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/memorise/',
  define: {
    'process.env.API_KEY': JSON.stringify("AizaSyDUZcyzLfl-e_xHyzKIDE1kwSUPT0Ibws8"),
    'process.env.GEMINI_API_KEY': JSON.stringify("AizaSyDUZcyzLfl-e_xHyzKIDE1kwSUPT0Ibws8")
  }
})
