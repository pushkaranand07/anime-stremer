import { motion } from 'framer-motion';
import { Search, LogOut, User } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import GlowButton from '../ui/GlowButton';
import gsap from 'gsap';
import { animateNavbarEnter, animateNavbarLeave, navbarScale } from '../../animations/animation';
import '../../styles/header.css';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Anime', path: '/search?type=anime' },
    { label: 'Manga', path: '/search?type=manga' },
    { label: 'Schedule', path: '/schedule' },
    { label: 'Community', path: '/community' },
    { label: 'Shop', path: '/shop' },

    ...(isAuthenticated ? [{ label: 'Favorites', path: '/favorites' }] : []),
  ];

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (isNavbarOpen) {
        toggleNavbar();
      }
    }
  };

  const toggleNavbar = () => {
    const nextState = !isNavbarOpen;
    setIsNavbarOpen(nextState);

    const burger = document.getElementById('burger');
    if (burger) {
      burger.classList.toggle('active', nextState);
    }

    if (nextState) {
      animateNavbarEnter('#navbar', '#navLinks li a', '.contact');
      const drawer = document.getElementById('navbar');
      if (drawer) drawer.focus();
    } else {
      animateNavbarLeave('#navbar', '#navLinks li a', '.contact');
      const drawer = document.getElementById('navbar');
      if (drawer) drawer.blur();
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      navbarScale('#burger', '#hero');
    });

    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <header className="app-header">
      {/* Logo */}
      <Link to="/" className="header-logo">
        {/* Icon box */}
        <div className="logo-box">Y</div>
        {/* Wordmark */}
        <span className="logo-wordmark">YORU</span>
        {/* Kanji */}
        <span className="logo-kanji">夜</span>
      </Link>

      {/* Nav */}
      <nav className="header-nav">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.label} to={item.path} style={{ textDecoration: 'none' }}>
              <motion.span
                whileHover={{ color: '#a855f7' }}
                className={`nav-link-text ${isActive ? 'active' : 'inactive'}`}
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </nav>

      {/* Actions (Search + Auth) */}
      <div className="header-actions">
        {/* Search */}
        <div className="header-search-container">
          <Search size={14} color="#6b7280" />
          <input
            placeholder="Search anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className="header-search-input"
          />
        </div>

        {/* Auth */}
        {isAuthenticated ? (
          <div className="header-auth-container">
            <div className="header-user-tag">
              <User size={16} color="#a855f7" />
              <span className="header-username">{user?.username}</span>
            </div>
            <button
              onClick={logout}
              className="header-logout-btn"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        ) : (
          <GlowButton onClick={() => navigate('/auth')}>Sign In</GlowButton>
        )}
      </div>

      {/* Mobile Hamburger Burger */}
      <button 
        id="burger" 
        className="mobile-burger-btn"
        onClick={toggleNavbar}
        aria-label="Toggle Navigation Menu"
      >
        <span className="burger-line"></span>
        <span className="burger-line"></span>
        <span className="burger-line"></span>
      </button>

      {/* Mobile Drawer (GSAP target `#navbar`) */}
      <div id="navbar" className="mobile-drawer" tabIndex={-1}>
        <div className="mobile-drawer-header">
          <div className="header-logo">
            <div className="logo-box">Y</div>
            <span className="logo-wordmark">YORU</span>
            <span className="logo-kanji">夜</span>
          </div>
          <button className="mobile-drawer-close" onClick={toggleNavbar} aria-label="Close menu">&times;</button>
        </div>

        <nav id="navLinks" className="mobile-drawer-nav">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.label} className="mobile-nav-li">
                <Link 
                  to={item.path} 
                  onClick={toggleNavbar}
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </nav>

        {/* Dynamic Contact/Footer container (GSAP target `.contact`) */}
        <div className="contact mobile-drawer-footer">
          <div className="mobile-search-wrapper">
            <Search size={14} color="#6b7280" />
            <input
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="mobile-search-input"
            />
          </div>
          
          <div className="mobile-auth-wrapper">
            {isAuthenticated ? (
              <div className="mobile-user-actions">
                <div className="header-user-tag">
                  <User size={16} color="#a855f7" />
                  <span className="header-username">{user?.username}</span>
                </div>
                <button
                  onClick={() => { logout(); toggleNavbar(); }}
                  className="header-logout-btn"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            ) : (
              <GlowButton onClick={() => { navigate('/auth'); toggleNavbar(); }}>Sign In</GlowButton>
            )}
          </div>

          <div className="mobile-socials">
            <span className="social-tag">JOIN DISCORD</span>
            <span className="social-tag">TWITTER</span>
          </div>
        </div>
      </div>
    </header>
  );
}