import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Shield, Calendar, Sun, Moon, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = ({ businessName, businessGiro, theme, toggleTheme }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if we are in a booking flow (dynamic slug) or admin/auth flow
  const isBookingPage = location.pathname !== '/' && 
                        location.pathname !== '/login' && 
                        location.pathname !== '/register' && 
                        !location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/60 dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Logo & Title Section */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 md:h-12 md:w-12 md:rounded-2xl">
            <Calendar className="h-6 w-6 md:h-7 md:w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white md:text-2xl">{businessName}</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300/80 md:text-xs md:tracking-[0.3em]">{businessGiro}</p>
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

            {/* Mobile Menu Button */}
            <button
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2">
            {!isBookingPage && (
                <NavLink
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-4 py-3 transition ${
                    isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold'
                        : 'hover:bg-slate-100 text-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                }
                end
                >
                Inicio
                </NavLink>
            )}
            
            <NavLink
            to="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-4 py-3 transition ${
                isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold'
                    : 'hover:bg-slate-100 text-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
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
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/10 transition"
            >
                <Calendar className="h-5 w-5" />
                Ver mi Agenda
            </a>
            )}

            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Tema</span>
                <button
                onClick={toggleTheme}
                className="flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-emerald-400 hover:text-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-emerald-400"
                >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
            </div>

            {isAuthenticated ? (
            <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 rounded-lg px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition mt-2"
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
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold'
                    : 'hover:bg-slate-100 text-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
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
