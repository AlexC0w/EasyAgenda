import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Completa usuario y contraseña');
      return;
    }
    setSubmitting(true);
    try {
      await login(form);
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
      toast.success('Bienvenido de nuevo');
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Credenciales inválidas';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-300 bg-white p-8 shadow-2xl shadow-emerald-500/10 dark:border-slate-800/80 dark:bg-slate-900/80">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/60 to-emerald-600/90 text-2xl">
          <Lock className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Acceso administrativo</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Ingresa con tu cuenta de administrador o colaborador.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-400">
            Usuario
          </label>
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
            placeholder="admin"
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-400">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:from-emerald-500 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-emerald-500/20"
        >
          <LogIn className="h-4 w-4" />
          {submitting ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
