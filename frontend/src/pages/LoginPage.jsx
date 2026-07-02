import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.username || !form.password) {
      toast.error(t('login.errorFields'));
      return;
    }
    setSubmitting(true);
    try {
      const loggedUser = await login(form);
      if (loggedUser?.role === 'SUPERADMIN') {
        navigate('/superadmin', { replace: true });
      } else {
        const from = location.state?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      }
      toast.success(t('login.successLogin'));
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || t('login.errorInvalid');
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 74px)', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--void)', position: 'relative', overflow: 'hidden' }}>
      <div className="oct-orb" style={{ width: 400, height: 400, background: '#7724c4', top: -100, left: -100, opacity: 0.3 }} />
      <div className="oct-orb" style={{ width: 300, height: 300, background: '#a24bff', bottom: -80, right: -80, opacity: 0.2 }} />
      <div className="oct-hexgrid" style={{ opacity: 0.35 }} />

      <div className="oct-card oct-card--glass" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1, padding: 40 }}>
        {/* Header */}
        <div style={{ marginBottom: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
          <span className="oct-hexicon oct-hexicon--neon" style={{ width: 64, height: 70 }}>
            <span className="oct-hexicon__inner" style={{ width: 64, height: 64 }}>
              <Lock strokeWidth={1.8} />
            </span>
          </span>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text)', margin: '0 0 6px' }}>{t('login.title')}</h2>
            <p style={{ color: 'var(--text-mute)', fontSize: '0.875rem', margin: 0 }}>{t('login.subtitle')}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="oct-field">
            <label className="oct-field__label" htmlFor="username">{t('login.username')}</label>
            <div className="oct-inputwrap">
              <input
                id="username" name="username" value={form.username} onChange={handleChange}
                className="oct-input" placeholder="admin" autoComplete="username"
              />
            </div>
          </div>

          <div className="oct-field">
            <label className="oct-field__label" htmlFor="password">{t('login.password')}</label>
            <div className="oct-inputwrap" style={{ position: 'relative' }}>
              <input
                id="password" name="password" type={showPassword ? 'text' : 'password'}
                value={form.password} onChange={handleChange}
                className="oct-input" placeholder="••••••••" autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button" onClick={() => setShowPassword((p) => !p)} tabIndex={-1}
                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', display: 'flex', padding: 4 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={submitting}
            className="oct-btn oct-btn--primary oct-btn--lg oct-btn--block"
            style={{ marginTop: 4 }}
          >
            <LogIn size={18} />
            {submitting ? t('login.submitting') : t('login.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
