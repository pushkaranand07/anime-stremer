import { Link, useLocation } from 'react-router-dom';
import '../../styles/side-nav.css';

const icons = [
  {
    label: 'Home', path: '/',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
    )
  },
  {
    label: 'Anime', path: '/search?type=anime',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <rect x="2" y="7" width="20" height="15" rx="2"/>
        <polyline points="17 2 12 7 7 2"/>
      </svg>
    )
  },
  {
    label: 'Manga', path: '/search?type=manga',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    )
  },
  {
    label: 'Favorites', path: '/favorites',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    )
  },
];

export default function SideNav() {
  const location = useLocation();

  return (
    <>
      {/* Edge glow line behind side nav */}
      <div className="sidenav-edge-glow" />

      <nav className="sidenav-container">
        {icons.map(({ label, path, svg }) => {
          const isActive = location.pathname === path || location.pathname + location.search === path;
          return (
            <Link
              key={label}
              to={path}
              title={label}
              style={{ textDecoration: 'none' }}
            >
              <div
                className={`sidenav-icon-wrapper ${isActive ? 'active' : 'inactive'}`}
              >
                {svg}
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
