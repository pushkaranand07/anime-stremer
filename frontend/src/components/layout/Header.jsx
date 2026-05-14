import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
          ANIME DISCOVERY
        </Link>
        <nav className="flex gap-8 items-center">
          <NavLink to="/" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-yellow-400 ${isActive ? 'text-yellow-400' : 'text-gray-400'}`}>
            Home
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-yellow-400 ${isActive ? 'text-yellow-400' : 'text-gray-400'}`}>
            Search
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/favorites" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-yellow-400 ${isActive ? 'text-yellow-400' : 'text-gray-400'}`}>
                Favorites
              </NavLink>
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 uppercase font-black tracking-tighter">Account</span>
                  <span className="text-sm font-bold text-white">{user?.username}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 rounded-full bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/auth" 
              className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-yellow-400 transition-colors"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
