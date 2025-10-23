import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import api from '../api/client.js';
import SelectField from '../components/SelectField.jsx';
import Alert from '../components/Alert.jsx';

const toDateTime = (fecha, hora) => new Date(`${fecha.split('T')[0]}T${hora}:00`);

const AdminPage = () => {
  const [barberos, setBarberos] = useState([]);
  const [selectedBarbero, setSelectedBarbero] = useState('');
  const [citas, setCitas] = useState([]);
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const loadCitas = async (barberoId) => {
    try {
      const endpoint = barberoId ? `/citas/${barberoId}` : '/citas';
      const { data } = await api.get(endpoint);
      setCitas(data);
    } catch (error) {
      console.error(error);
      setStatus({ state: 'error', message: 'No se pudieron cargar las citas.' });
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
        },
        className:
          cita.estado === 'cancelada'
            ? 'bg-rose-500/30 border border-rose-500/50'
            : 'bg-emerald-500/30 border border-emerald-500/50',
      })),
    [citas]
  );

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

  const handleEventClick = async (info) => {
    const citaId = info.event.id;
    const confirmCancel = window.confirm('¿Deseas cancelar esta cita?');
    if (!confirmCancel) return;
    try {
      await api.patch(`/citas/${citaId}`, { estado: 'cancelada' });
      setStatus({ state: 'success', message: 'Cita cancelada.' });
      await loadCitas(selectedBarbero);
    } catch (error) {
      console.error(error);
      setStatus({ state: 'error', message: 'No se pudo cancelar la cita.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-emerald-500/5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-emerald-300">Panel administrativo</h2>
          <p className="text-sm text-slate-400">Arrastra eventos para reprogramar o haz clic para cancelar.</p>
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

      {status.state !== 'idle' && <Alert type={status.state === 'error' ? 'error' : status.state}>{status.message}</Alert>}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-emerald-500/5">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
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
        />
      </div>
    </div>
  );
};

export default AdminPage;
