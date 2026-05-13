import { BrowserRouter } from 'react-router-dom';
import SmoothScroll from './components/layout/SmoothScroll';
import AppRoutes from './routes';
import Header from './components/layout/Header';

function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <div className="min-h-screen bg-[#0a0a0a] text-white">
          <Header />
          <main className="pt-16">
            <AppRoutes />
          </main>
        </div>
      </SmoothScroll>
    </BrowserRouter>
  );
}

export default App;
