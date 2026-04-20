import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import MapView from './pages/MapView';
import Navigation from './pages/Navigation';
import Alerts from './pages/Alerts';
import Emergency from './pages/Emergency';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import OrganizerDashboard from './pages/OrganizerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/VerifyEmail';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/map"
        element={
          <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'ORGANIZER']}>
            <MapView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/navigation"
        element={
          <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'ORGANIZER']}>
            <Navigation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'ORGANIZER']}>
            <Alerts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emergency"
        element={
          <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'ORGANIZER']}>
            <Emergency />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer"
        element={
          <ProtectedRoute allowedRole="ORGANIZER">
            <OrganizerDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
