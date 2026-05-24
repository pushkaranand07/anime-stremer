import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../../features/anime-catalog/styles/main-layout.css';

export default function MainLayout() {
  return (
    <div className="main-layout-container">
      {/* Fixed ambient overlays only inside main layouts */}
      <div className="overlay-noise" />
      <div className="overlay-scanlines" />
      <div className="overlay-vignette" />

      <Header />

      {/* Main content wrapper */}
      <main className="main-content-flow">
        <Outlet />
        <Footer />
      </main>
    </div>
  );
}
