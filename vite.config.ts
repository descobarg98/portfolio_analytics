import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const basePath = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base: basePath,
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
