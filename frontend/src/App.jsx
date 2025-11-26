import { NavLink, Route, Routes, useNavigate, useLocation, useParams } from 'react-router-dom';
import { LogOut, Menu, Shield, Calendar, Sun, Moon } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BookingPage from './pages/BookingPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

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
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/60 dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur transition-colors duration-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 md:h-12 md:w-12 md:rounded-2xl">
                <Calendar className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white md:text-2xl">{businessName}</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300/80 md:text-xs md:tracking-[0.3em]">{businessGiro}</p>
              </div>
            </div>
          </div>
          
          <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 md:justify-end md:gap-3 md:text-sm">
            {!isBookingPage && (
                <NavLink
                to="/"
                className={({ isActive }) =>
                    `flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition ${
                    isActive
                        ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                        : 'hover:border-slate-300 hover:bg-slate-100 hover:text-emerald-600 dark:hover:border-slate-700 dark:hover:bg-slate-800/60 dark:hover:text-emerald-200'
                    }`
                }
                end
                >
                Inicio
                </NavLink>
            )}
            
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition ${
                  isActive
                    ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                    : 'hover:border-slate-300 hover:bg-slate-100 hover:text-emerald-600 dark:hover:border-slate-700 dark:hover:bg-slate-800/60 dark:hover:text-emerald-200'
                }`
              }
            >
              <Shield className="h-4 w-4" />
              Administración
            </NavLink>

            {isAuthenticated && (
               <a
                 href={`/${user?.businessSlug || 'demo'}`} 
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 text-emerald-600 dark:text-emerald-300 transition hover:bg-emerald-500/20"
               >
                 <Calendar className="h-4 w-4" />
                 Ver mi Agenda
               </a>
            )}

            <button
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-emerald-400 hover:text-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-emerald-400"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs uppercase tracking-widest text-slate-600 transition hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-600 dark:border-slate-700/80 dark:text-slate-300 dark:hover:text-emerald-200"
              >
                <LogOut className="h-4 w-4" />
                {user?.username}
              </button>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition ${
                    isActive
                      ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                      : 'hover:border-slate-300 hover:bg-slate-100 hover:text-emerald-600 dark:hover:border-slate-700 dark:hover:bg-slate-800/60 dark:hover:text-emerald-200'
                  }`
                }
              >
                Ingresar
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
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
