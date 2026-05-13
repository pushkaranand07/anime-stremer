import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@vidstack/react/player/layouts/default': path.resolve(__dirname, 'node_modules/@vidstack/react/prod/player/vidstack-default-layout.js'),
      '@vidstack/react/icons': path.resolve(__dirname, 'node_modules/@vidstack/react/prod/vidstack-icons.js'),
    },
  },
})
