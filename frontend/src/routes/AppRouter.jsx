import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

import ErrorBoundary from '../components/common/ErrorBoundary';

// Lazy load pages
const HomePage = lazy(() => import('../pages/HomePage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const DetailPage = lazy(() => import('../pages/DetailPage'));
const WatchPage = lazy(() => import('../features/streaming/pages/WatchPage'));
const FavoritesPage = lazy(() => import('../pages/FavoritesPage'));
const AuthPage = lazy(() => import('../pages/AuthPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Manga
const MangaPage = lazy(() => import('../features/manga/pages/MangaPage'));
const MangaDetailPage = lazy(() => import('../features/manga/pages/MangaDetailPage'));
const MangaReaderPage = lazy(() => import('../features/manga/pages/MangaReaderPage'));

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? children : <Navigate to="/auth" />;
}

export default function AppRouter() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/anime/:id" element={<DetailPage />} />
          <Route path="/watch/:id" element={<WatchPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Manga Routes */}
          <Route path="/manga" element={<MangaPage />} />
          <Route path="/manga/:id" element={<MangaDetailPage />} />
          <Route path="/manga/read/:chapterId" element={<MangaReaderPage />} />

          <Route 
            path="/favorites" 
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
