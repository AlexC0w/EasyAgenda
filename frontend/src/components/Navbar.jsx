import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Shield, Calendar, Sun, Moon, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = ({ businessName, businessGiro, theme, toggleTheme }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isBookingPage = location.pathname !== '/' &&
                        location.pathname !== '/login' &&
                        location.pathname !== '/register' &&
                        !location.pathname.startsWith('/admin') &&
                        !location.pathname.startsWith('/superadmin');

  const adminPath = user?.role === 'SUPERADMIN' ? '/superadmin' : '/admin';

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const activeClass = 'border-[#0399FF]/60 bg-[#0399FF]/10 text-[#0399FF] dark:text-[#2AD1C9]';
  const inactiveClass = 'text-slate-600 dark:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-[#0399FF] dark:hover:text-[#2AD1C9]';

  return (
    <header className="sticky top-0 z-40 border-b border-[#0399FF]/10 bg-white/80 dark:border-[#0399FF]/10 backdrop-blur transition-colors duration-300 dark:[background:rgba(11,15,26,0.85)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg md:h-12 md:w-12 md:rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #0399FF 0%, #2AD1C9 100%)',
              boxShadow: '0 4px 20px rgba(3, 153, 255, 0.3)',
            }}
          >
            <Calendar className="h-6 w-6 md:h-7 md:w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white md:text-2xl">{businessName}</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] md:text-xs md:tracking-[0.3em]" style={{ color: '#2AD1C9' }}>
              {businessGiro}
            </p>
          </div>
        </div>

        {/* Desktop Nav & Mobile Toggle */}
        <div className="flex items-center gap-2">
          {/* Desktop Nav */}
          <nav className="hidden md:flex md:items-center md:justify-end md:gap-3 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            {!isBookingPage && (
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition ${isActive ? activeClass : inactiveClass}`
                }
                end
              >
                Inicio
              </NavLink>
            )}

            <NavLink
              to={adminPath}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition ${isActive ? activeClass : inactiveClass}`
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
                className="flex items-center gap-2 rounded-full border px-4 py-2 transition hover:opacity-90"
                style={{
                  borderColor: 'rgba(3, 153, 255, 0.4)',
                  background: 'rgba(3, 153, 255, 0.1)',
                  color: '#2AD1C9',
                }}
              >
                <Calendar className="h-4 w-4" />
                Ver mi Agenda
              </a>
            )}

            <button
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-full border p-2 text-slate-400 transition dark:border-slate-700 dark:bg-slate-800/60"
              style={{ borderColor: 'rgba(3,153,255,0.2)' }}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full border border-slate-700/80 px-4 py-2 text-xs uppercase tracking-widest text-slate-300 transition hover:border-[#0399FF]/60 hover:bg-[#0399FF]/10 hover:text-[#2AD1C9]"
              >
                <LogOut className="h-4 w-4" />
                {user?.username}
              </button>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition ${isActive ? activeClass : inactiveClass}`
                }
              >
                Ingresar
              </NavLink>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-[#0399FF]/10 bg-white dark:bg-[#0B0F1A] px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          {!isBookingPage && (
            <NavLink
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-4 py-3 transition ${
                  isActive
                    ? 'bg-[#0399FF]/10 text-[#2AD1C9] font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
              end
            >
              Inicio
            </NavLink>
          )}

          <NavLink
            to={adminPath}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-4 py-3 transition ${
                isActive
                  ? 'bg-[#0399FF]/10 text-[#2AD1C9] font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Shield className="h-5 w-5" />
            Administración
          </NavLink>

          {isAuthenticated && (
            <a
              href={`/${user?.businessSlug || 'demo'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-4 py-3 transition hover:bg-[#0399FF]/10"
              style={{ color: '#2AD1C9' }}
            >
              <Calendar className="h-5 w-5" />
              Ver mi Agenda
            </a>
          )}

          <div className="flex items-center justify-between px-4 py-2 border-t mt-2 pt-4" style={{ borderColor: 'rgba(3,153,255,0.1)' }}>
            <span className="text-sm text-slate-500">Tema</span>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-full border p-2 text-slate-400 transition"
              style={{ borderColor: 'rgba(3,153,255,0.2)', background: 'rgba(3,153,255,0.05)' }}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 rounded-lg px-4 py-3 text-red-400 hover:bg-red-900/20 transition mt-2"
            >
              <LogOut className="h-5 w-5" />
              Cerrar Sesión ({user?.username})
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-4 py-3 transition ${
                  isActive
                    ? 'bg-[#0399FF]/10 text-[#2AD1C9] font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              Ingresar
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
