import { Link, useLocation } from 'react-router-dom';
import '../../features/anime-catalog/styles/footer.css';

const AZ_LETTERS = ['All', '#', '0-9', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

const NAV_LINKS = [
  { label: 'Help',      path: '/' },
  { label: 'Main',     path: '/search?type=anime' },
  { label: 'FAQ',  path: '/schedule' },
  { label: 'DMCA', path: '/community' },
  { label: 'TERMS',     path: '/about' },
  { label: 'ABOUT',   path: '/contact' },
  { label: 'CONTENT',      path: '/dmca' },
  { label: 'REQUEST',     path: '/request' },
];

export default function Footer() {
  const location = useLocation();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">

      {/* ── A-Z Browse Section ── */}
      <div className="footer-az-section">
        <p className="footer-az-title">
          A-Z List
          <span>Searching anime order by alphabet name A to Z.</span>
        </p>
        <div className="footer-az-letters">
          {AZ_LETTERS.map((letter) => (
            <Link
              key={letter}
              to={`/search?letter=${encodeURIComponent(letter)}`}
              className={`footer-az-btn${letter === 'All' ? ' all' : ''}`}
            >
              {letter}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Brand + Navigation Row ── */}
      <div className="footer-brand-row">

        {/* Logo */}
        <Link to="/" className="footer-logo">
          <div className="footer-logo-box">Y</div>
          <span className="footer-logo-wordmark">
            YO<span>RU</span>
          </span>
          <span className="footer-logo-kanji">夜</span>
        </Link>

        {/* Nav links */}
        <nav className="footer-nav-links">
          <span className="footer-nav-label">Navigate:</span>
          {NAV_LINKS.map(({ label, path }) => {
            const isActive =
              path === '/'
                ? location.pathname === '/'
                : (location.pathname + location.search).startsWith(path.split('?')[0]);
            return (
              <Link
                key={label}
                to={path}
                className={`footer-nav-link${isActive ? ' active' : ''}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Copyright + Disclaimer ── */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          Copyright © YORU Anime {year}. All Rights Reserved.
        </p>
        <p className="footer-disclaimer">
          This site does not store any files on its server. All contents are provided
          by non-affiliated third parties. YORU is not responsible for any content
          hosted by third-party services.
        </p>
        <p className="footer-made-by">
          Designed &amp; built by{' '}
          <a href="https://github.com/pushkaranand07" target="_blank" rel="noreferrer">
            Pushkar Anand
          </a>
          {' '}— YORU 夜 Anime Streaming Platform
        </p>
      </div>

    </footer>
  );
}
