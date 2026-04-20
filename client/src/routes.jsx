import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const MapView = lazy(() => import('./pages/MapView'));
const Navigation = lazy(() => import('./pages/Navigation'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Emergency = lazy(() => import('./pages/Emergency'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Login = lazy(() => import('./pages/Login'));
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));

function RouteFallback() {
  return (
    <main className="page">
      <section className="panel loading-panel">
        <h2>Loading view...</h2>
        <p>Preparing the requested screen.</p>
      </section>
    </main>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
  );
}
