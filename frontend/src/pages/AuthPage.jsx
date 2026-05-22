import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import '../styles/auth-page.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup } = useAuth();
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
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
        navigate('/');
      } else {
        await signup(formData);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div ref={containerRef} className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            {isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
          </h1>
          <p className="auth-subtitle">
            {isLogin ? 'Enter your credentials to access your archive' : 'Join the global community of anime discoverers'}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-form-group">
              <label className="auth-label">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="auth-input"
                placeholder="otaku_explorer"
              />
            </div>
          )}
          <div className="auth-form-group">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="auth-input"
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="auth-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="auth-submit-btn"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-toggle-container">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="auth-toggle-btn"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
