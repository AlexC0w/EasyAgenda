import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/client.js';
import { Store, User, Lock, Phone, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    slug: '',
    username: '',
    password: '',
    telefono: '',
    giro: '',
  });
  const [giros, setGiros] = useState([]);
  const [showCustomGiro, setShowCustomGiro] = useState(false);

  useEffect(() => {
    const fetchGiros = async () => {
      try {
        console.log('Fetching giros...');
        const { data } = await api.get('/business/giros');
        console.log('Giros fetched:', data);
        if (Array.isArray(data)) {
            setGiros(data);
        } else {
            console.error('Giros data is not an array:', data);
            setGiros([]);
        }
      } catch (error) {
        console.error('Error fetching giros:', error);
        setGiros([]);
      }
    };
    fetchGiros();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'giro') {
      if (value === 'Otro') {
        setShowCustomGiro(true);
        setFormData(prev => ({ ...prev, giro: '' }));
      } else {
        setShowCustomGiro(false);
        setFormData(prev => ({ ...prev, giro: value }));
      }
      return;
    }

    // Auto-generate slug from business name if slug is not manually edited yet (simple UX)
    if (name === 'businessName' && !formData.slug) {
        const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setFormData(prev => ({ ...prev, [name]: value, slug }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };
      if (showCustomGiro && !payload.giro) {
         // If custom giro is empty, it will fail validation or default to Barbería in backend if we don't catch it.
         // But HTML required attribute on the custom input should handle it.
      }

      const { data } = await api.post('/auth/register-business', payload);
      localStorage.setItem('agenda_octane_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Force reload to ensure AuthContext picks up the new token if it doesn't listen to storage events
      window.location.href = '/admin';
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Error al registrar el negocio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-400 to-emerald-600 text-3xl">
            🚀
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Crea tu cuenta</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Comienza a gestionar tu negocio en minutos
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nombre del Negocio
              </label>
              <div className="relative mt-1">
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500"
                  placeholder="Barbería Elite"
                />
                <Store className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
            </div>

            <div>
              <label htmlFor="giro" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Giro del Negocio
              </label>
              <div className="relative mt-1">
                <select
                  id="giro"
                  name="giro"
                  required={!showCustomGiro}
                  onChange={handleChange}
                  className="block w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500"
                  defaultValue=""
                >
                  <option value="" disabled>Selecciona una opción</option>
                  {Array.isArray(giros) && giros.map((g) => (
                    <option key={g} value={g} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">{g}</option>
                  ))}
                  <option value="Otro" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Otro (Especificar)</option>
                </select>
                <Store className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
            </div>

            {showCustomGiro && (
              <div>
                <label htmlFor="customGiro" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Especificar Giro
                </label>
                <div className="relative mt-1">
                  <input
                    id="customGiro"
                    name="giro"
                    type="text"
                    required
                    value={formData.giro}
                    onChange={(e) => setFormData(prev => ({ ...prev, giro: e.target.value }))}
                    className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500"
                    placeholder="Ej. Spa, Taller, Consultorio..."
                  />
                  <Store className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                URL Personalizada
              </label>
              <div className="relative mt-1 flex rounded-xl shadow-sm">
                <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 px-3 text-slate-500 sm:text-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500">
                  agenda.com/
                </span>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  value={formData.slug}
                  onChange={handleChange}
                  className="block w-full min-w-0 flex-1 rounded-none rounded-r-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500"
                  placeholder="barberia-elite"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Usuario Administrador
              </label>
              <div className="relative mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500"
                  placeholder="admin"
                />
                <User className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Teléfono (WhatsApp)
              </label>
              <div className="relative mt-1">
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500"
                  placeholder="+52 123 456 7890"
                />
                <Phone className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Contraseña
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500"
                  placeholder="••••••••"
                />
                <Lock className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Creando cuenta...' : 'Registrar Negocio'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>

          <div className="text-center text-sm">
            <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
