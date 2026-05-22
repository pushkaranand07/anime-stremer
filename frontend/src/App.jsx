import { useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import SmoothScroll from './components/layout/SmoothScroll';
import AppRouter from './routes/AppRouter';

/**
 * Listens for 'auth:logout' events dispatched by the API client
 * when a 401 cannot be recovered. Uses React Router navigate()
 * instead of hard window.location.href redirect.
 */
function AuthLogoutListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => navigate('/auth', { replace: true });
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <AuthLogoutListener />
        <AppRouter />
      </SmoothScroll>
    </BrowserRouter>
  );
}

export default App;
