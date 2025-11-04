import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext({});
const STORAGE_KEY = 'agenda_octane_token';

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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <span className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-400" />
          <p className="text-sm text-slate-400">Inicializando seguridad...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
