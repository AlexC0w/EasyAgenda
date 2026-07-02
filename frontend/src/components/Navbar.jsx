import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Languages } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';

const Navbar = ({ businessGiro }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const adminPath = user?.role === 'SUPERADMIN' ? '/superadmin' : '/admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const toggleLanguage = () => {
    const next = i18n.language.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(next);
  };
  const langLabel = i18n.language.startsWith('es') ? 'EN' : 'ES';

  // Tagline bilingüe
  const tagline = i18n.language.startsWith('es')
    ? 'Soluciones Informáticas'
    : 'Informatic Solutions';

  const navStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    transition: 'all 240ms cubic-bezier(0.22, 1, 0.36, 1)',
    ...(scrolled ? {
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      background: 'rgba(6, 3, 18, 0.88)',
      borderBottom: '1px solid var(--line)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
    } : {
      background: 'transparent',
      borderBottom: '1px solid transparent',
    }),
  };

  const linkHover = (e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(162,75,255,0.1)'; };
  const linkLeave = (e) => { e.currentTarget.style.color = 'var(--text-soft)'; e.currentTarget.style.background = 'transparent'; };

  return (
    <header style={navStyle}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', gap: 20, height: scrolled ? 62 : 74, transition: 'height 240ms' }}>

        {/* Logo */}
        <a href="/octane" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
          <img
            src="/octane-mark-white.png"
            alt="Octane"
            style={{ height: 40, width: 40, objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(162,75,255,0.55))' }}
          />
          <div style={{ borderLeft: '1px solid var(--line)', paddingLeft: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.15 }}>Octane</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--violet-400)', lineHeight: 1.3 }}>{tagline}</div>
          </div>
        </a>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }} className="hidden md:flex">

          {/* Language toggle — siempre visible */}
          <button
            onClick={toggleLanguage}
            title={langLabel === 'EN' ? 'Switch to English' : 'Cambiar a Español'}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-mute)', padding: '8px 12px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', transition: 'all 140ms' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--violet-400)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--text-mute)'; }}
          >
            <Languages size={14} />
            {langLabel}
          </button>

          {/* Solo visible si está autenticado */}
          {isAuthenticated && (
            <>
              <NavLink
                to={adminPath}
                style={({ isActive }) => ({
                  fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 600,
                  color: isActive ? '#fff' : 'var(--text-soft)',
                  textDecoration: 'none', padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'rgba(162,75,255,0.15)' : 'transparent',
                  display: 'flex', alignItems: 'center', gap: 6, transition: 'all 140ms',
                })}
                onMouseEnter={linkHover} onMouseLeave={linkLeave}
              >
                Panel
              </NavLink>
              <button
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--danger)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,84,112,0.08)', border: '1px solid rgba(255,84,112,0.25)', cursor: 'pointer', transition: 'all 140ms' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,84,112,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,84,112,0.08)'; }}
              >
                <LogOut size={15} />
                {user?.username}
              </button>
            </>
          )}
        </nav>

        {/* Mobile burger */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 8, color: 'var(--text-soft)', cursor: 'pointer' }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: 'rgba(6,3,18,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--line)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingTop: 4 }}>
            <button onClick={toggleLanguage} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-mute)', padding: '8px 12px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer' }}>
              <Languages size={13} />{langLabel}
            </button>
            {isAuthenticated && (
              <>
                <NavLink to={adminPath} onClick={() => setMobileOpen(false)}
                  style={({ isActive }) => ({ color: isActive ? '#fff' : 'var(--text-soft)', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: isActive ? 'rgba(162,75,255,0.12)' : 'transparent' })}
                >Panel</NavLink>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--danger)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,84,112,0.08)', border: '1px solid rgba(255,84,112,0.2)', cursor: 'pointer', marginLeft: 'auto' }}>
                  <LogOut size={15} />{user?.username}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
