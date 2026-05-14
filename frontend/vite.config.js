import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // In production builds, fail if the API URL is not configured
  if (mode === 'production' && !process.env.VITE_API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL must be set for production builds');
  }

  return {
    plugins: [react()],
  };
});
