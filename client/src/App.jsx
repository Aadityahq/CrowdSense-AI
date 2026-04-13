import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';
import { CrowdProvider } from './context/CrowdContext';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CrowdProvider>
          <div className="app-shell">
            <Navbar />
            <AppRoutes />
          </div>
        </CrowdProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
