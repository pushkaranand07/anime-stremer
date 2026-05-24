import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './features/auth/context/AuthContext';
import { FavoritesProvider } from './features/favorites/context/FavoritesContext';
import App from './App';
import './index.css';

// ── Suppress cosmetic THREE.Clock deprecation warning from @react-three/fiber internals ──
// We are already on three@latest + r3f@latest. This is a known upstream noise warning
// (see github.com/pmndrs/react-three-fiber/issues). Filter it without hiding real errors.
const _origWarn = console.warn.bind(console);
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('THREE.Clock')) return;
  _origWarn(...args);
};

// Create a client with aggressive caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes — data stays fresh
      gcTime: 10 * 60 * 1000,   // 10 minutes — cache remains
      retry: 2,                 // retry failed requests twice
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
