import { NavLink, Route, Routes, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BookingPage from './pages/BookingPage.jsx';
import SuspendedPage from './pages/SuspendedPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import SuperAdminPage from './pages/SuperAdminPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

import Navbar from './components/Navbar.jsx';
import { useEffect, useState } from 'react';
import api from './api/client.js';

const AppShell = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [businessName, setBusinessName] = useState('Agenda Shessai');
  const [businessGiro, setBusinessGiro] = useState('Plataforma de Reservas');
  
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
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
          setBusinessGiro(data.giro || 'Barber Studio');
        } catch (e) {
          console.error('Error fetching business info', e);
        }
      } else if (isAuthenticated && user?.businessId) {
        // If logged in (admin), fetch own business name
        try {
          const { data } = await api.get('/business');
          const nameSetting = data.find(s => s.key === 'businessName');
          if (nameSetting) setBusinessName(nameSetting.value);
          setBusinessGiro(user.businessGiro || 'Barber Studio');
        } catch (e) {
          console.error('Error fetching business name', e);
        }
      } else {
        setBusinessName('Agenda Shessai');
        setBusinessGiro('Plataforma de Reservas');
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {!isSuperAdminRoute && (
        <Navbar
          businessName={businessName}
          businessGiro={businessGiro}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
      {/* Dark mode glow overlay */}
      <div className="pointer-events-none fixed inset-0 -z-10 hidden dark:block"
        style={{
          background: 'radial-gradient(ellipse 80rem 50rem at top, rgba(3,153,255,0.07), transparent 60%), radial-gradient(ellipse 60rem 40rem at 80% 90%, rgba(42,209,201,0.05), transparent 55%)'
        }}
      />
      <main className={isSuperAdminRoute ? '' : 'mx-auto w-full max-w-7xl px-4 py-8'}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
