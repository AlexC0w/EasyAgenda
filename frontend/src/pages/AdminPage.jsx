import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Calendar, Clock, DollarSign, Users } from 'lucide-react';
import api from '../api/client.js';
import SelectField from '../components/SelectField.jsx';
import Alert from '../components/Alert.jsx';

const toDateTime = (fecha, hora) => new Date(`${fecha.split('T')[0]}T${hora}:00`);

const AdminPage = () => {
  const [barberos, setBarberos] = useState([]);
  const [selectedBarbero, setSelectedBarbero] = useState('');
  const [citas, setCitas] = useState([]);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [loading, setLoading] = useState(false);

  const loadCitas = async (barberoId) => {
    try {
      setLoading(true);
      const endpoint = barberoId ? `/citas/${barberoId}` : '/citas';
      const { data } = await api.get(endpoint);
      setCitas(data);
    } catch (error) {
      console.error(error);
      setStatus({ state: 'error', message: 'No se pudieron cargar las citas.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/barberos');
        setBarberos(data);
        await loadCitas('');
      } catch (error) {
        console.error(error);
        setStatus({ state: 'error', message: 'No se pudo cargar la información administrativa.' });
      }
    };
    load();
  }, []);

  useEffect(() => {
    loadCitas(selectedBarbero);
  }, [selectedBarbero]);

  const events = useMemo(
    () =>
      citas.map((cita) => ({
        id: String(cita.id),
        title: `${cita.cliente} · ${cita.servicio.nombre}`,
        start: toDateTime(cita.fecha, cita.hora),
        extendedProps: {
          telefono: cita.telefono,
          estado: cita.estado,
          barbero: cita.barbero.nombre,
          servicio: cita.servicio.nombre,
          precio: cita.servicio.precio,
        },
        
        className:
          cita.estado === 'cancelada'
            ? 'bg-rose-500/30 border border-rose-500/50'
            : 'bg-emerald-500/30 border border-emerald-500/50',
      })),
    [citas]
  );

  const metrics = useMemo(() => {
    const total = citas.length;
    const confirmadas = citas.filter((cita) => cita.estado === 'confirmada').length;
    const ingresos = citas.reduce((acc, cita) => acc + Number(cita.servicio?.precio || 0), 0);
    const duracionPromedio = citas.length
      ? Math.round(
          citas.reduce((acc, cita) => acc + Number(cita.servicio?.duracion || 0), 0) / citas.length
        )
      : 0;
    return { total, confirmadas, ingresos, duracionPromedio };
  }, [citas]);

  const renderEventContent = (eventInfo) => {
    const { event } = eventInfo;
    const estado = event.extendedProps.estado;
    const statusLabel = estado === 'cancelada' ? 'Cancelada' : estado === 'pendiente' ? 'Pendiente' : 'Confirmada';

    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold leading-tight text-slate-50">{event.title}</span>
        <span className="text-[10px] uppercase tracking-wide text-slate-300">{statusLabel}</span>
      </div>
    );
  };

  const eventClassNames = (arg) => {
    const estado = arg.event.extendedProps.estado;
    if (estado === 'cancelada') return ['fc-event-cancelled'];
    if (estado === 'pendiente') return ['fc-event-pending'];
    return ['fc-event-confirmed'];
  };

  const handleEventDrop = async (info) => {
    const { event } = info;
    const newDate = event.start;
    try {
      await api.patch(`/citas/${event.id}`, {
        fecha: newDate.toISOString().split('T')[0],
        hora: newDate.toTimeString().slice(0, 5),
      });
      setStatus({ state: 'success', message: 'Cita reprogramada correctamente.' });
      await loadCitas(selectedBarbero);
    } catch (error) {
      console.error(error);
      setStatus({ state: 'error', message: 'No fue posible mover la cita. Revisa disponibilidad.' });
      info.revert();
    }
  };

  const handleCancel = async (id) => {
    const confirmCancel = window.confirm('¿Deseas cancelar esta cita?');
    if (!confirmCancel) return;
    try {
      await api.patch(`/citas/${id}`, { estado: 'cancelada' });
      setStatus({ state: 'success', message: 'Cita cancelada correctamente.' });
      await loadCitas(selectedBarbero);
    } catch (error) {
      console.error(error);
      setStatus({ state: 'error', message: 'No se pudo cancelar la cita.' });
    }
  };

  const handleEventClick = async (info) => {
    const citaId = info.event.id;
    await handleCancel(citaId);
  };

  const handleReschedule = async (cita) => {
    const currentDate = cita.fecha.split('T')[0];
    const newDate = window.prompt('Nueva fecha (YYYY-MM-DD)', currentDate);
    if (!newDate) return;
    const newTime = window.prompt('Nueva hora (HH:mm)', cita.hora);
    if (!newTime) return;
    try {
      await api.patch(`/citas/${cita.id}`, { fecha: newDate, hora: newTime });
      setStatus({ state: 'success', message: 'Cita reprogramada correctamente.' });
      await loadCitas(selectedBarbero);
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.message || 'No fue posible reprogramar la cita. Revisa la disponibilidad.';
      setStatus({ state: 'error', message });
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl shadow-emerald-500/10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">Agenda Octane</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Panel de administración</h2>
            <p className="mt-2 text-sm text-slate-400">
              Gestiona tu agenda, reprograma citas y mantén el control desde un solo lugar.
            </p>
          </div>
          <div className="flex gap-4">
            <SelectField
              label="Filtrar por barbero"
              placeholder="Todos los barberos"
              options={[
                { value: '', label: 'Todos' },
                ...barberos.map((barbero) => ({ value: String(barbero.id), label: barbero.nombre })),
              ]}
              value={selectedBarbero}
              onChange={setSelectedBarbero}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-100/80">Citas totales</h3>
            <Calendar className="h-5 w-5 text-emerald-200" />
          </div>
          <p className="mt-4 text-3xl font-bold">{metrics.total}</p>
        </div>
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 text-white shadow-lg shadow-emerald-500/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Citas confirmadas</h3>
            <Users className="h-5 w-5 text-emerald-200" />
          </div>
          <p className="mt-4 text-3xl font-bold text-emerald-300">{metrics.confirmadas}</p>
        </div>
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 text-white shadow-lg shadow-emerald-500/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Ingresos estimados</h3>
            <DollarSign className="h-5 w-5 text-emerald-200" />
          </div>
          <p className="mt-4 text-3xl font-bold text-emerald-300">
            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(metrics.ingresos)}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 text-white shadow-lg shadow-emerald-500/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Duración promedio</h3>
            <Clock className="h-5 w-5 text-emerald-200" />
          </div>
          <p className="mt-4 text-3xl font-bold text-emerald-300">{metrics.duracionPromedio} min</p>
        </div>
      </div>

      {status.state !== 'idle' && <Alert type={status.state === 'error' ? 'error' : status.state}>{status.message}</Alert>}

      <div className="space-y-6">
        <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 shadow-xl shadow-emerald-500/10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800/80">
              <thead className="bg-slate-900/80">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Barbero</th>
                  <th className="px-5 py-3">Servicio</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Hora</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Precio</th>
                  <th className="px-5 py-3" aria-label="acciones" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-6 text-center text-slate-400">
                      Cargando citas…
                    </td>
                  </tr>
                ) : citas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-6 text-center text-slate-500">
                      No hay citas registradas.
                    </td>
                  </tr>
                ) : (
                  citas.map((cita) => {
                    const estadoColor =
                      cita.estado === 'cancelada'
                        ? 'bg-rose-500/20 text-rose-300'
                        : cita.estado === 'pendiente'
                        ? 'bg-amber-500/20 text-amber-200'
                        : 'bg-emerald-500/20 text-emerald-200';
                    return (
                      <tr key={cita.id} className="hover:bg-slate-800/40">
                        <td className="px-5 py-4 text-white">{cita.cliente}</td>
                        <td className="px-5 py-4 text-slate-300">{cita.barbero.nombre}</td>
                        <td className="px-5 py-4 text-slate-300">{cita.servicio.nombre}</td>
                        <td className="px-5 py-4 text-slate-300">{cita.fecha.split('T')[0]}</td>
                        <td className="px-5 py-4 text-slate-300">{cita.hora}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${estadoColor}`}>
                            {cita.estado}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-emerald-300">
                          {new Intl.NumberFormat('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                          }).format(Number(cita.servicio.precio))}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleReschedule(cita)}
                              className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-white"
                            >
                              Mover
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancel(cita.id)}
                              className="rounded-full border border-rose-500/60 px-3 py-1 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
                            >
                              Cancelar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-950 p-4 shadow-2xl shadow-emerald-500/10">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            events={events}
            height="auto"
            slotMinTime="08:00:00"
            slotMaxTime="21:00:00"
            eventOverlap={false}
            editable
            droppable
            eventDrop={handleEventDrop}
            eventClick={handleEventClick}
            locale="es"
            locales={[esLocale]}
            nowIndicator
            eventContent={renderEventContent}
            eventClassNames={eventClassNames}
            className="fc-theme-emerald"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
