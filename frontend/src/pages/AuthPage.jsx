import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import MagnetButton from '../components/ui/MagnetButton';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current, 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/signup';
      const response = await axios.post(`http://localhost:5000/api/auth${endpoint}`, formData);
      
      if (isLogin) {
        login(response.data.user, response.data.token);
        navigate('/');
      } else {
        setIsLogin(true);
        setFormData({ ...formData, password: '' });
        // Optionally show success toast here
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-[#0a0a0a]">
      <div ref={containerRef} className="w-full max-w-md bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
            {isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
          </h1>
          <p className="text-gray-400">
            {isLogin ? 'Enter your credentials to access your archive' : 'Join the global community of anime discoverers'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all"
                placeholder="otaku_explorer"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <MagnetButton className="w-full py-5 text-lg" onClick={() => {}}>
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </MagnetButton>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-400 hover:text-yellow-400 transition-colors font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
