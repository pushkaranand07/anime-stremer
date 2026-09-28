import { createContext, useState, useEffect, useMemo } from 'react';
import { axiosInstance, bootstrapCsrf } from './axiosInterceptor';
import { useAuthStore } from './authStore';

export const AuthContext = createContext(null);

/**
 * AuthProvider — pure session-cookie architecture.
 *
 * - On mount:
 *   1. Fetches CSRF cookie via bootstrapCsrf()
 *   2. Checks if an existing session cookie is valid via GET /auth/me/
 * - Login / Logout / Signup:
 *   Standard API calls. The browser handles the `animesession` cookie automatically.
 */
export function AuthProvider({ children }) {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [isInitializing, setInitializing] = useState(true);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        // 1. Ensure CSRF cookie exists before any user action
        await bootstrapCsrf();

        // 2. Ask Django whether the session is active
        const response = await axiosInstance.get('/auth/me/');
        if (!cancelled && response?.user) {
          setAuth(response.user);
        } else if (!cancelled) {
          clearAuth();
        }
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) {
          setInitializing(false);
          setIsHydrating(false);
        }
      }
    }

    hydrate();
    return () => { cancelled = true; };
  }, []);

  /**
   * login({ username|email, password, remember_me? })
   */
  const login = async ({ username, email, password, remember_me = false }) => {
    await bootstrapCsrf();
    const response = await axiosInstance.post('/auth/login/', {
      username: username || email,
      email: email || username,
      password,
      remember_me,
    });

    if (response?.user) {
      setAuth(response.user);
    }
    return response;
  };

  /**
   * signup({ username, email, password })
   */
  const signup = async ({ username, email, password }) => {
    await bootstrapCsrf();
    const response = await axiosInstance.post('/auth/register/', {
      username: username || (email ? email.split('@')[0] : 'user'),
      email,
      password,
      password_confirm: password,
    });

    if (response?.user) {
      setAuth(response.user);
    }
    return response;
  };

  /**
   * logout()
   */
  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout/', {});
    } catch {
      // Clear client state even if network call fails
    }
    clearAuth();
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isInitializing: isInitializing || isHydrating,
      login,
      signup,
      register: signup,
      logout,
    }),
    [user, isAuthenticated, isInitializing, isHydrating]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
