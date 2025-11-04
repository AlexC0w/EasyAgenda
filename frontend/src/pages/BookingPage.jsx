import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client.js';
import Alert from '../components/Alert.jsx';

const dayNameToLabel = {
  sunday: 'Dom',
  monday: 'Lun',
  tuesday: 'Mar',
  wednesday: 'Mié',
  thursday: 'Jue',
  friday: 'Vie',
  saturday: 'Sáb',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

const toISODate = (date) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().split('T')[0];
};

const generateMonthDays = (anchor) => {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = [];
  for (let i = 0; i < firstDay.getDay(); i += 1) {
    days.push(null);
  }
  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }
  return days;
};

const findFirstSelectableDate = (barbero) => {
  if (!barbero) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let step = 0; step < 90; step += 1) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + step);
    const dayName = candidate
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();
    if (barbero.dias_laborales.includes(dayName)) {
      return toISODate(candidate);
    }
  }
  return '';
};

const BookingPage = () => {
  const [view, setView] = useState('selection');
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [selectedBarberoId, setSelectedBarberoId] = useState('');
  const [selectedServicioId, setSelectedServicioId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [availability, setAvailability] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', telefono: '', email: '' });
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [barberosRes, serviciosRes] = await Promise.all([
          api.get('/barberos'),
          api.get('/servicios'),
        ]);
        setBarberos(barberosRes.data);
        setServicios(serviciosRes.data);
        if (barberosRes.data.length) {
          const firstId = String(barberosRes.data[0].id);
          setSelectedBarberoId(firstId);
          const firstDate = findFirstSelectableDate(barberosRes.data[0]);
          if (firstDate) {
            setSelectedDate(firstDate);
            const focusDate = new Date(`${firstDate}T00:00:00`);
            setMonthCursor(new Date(focusDate.getFullYear(), focusDate.getMonth(), 1));
          }
        }
        if (serviciosRes.data.length) {
          setSelectedServicioId(String(serviciosRes.data[0].id));
        }
      } catch (error) {
        console.error(error);
        setStatus({ state: 'error', message: 'No se pudieron cargar los datos iniciales.' });
      }
    };
    loadInitialData();
  }, []);

  const selectedBarbero = useMemo(
    () => barberos.find((barbero) => String(barbero.id) === selectedBarberoId),
    [barberos, selectedBarberoId]
  );

  const selectedServicio = useMemo(
    () => servicios.find((servicio) => String(servicio.id) === selectedServicioId),
    [servicios, selectedServicioId]
  );

  useEffect(() => {
    if (!selectedBarbero) return;
    const nextDate = findFirstSelectableDate(selectedBarbero);
    if (nextDate && nextDate !== selectedDate) {
      setSelectedDate(nextDate);
      const focusDate = new Date(`${nextDate}T00:00:00`);
      setMonthCursor(new Date(focusDate.getFullYear(), focusDate.getMonth(), 1));
    }
    setSelectedTime('');
  }, [selectedBarberoId]);

  useEffect(() => {
    setSelectedTime('');
  }, [selectedServicioId, selectedDate]);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedBarberoId || !selectedServicioId || !selectedDate) {
        setAvailability([]);
        return;
      }
      try {
        setLoadingSlots(true);
        const { data } = await api.get(`/disponibles/${selectedBarberoId}`, {
          params: { fecha: selectedDate, servicioId: selectedServicioId },
        });
        setAvailability(data.disponibilidad || []);
      } catch (error) {
        console.error(error);
        setAvailability([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    loadAvailability();
  }, [selectedBarberoId, selectedServicioId, selectedDate]);

  const daysOfWeek = useMemo(
    () => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    []
  );

  const monthDays = useMemo(() => generateMonthDays(monthCursor), [monthCursor]);

  const isDateSelectable = (date) => {
    if (!date || !selectedBarbero) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const candidate = new Date(date);
    candidate.setHours(0, 0, 0, 0);
    if (candidate < today) return false;
    const dayName = candidate
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();
    return selectedBarbero.dias_laborales.includes(dayName);
  };

  const handleMonthShift = (delta) => {
    const candidate = new Date(monthCursor);
    candidate.setMonth(candidate.getMonth() + delta);
    candidate.setDate(1);
    const now = new Date();
    now.setDate(1);
    if (candidate < now) return;
    setMonthCursor(candidate);
  };

  const handleSelectDate = (date) => {
    if (!date) return;
    const iso = toISODate(date);
    setSelectedDate(iso);
    setSelectedTime('');
  };

  const todayIso = useMemo(() => toISODate(new Date()), []);

  const visibleAvailability = useMemo(() => {
    if (!availability.length) return availability;
    if (selectedDate !== todayIso) return availability;

    const now = new Date();
    return availability.filter((slot) => {
      const slotDate = new Date(`${selectedDate}T${slot}:00`);
      return slotDate > now;
    });
  }, [availability, selectedDate, todayIso]);

  useEffect(() => {
    if (!selectedTime) return;
    if (visibleAvailability.includes(selectedTime)) return;
    setSelectedTime('');
  }, [visibleAvailability, selectedTime]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedBarbero || !selectedServicio || !selectedDate || !selectedTime) {
      setStatus({ state: 'error', message: 'Completa todos los campos para reservar tu cita.' });
      return;
    }

    setBookingLoading(true);
    setStatus({ state: 'info', message: 'Registrando tu cita…' });
    try {
      const payload = {
        barberoId: Number(selectedBarbero.id),
        servicioId: Number(selectedServicio.id),
        cliente: formData.nombre,
        telefono: formData.telefono,
        fecha: selectedDate,
        hora: selectedTime,
      };
      const { data } = await api.post('/citas', payload);
      setConfirmation({
        cita: data,
        barbero: selectedBarbero,
        servicio: selectedServicio,
        fecha: selectedDate,
        hora: selectedTime,
        cliente: formData.nombre,
        telefono: formData.telefono,
        email: formData.email,
      });
      if (data.whatsappEnviado === false) {
        toast.error(data.whatsappError || 'No se pudo enviar la confirmación por WhatsApp.');
      }
      setStatus({
        state: 'success',
        message:
          data.whatsappEnviado === false
            ? '¡Cita reservada! No pudimos enviar la confirmación por WhatsApp, pero tu cita está lista.'
            : '¡Cita reservada! Recibirás una confirmación por WhatsApp en breve.',
      });
      setView('confirmation');
      const refresh = await api.get(`/disponibles/${selectedBarbero.id}`, {
        params: { fecha: selectedDate, servicioId: selectedServicio.id },
      });
      setAvailability(refresh.data.disponibilidad || []);
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.message ||
        'No se pudo registrar la cita. Verifica la información e inténtalo de nuevo.';
      setStatus({ state: 'error', message });
      if (error.response?.data?.disponibilidad) {
        setAvailability(error.response.data.disponibilidad);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const resetBooking = () => {
    setFormData({ nombre: '', telefono: '', email: '' });
    setSelectedTime('');
    setStatus({ state: 'idle', message: '' });
    setConfirmation(null);
    setView('selection');
  };

  const workingScheduleLabel = selectedBarbero
    ? `${selectedBarbero.horario_inicio} - ${selectedBarbero.horario_fin} · Bloques de ${selectedBarbero.duracion_cita} min`
    : '';

  return (
    <div className="space-y-8">
      {status.state !== 'idle' && <Alert type={status.state === 'error' ? 'error' : status.state}>{status.message}</Alert>}

      {view === 'selection' && (
        <div className="space-y-10">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              <Calendar className="h-3.5 w-3.5" /> Agenda tu experiencia
            </span>
            <h2 className="mt-6 text-4xl font-bold text-white">Reserva con tu barbero favorito</h2>
            <p className="mt-2 text-slate-400">
              Selecciona un barbero y el servicio que deseas para ver horarios disponibles.
            </p>
          </div>

          <section className="space-y-6">
            <h3 className="flex items-center gap-3 text-xl font-semibold text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <User className="h-5 w-5" />
              </span>
              Barberos disponibles
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              {barberos.map((barbero, index) => {
                const isActive = String(barbero.id) === selectedBarberoId;
                const initials = barbero.nombre
                  .split(' ')
                  .map((part) => part[0])
                  .join('');
                return (
                  <button
                    key={barbero.id}
                    type="button"
                    onClick={() => setSelectedBarberoId(String(barbero.id))}
                    className={`group rounded-2xl border px-6 py-6 text-left transition-all ${
                      isActive
                        ? 'border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                        : 'border-slate-800/80 bg-slate-900/60 hover:border-emerald-400/40 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-lg font-semibold text-emerald-300">
                        {initials}
                      </div>
                      <span className="text-xs uppercase tracking-wide text-slate-500">
                        {barbero.dias_laborales
                          .map((day) => dayNameToLabel[day] || day.slice(0, 3))
                          .join(' · ')}
                      </span>
                    </div>
                    <h4 className="mt-4 text-lg font-semibold text-white">{barbero.nombre}</h4>
                    <p className="mt-2 text-sm text-slate-400">
                      Horario {barbero.horario_inicio} - {barbero.horario_fin}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Intervalos de {barbero.duracion_cita} minutos
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {selectedBarbero && (
            <section className="space-y-6">
              <h3 className="flex items-center gap-3 text-xl font-semibold text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                  <Clock className="h-5 w-5" />
                </span>
                Selecciona tu servicio
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {servicios.map((servicio) => {
                  const isActive = String(servicio.id) === selectedServicioId;
                  return (
                    <button
                      key={servicio.id}
                      type="button"
                      onClick={() => setSelectedServicioId(String(servicio.id))}
                      className={`rounded-2xl border p-5 text-left transition-all ${
                        isActive
                          ? 'border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                          : 'border-slate-800/80 bg-slate-900/60 hover:border-emerald-400/40 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-white">{servicio.nombre}</h4>
                        <span className="text-emerald-300 font-semibold">{formatCurrency(servicio.precio)}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{servicio.duracion} minutos</p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {selectedBarbero && selectedServicio && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setView('calendar')}
                className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 px-8 py-4 text-lg font-semibold text-white shadow-emerald-500/40 transition hover:from-emerald-500 hover:to-emerald-400"
              >
                Continuar al calendario
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </div>
      )}

      {view === 'calendar' && (
        <div className="space-y-8">
          <button
            type="button"
            onClick={() => setView('selection')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" /> Volver a la selección
          </button>

          <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
            <section className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl shadow-emerald-500/10">
              <header className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleMonthShift(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-emerald-500/40 hover:text-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white">
                    {monthCursor.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                  </h3>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">Disponibilidad</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleMonthShift(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-emerald-500/40 hover:text-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </header>

              <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                {daysOfWeek.map((day) => (
                  <div key={day} className="py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }
                  const selectable = isDateSelectable(date);
                  const iso = toISODate(date);
                  const selected = iso === selectedDate;
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={!selectable}
                      onClick={() => selectable && handleSelectDate(date)}
                      className={`aspect-square rounded-xl border text-sm font-semibold transition ${
                        !selectable
                          ? 'cursor-not-allowed border-slate-900/60 bg-slate-950/40 text-slate-700'
                          : selected
                          ? 'border-emerald-500/60 bg-emerald-500/20 text-white shadow-lg shadow-emerald-500/20'
                          : 'border-slate-800/80 bg-slate-900/60 text-slate-200 hover:border-emerald-400/40 hover:text-white'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl shadow-emerald-500/10">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <Clock className="h-5 w-5 text-emerald-300" /> Horarios disponibles
                </h3>
                <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
                  {selectedBarbero?.nombre} · {selectedServicio?.nombre}
                </p>
                <p className="mt-4 text-sm text-slate-400">
                  {workingScheduleLabel}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {loadingSlots && <p className="col-span-3 text-center text-sm text-slate-400">Cargando horarios…</p>}
                  {!loadingSlots && visibleAvailability.length === 0 && (
                    <p className="col-span-3 text-center text-sm text-slate-500">
                      No hay horarios disponibles para el resto del día.
                    </p>
                  )}
                  {!loadingSlots &&
                    visibleAvailability.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                          selectedTime === slot
                            ? 'border-emerald-500/60 bg-emerald-500/20 text-white shadow-emerald-500/20'
                            : 'border-slate-800/80 bg-slate-900/60 text-slate-200 hover:border-emerald-400/40 hover:text-white'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                </div>
              </div>

              {selectedTime && (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl shadow-emerald-500/10"
                >
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <User className="h-5 w-5 text-emerald-300" /> Tus datos
                  </h3>
                  <div className="space-y-4">
                    <label className="flex flex-col gap-2 text-sm">
                      <span className="text-slate-300">Nombre completo</span>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, nombre: event.target.value }))
                          }
                          required
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                          placeholder="Juan Pérez"
                        />
                        <User className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                      </div>
                    </label>
                    <label className="flex flex-col gap-2 text-sm">
                      <span className="text-slate-300">Teléfono</span>
                      <div className="relative">
                        <input
                          type="tel"
                          value={formData.telefono}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, telefono: event.target.value }))
                          }
                          required
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                          placeholder="614 123 4567"
                        />
                        <Phone className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                      </div>
                    </label>
                    <label className="flex flex-col gap-2 text-sm">
                      <span className="text-slate-300">Email (opcional)</span>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, email: event.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                          placeholder="correo@ejemplo.com"
                        />
                        <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                      </div>
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 px-6 py-3 text-sm font-semibold text-white shadow-emerald-500/30 transition hover:from-emerald-500 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {bookingLoading ? 'Procesando…' : 'Confirmar reserva'}
                  </button>
                </form>
              )}
            </aside>
          </div>
        </div>
      )}

      {view === 'confirmation' && confirmation && (
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10">
            <Check className="h-12 w-12 text-emerald-300" />
          </div>
          <h2 className="text-4xl font-bold text-white">¡Tu cita está confirmada!</h2>
          <p className="text-slate-400">
            Te hemos enviado un mensaje de WhatsApp con los detalles de tu reserva.
          </p>

          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 text-left shadow-xl shadow-emerald-500/10">
            <dl className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Barbero</dt>
                <dd className="font-semibold text-white">{confirmation.barbero.nombre}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Servicio</dt>
                <dd className="font-semibold text-white">{confirmation.servicio.nombre}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Duración</dt>
                <dd className="font-semibold text-white">{confirmation.servicio.duracion} min</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Fecha</dt>
                <dd className="font-semibold text-white">{confirmation.fecha}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Hora</dt>
                <dd className="font-semibold text-white">{confirmation.hora}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <dt className="text-slate-400">Total</dt>
                <dd className="text-xl font-bold text-emerald-300">
                  {formatCurrency(confirmation.servicio.precio)}
                </dd>
              </div>
            </dl>
          </div>

          <button
            type="button"
            onClick={resetBooking}
            className="rounded-2xl border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-emerald-400 hover:bg-slate-900"
          >
            Agendar otra cita
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
