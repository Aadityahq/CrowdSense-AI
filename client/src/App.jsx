import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { CrowdProvider } from './context/CrowdContext';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <CrowdProvider>
        <div className="app-shell">
          <Navbar />
          <AppRoutes />
        </div>
      </CrowdProvider>
    </BrowserRouter>
  );
}
