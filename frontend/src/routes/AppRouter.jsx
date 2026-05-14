import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import PageErrorBoundary from '../components/common/PageErrorBoundary';

// Lazy load pages
const HomePage = lazy(() => import('../pages/HomePage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const DetailPage = lazy(() => import('../pages/DetailPage'));
const WatchPage = lazy(() => import('../features/streaming/pages/WatchPage'));
const FavoritesPage = lazy(() => import('../pages/FavoritesPage'));
const AuthPage = lazy(() => import('../pages/AuthPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));


/**
 * Wraps each page in its own error boundary so one crash doesn't kill the app.
 */
function Page({ Component }) {
  return (
    <PageErrorBoundary>
      <Component />
    </PageErrorBoundary>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitializing } = useAuth();
  if (isInitializing) return <LoadingSpinner />;
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

export default function AppRouter() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Page Component={HomePage} />} />
          <Route path="/search" element={<Page Component={SearchPage} />} />
          <Route path="/anime/:id" element={<Page Component={DetailPage} />} />
          <Route path="/watch/:id" element={<Page Component={WatchPage} />} />
          <Route path="/auth" element={<Page Component={AuthPage} />} />


          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Page Component={FavoritesPage} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Page Component={NotFoundPage} />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
