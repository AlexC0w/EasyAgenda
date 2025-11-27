import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, X, Calendar, Clock, User, Scissors } from 'lucide-react';
import api from '../api/client.js';

const ConfirmationPage = () => {
  const { id } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verificando tu cita...');
  const [cita, setCita] = useState(null);

  useEffect(() => {
    const confirmCita = async () => {
      try {
        const { data } = await api.post(`/citas/${id}/confirm`);
        setStatus('success');
        setMessage('¡Tu cita ha sido confirmada exitosamente!');
        setCita(data.cita);
      } catch (error) {
        console.error(error);
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'No pudimos confirmar tu cita. Es posible que el enlace haya expirado o sea inválido.'
        );
      }
    };

    if (id) {
      confirmCita();
    }
  }, [id]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-xl shadow-emerald-500/5 dark:bg-slate-900">
        
        {status === 'loading' && (
          <div className="text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
            <h2 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">Confirmando...</h2>
            <p className="mt-2 text-slate-500">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Check className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">¡Confirmada!</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{message}</p>

            {cita && (
              <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-left dark:border-slate-800 dark:bg-slate-800/50">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-500">Profesional</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{cita.barbero?.nombre}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Scissors className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-500">Servicio</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{cita.servicio?.nombre}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-500">Fecha</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {new Date(cita.fecha).toLocaleDateString('es-MX', { dateStyle: 'long' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-500">Hora</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{cita.hora}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
              <X className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">Error</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{message}</p>
          </div>
        )}

        <div className="pt-4">
            <Link 
                to={cita?.business?.slug ? `/${cita.business.slug}` : '/'}
                className="block w-full rounded-xl bg-slate-900 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
                Volver a la Agenda
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
