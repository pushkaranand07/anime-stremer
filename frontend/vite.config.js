import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // In production builds, warn if the API URL is not configured, but do not fail the build
  if (mode === 'production' && !process.env.VITE_API_BASE_URL) {
    console.warn('⚠️ Warning: VITE_API_BASE_URL is not set for this production build. Defaulting to local/relative endpoints.');
  }

  return {
    plugins: [react()],
  };
});
