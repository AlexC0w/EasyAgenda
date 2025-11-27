import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, X, Calendar, Clock, User, Scissors, AlertTriangle } from 'lucide-react';
import api from '../api/client.js';

const ConfirmationPage = () => {
  const { id } = useParams();
  const [status, setStatus] = useState('loading'); // loading, ready, success, error, cancelled
  const [message, setMessage] = useState('Cargando detalles de la cita...');
  const [cita, setCita] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchCita = async () => {
      try {
        const { data } = await api.get(`/citas/${id}/public`);
        setCita(data);
        if (data.estado === 'confirmada') {
            setStatus('success');
            setMessage('Esta cita ya ha sido confirmada.');
        } else if (data.estado === 'cancelada') {
            setStatus('cancelled');
            setMessage('Esta cita ya ha sido cancelada.');
        } else {
            setStatus('ready');
            setMessage('Por favor revisa los detalles y confirma o cancela la cita.');
        }
      } catch (error) {
        console.error(error);
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'No pudimos encontrar la cita. Es posible que el enlace sea inválido.'
        );
      }
    };

    if (id) {
      fetchCita();
    }
  }, [id]);

  const handleConfirm = async () => {
    if (!window.confirm('¿Estás seguro de confirmar esta cita? Se enviará un mensaje al cliente.')) return;
    
    setActionLoading(true);
    try {
        const { data } = await api.post(`/citas/${id}/confirm`);
        setCita(data.cita);
        setStatus('success');
        setMessage('¡Cita confirmada exitosamente!');
    } catch (error) {
        console.error(error);
        alert('Error al confirmar la cita');
    } finally {
        setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('¿Estás seguro de CANCELAR esta cita? Se enviará un mensaje al cliente.')) return;

    setActionLoading(true);
    try {
        const { data } = await api.post(`/citas/${id}/cancel`);
        setCita(data.cita);
        setStatus('cancelled');
        setMessage('La cita ha sido cancelada.');
    } catch (error) {
        console.error(error);
        alert('Error al cancelar la cita');
    } finally {
        setActionLoading(false);
    }
  };

  if (status === 'loading') {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
            <div className="text-center">
                <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
                <h2 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">Cargando...</h2>
            </div>
        </div>
      );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-xl shadow-emerald-500/5 dark:bg-slate-900">
        
        {/* Header Status Icon */}
        <div className="text-center">
            {status === 'success' && (
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <Check className="h-10 w-10" />
                </div>
            )}
            {status === 'cancelled' && (
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                    <X className="h-10 w-10" />
                </div>
            )}
            {status === 'ready' && (
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                    <AlertTriangle className="h-10 w-10" />
                </div>
            )}
            {status === 'error' && (
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    <X className="h-10 w-10" />
                </div>
            )}

            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
                {status === 'success' ? 'Cita Confirmada' : 
                 status === 'cancelled' ? 'Cita Cancelada' : 
                 status === 'error' ? 'Error' : 'Gestionar Cita'}
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{message}</p>
        </div>

        {/* Appointment Details */}
        {cita && (
            <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-left dark:border-slate-800 dark:bg-slate-800/50">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-emerald-500" />
                <div>
                    <p className="text-xs font-medium uppercase text-slate-500">Cliente</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{cita.cliente}</p>
                    <p className="text-sm text-slate-500">Tel: {cita.telefono}</p>
                </div>
                </div>
                <div className="flex items-start gap-3">
                <Scissors className="mt-1 h-5 w-5 text-emerald-500" />
                <div className="w-full">
                    <p className="text-xs font-medium uppercase text-slate-500">Servicios</p>
                    {cita.servicios && cita.servicios.length > 0 ? (
                        <ul className="mt-1 space-y-1">
                            {cita.servicios.map((item) => (
                                <li key={item.id} className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-900 dark:text-white">{item.servicio.nombre}</span>
                                    <span className="text-slate-500">{item.servicio.duracion} min</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="font-semibold text-slate-900 dark:text-white">{cita.servicio?.nombre}</p>
                    )}
                    <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold dark:border-slate-700">
                        <span className="text-slate-900 dark:text-white">Duración Total</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                            {cita.duracionTotal || cita.servicio?.duracion} min
                        </span>
                    </div>
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
                    <p className="text-xs font-medium uppercase text-slate-500">Horario</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                        {cita.hora} - {(() => {
                            const [hours, minutes] = cita.hora.split(':').map(Number);
                            const totalMinutes = hours * 60 + minutes + (cita.duracionTotal || cita.servicio?.duracion || 30);
                            const endHours = Math.floor(totalMinutes / 60);
                            const endMinutes = totalMinutes % 60;
                            return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
                        })()}
                    </p>
                </div>
                </div>
            </div>
            </div>
        )}

        {/* Actions */}
        {status === 'ready' && (
            <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-100 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                >
                    <X className="h-4 w-4" />
                    Cancelar
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={actionLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                    <Check className="h-4 w-4" />
                    Confirmar
                </button>
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
