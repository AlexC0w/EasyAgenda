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
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

import Navbar from './components/Navbar.jsx';
import { useEffect, useState } from 'react';
import api from './api/client.js';

const AppShell = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [businessName, setBusinessName] = useState('Agenda Octane');
  const [businessGiro, setBusinessGiro] = useState('Barber Studio');
  
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
                        !location.pathname.startsWith('/admin');

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
        setBusinessName('Agenda Octane');
        setBusinessGiro('Plataforma de Reservas');
      }
    };
    fetchBusinessName();
  }, [slug, isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <Navbar 
        businessName={businessName} 
        businessGiro={businessGiro} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />
      <main className="mx-auto max-w-6xl px-4 py-10">
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
