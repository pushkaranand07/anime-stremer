import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import PageErrorBoundary from '../components/common/PageErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../components/layout/MainLayout';

// Lazy load pages
const HomePage = lazy(() => import('../pages/HomePage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const DetailPage = lazy(() => import('../pages/DetailPage'));
const WatchPage = lazy(() => import('../features/streaming/pages/WatchPage'));
const FavoritesPage = lazy(() => import('../pages/FavoritesPage'));
const AuthPage = lazy(() => import('../pages/AuthPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.18, ease: 'easeIn' } }
};

/**
 * Wraps each page in its own error boundary and page transition animation.
 */
function Page({ Component }) {
  return (
    <PageErrorBoundary>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <Component />
      </motion.div>
    </PageErrorBoundary>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitializing } = useAuth();
  if (isInitializing) return <LoadingSpinner />;
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

export default function AppRouter() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Pages wrapped inside MainLayout with Header & SideNav */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Page Component={HomePage} />} />
              <Route path="/search" element={<Page Component={SearchPage} />} />
              <Route path="/anime/:id" element={<Page Component={DetailPage} />} />
              <Route path="/watch/:id" element={<Page Component={WatchPage} />} />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <Page Component={FavoritesPage} />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Flat pages outside layout wrapper */}
            <Route path="/auth" element={<Page Component={AuthPage} />} />
            <Route path="*" element={<Page Component={NotFoundPage} />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
}
