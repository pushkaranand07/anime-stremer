import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import DetailPage from './pages/DetailPage';
import WatchPage from './features/streaming/pages/WatchPage';
import FavoritesPage from './pages/FavoritesPage';
import AuthPage from './pages/AuthPage';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return null; // Or a loading spinner
  return isAuthenticated ? children : <Navigate to="/auth" />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/anime/:id" element={<DetailPage />} />
      <Route path="/watch/:id" element={<WatchPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route 
        path="/favorites" 
        element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
