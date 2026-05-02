import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext({});
const STORAGE_KEY = 'agenda_shessai_token';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      delete api.defaults.headers.common.Authorization;
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      if (user) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error) {
        console.error(error);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, user]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', credentials);
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      localStorage.setItem(STORAGE_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      loading,
      isAuthenticated: Boolean(user),
      hasRole: (roles = []) => (roles.length ? roles.includes(user?.role) : true),
    }),
    [user, token, loading]
  );

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          background:
            'radial-gradient(ellipse 80rem 50rem at top, rgba(3,153,255,0.08), transparent 60%), radial-gradient(ellipse 60rem 40rem at 80% 90%, rgba(42,209,201,0.06), transparent 55%), #0B0F1A',
        }}
      >
        <div className="flex flex-col items-center gap-5">
          {/* Logo mark */}
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #0399FF 0%, #2AD1C9 100%)',
              boxShadow: '0 8px 32px rgba(3, 153, 255, 0.35)',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>

          {/* Spinner */}
          <span
            className="h-10 w-10 animate-spin rounded-full border-[3px]"
            style={{
              borderColor: 'rgba(3,153,255,0.15)',
              borderTopColor: '#0399FF',
            }}
          />

          <p
            className="text-sm font-medium tracking-wide"
            style={{ color: '#2AD1C9' }}
          >
            Inicializando seguridad...
          </p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
