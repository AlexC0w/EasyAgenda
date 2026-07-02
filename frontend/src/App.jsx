import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BookingPage from './pages/BookingPage.jsx';
import SuspendedPage from './pages/SuspendedPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import SuperAdminPage from './pages/SuperAdminPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

import Navbar from './components/Navbar.jsx';
import { useEffect, useState } from 'react';
// App.jsx — Octane EasyAgenda shell
import api from './api/client.js';

const AppShell = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [businessName, setBusinessName] = useState('Octane');
  const [businessGiro, setBusinessGiro] = useState('Technology Solutions');
  
  // Octane DS is always dark — force dark class once
  useEffect(() => {
    window.document.documentElement.classList.add('dark');
  }, []);

  // Check if we are in a booking flow (dynamic slug) or admin/auth flow
  const isBookingPage = location.pathname !== '/' &&
                        location.pathname !== '/login' &&
                        location.pathname !== '/register' &&
                        !location.pathname.startsWith('/admin') &&
                        !location.pathname.startsWith('/superadmin');

  // Extract slug from path if in booking page
  const slug = isBookingPage ? location.pathname.split('/')[1] : null;

  useEffect(() => {
    const fetchBusinessName = async () => {
      if (slug) {
        try {
          const { data } = await api.get(`/public/business/${slug}`);
          setBusinessName(data.name);
          setBusinessGiro(data.giro || 'Technology Solutions');
        } catch (e) {
          console.error('Error fetching business info', e);
        }
      } else if (isAuthenticated && user?.businessId) {
        // If logged in (admin), fetch own business name
        try {
          const { data } = await api.get('/business');
          const nameSetting = data.find(s => s.key === 'businessName');
          if (nameSetting) setBusinessName(nameSetting.value);
          setBusinessGiro(user.businessGiro || 'Technology Solutions');
        } catch (e) {
          console.error('Error fetching business name', e);
        }
      } else {
        setBusinessName('Octane');
        setBusinessGiro('Technology Solutions');
      }
    };
    fetchBusinessName();
  }, [slug, isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSuperAdminRoute = location.pathname.startsWith('/superadmin');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
      {!isSuperAdminRoute && <Navbar />}
      {/* Ambient violet glow */}
      <div className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'radial-gradient(60% 40% at 50% 0%, rgba(162,75,255,0.1), transparent 65%)' }}
      />
      <main className={isSuperAdminRoute ? '' : 'mx-auto w-full max-w-7xl px-4 py-8'}>
        <Routes>
          <Route path="/" element={<Navigate to="/octane" replace />} />
          <Route path="/suspended" element={<SuspendedPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/confirmar-cita/:id" element={<ConfirmationPage />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={['ADMIN', 'BARBER']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/*"
            element={
              <ProtectedRoute roles={['SUPERADMIN']}>
                <SuperAdminPage />
              </ProtectedRoute>
            }
          />
          {/* Dynamic route for booking pages e.g. /barberia-centro */}
          <Route path="/:slug" element={<BookingPage />} />
        </Routes>
      </main>
      <ToastContainer position="top-right" theme="dark" closeOnClick pauseOnFocusLoss={false} />
    </div>
  );
};

const App = () => <AppShell />;

export default App;
