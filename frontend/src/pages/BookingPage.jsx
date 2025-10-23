import { useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';
import SelectField from '../components/SelectField.jsx';
import WeeklySchedule from '../components/WeeklySchedule.jsx';
import Alert from '../components/Alert.jsx';

const todayISO = () => new Date().toISOString().split('T')[0];

const getWeekDays = (anchorDate) => {
  const date = new Date(`${anchorDate}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday as first day
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);

  return Array.from({ length: 7 }).map((_, index) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + index);
    const iso = current.toISOString().split('T')[0];
    return {
      date: iso,
      label: current.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
      }),
    };
  });
};

const BookingPage = () => {
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [selectedBarbero, setSelectedBarbero] = useState('');
  const [selectedServicio, setSelectedServicio] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [selectedTime, setSelectedTime] = useState('');
  const [availability, setAvailability] = useState([]);
  const [weekAvailability, setWeekAvailability] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [barberosRes, serviciosRes] = await Promise.all([
          api.get('/barberos'),
          api.get('/servicios'),
        ]);
        setBarberos(barberosRes.data);
        setServicios(serviciosRes.data);
        if (barberosRes.data.length) {
          setSelectedBarbero(String(barberosRes.data[0].id));
        }
        if (serviciosRes.data.length) {
          setSelectedServicio(String(serviciosRes.data[0].id));
        }
      } catch (error) {
        console.error(error);
        setStatus({ state: 'error', message: 'No se pudieron cargar los datos iniciales.' });
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedBarbero || !selectedDate) return;
      try {
        const response = await api.get(`/disponibles/${selectedBarbero}`, {
          params: { fecha: selectedDate },
        });
        setAvailability(response.data.disponibilidad);
      } catch (error) {
        console.error(error);
        setAvailability([]);
      }
    };
    loadAvailability();
  }, [selectedBarbero, selectedDate]);

  useEffect(() => {
    const loadWeek = async () => {
      if (!selectedBarbero) return;
      const weekDays = getWeekDays(selectedDate);
      const entries = await Promise.all(
        weekDays.map(async ({ date }) => {
          try {
            const { data } = await api.get(`/disponibles/${selectedBarbero}`, {
              params: { fecha: date },
            });
            return [date, data.disponibilidad];
          } catch (error) {
            console.error(error);
            return [date, []];
          }
        })
      );
      setWeekAvailability(Object.fromEntries(entries));
    };
    loadWeek();
  }, [selectedBarbero, selectedDate]);

  useEffect(() => {
    setSelectedTime('');
  }, [selectedDate, selectedBarbero]);

  const week = useMemo(() => {
    const days = getWeekDays(selectedDate);
    return days.map((day) => ({
      ...day,
      availability: weekAvailability[day.date] || [],
    }));
  }, [selectedDate, weekAvailability]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedBarbero || !selectedServicio || !selectedDate || !selectedTime) {
      setStatus({ state: 'error', message: 'Completa todos los campos antes de reservar.' });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = {
      barberoId: Number(selectedBarbero),
      servicioId: Number(selectedServicio),
      cliente: formData.get('cliente'),
      telefono: formData.get('telefono'),
      fecha: selectedDate,
      hora: selectedTime,
    };

    setLoading(true);
    setStatus({ state: 'info', message: 'Registrando la cita...' });
    try {
      await api.post('/citas', payload);
      setStatus({ state: 'success', message: '¡Cita reservada con éxito! Recibirás un WhatsApp de confirmación.' });
      event.currentTarget.reset();
      setSelectedTime('');
      const { data } = await api.get(`/disponibles/${selectedBarbero}`, {
        params: { fecha: selectedDate },
      });
      setAvailability(data.disponibilidad);
      setWeekAvailability((prev) => ({
        ...prev,
        [selectedDate]: data.disponibilidad,
      }));
    } catch (error) {
      const message =
        error.response?.data?.message || 'No se pudo registrar la cita. Verifica los datos e intenta nuevamente.';
      setStatus({ state: 'error', message });
      if (error.response?.data?.disponibilidad) {
        setAvailability(error.response.data.disponibilidad);
        setWeekAvailability((prev) => ({
          ...prev,
          [selectedDate]: error.response.data.disponibilidad,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedBarberoData = barberos.find((barbero) => String(barbero.id) === selectedBarbero);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-emerald-500/5 md:grid-cols-2">
        <div className="space-y-4">
          <SelectField
            label="Barbero"
            placeholder="Selecciona un barbero"
            options={barberos.map((barbero) => ({ value: String(barbero.id), label: barbero.nombre }))}
            value={selectedBarbero}
            onChange={setSelectedBarbero}
          />
          <SelectField
            label="Servicio"
            placeholder="Selecciona un servicio"
            options={servicios.map((servicio) => ({ value: String(servicio.id), label: `${servicio.nombre} · ${servicio.duracion}min` }))}
            value={selectedServicio}
            onChange={setSelectedServicio}
          />
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-slate-300">Fecha</span>
            <input
              type="date"
              value={selectedDate}
              min={todayISO()}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <div className="text-xs text-slate-400">
            {selectedBarberoData && (
              <p>
                Horario: {selectedBarberoData.horario_inicio} - {selectedBarberoData.horario_fin} · Intervalos de{' '}
                {selectedBarberoData.duracion_cita} minutos
              </p>
            )}
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-slate-300">Nombre del cliente</span>
              <input
                name="cliente"
                required
                placeholder="Tu nombre"
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-slate-300">Teléfono (WhatsApp)</span>
              <input
                name="telefono"
                required
                placeholder="Ej. +521234567890"
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-slate-300">Horario seleccionado</span>
            <input
              value={selectedTime}
              readOnly
              placeholder="Elige un horario disponible"
              className="cursor-not-allowed rounded-md border border-dashed border-slate-700 bg-slate-800 px-3 py-2 text-slate-300"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? 'Reservando…' : 'Confirmar cita'}
          </button>
          {status.state !== 'idle' && <Alert type={status.state === 'error' ? 'error' : status.state}>{status.message}</Alert>}
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-emerald-300">Disponibilidad semanal</h2>
        <WeeklySchedule
          week={week}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSelectSlot={(date, time) => {
            setSelectedDate(date);
            setSelectedTime(time);
          }}
        />
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Disponibilidad para {selectedDate}</h3>
        <div className="flex flex-wrap gap-2">
          {availability.length === 0 && <span className="text-xs text-slate-500">Sin horarios disponibles</span>}
          {availability.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setSelectedTime(time)}
              className={`rounded-md border px-3 py-1 text-sm transition ${
                selectedTime === time
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                  : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-emerald-400 hover:text-emerald-200'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BookingPage;
