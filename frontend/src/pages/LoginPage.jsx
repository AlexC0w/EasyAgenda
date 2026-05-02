import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
      <div
        className="w-full max-w-md rounded-3xl border p-8 shadow-2xl backdrop-blur transition-colors duration-300
          bg-white border-slate-200 shadow-slate-200/50
          dark:bg-slate-900/80 dark:border-slate-800/80 dark:shadow-[#0399FF]/5"
      >
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #0399FF 0%, #2AD1C9 100%)',
              boxShadow: '0 8px 24px rgba(3, 153, 255, 0.3)',
            }}
          >
            <Lock className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Acceso administrativo</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Ingresa con tu cuenta de administrador o colaborador.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Usuario */}
          <div>
            <label htmlFor="username" className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
              Usuario
            </label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3 text-sm transition
                bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400
                focus:border-[#0399FF] focus:outline-none focus:ring-2 focus:ring-[#0399FF]/20
                dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500
                dark:focus:border-[#0399FF] dark:focus:ring-[#0399FF]/20"
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-3 pr-12 text-sm transition
                  bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400
                  focus:border-[#0399FF] focus:outline-none focus:ring-2 focus:ring-[#0399FF]/20
                  dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500
                  dark:focus:border-[#0399FF] dark:focus:ring-[#0399FF]/20"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#0399FF] transition"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg mt-2"
            style={{
              background: 'linear-gradient(135deg, #0399FF 0%, #2AD1C9 100%)',
              boxShadow: '0 8px 24px rgba(3, 153, 255, 0.25)',
            }}
          >
            <LogIn className="h-4 w-4" />
            {submitting ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
