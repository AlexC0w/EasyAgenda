import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import {
  Calendar,
  Clock,
  DollarSign,
  RefreshCcw,
  Settings,
  ShieldCheck,
  Users,
  UserPlus,
  Eye,
  EyeOff,
  Phone,
  Building,
} from 'lucide-react';
import api from '../api/client.js';
import SelectField from '../components/SelectField.jsx';
import Alert from '../components/Alert.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const toDateTime = (fecha, hora) => new Date(`${fecha.split('T')[0]}T${hora}:00`);

const initialUserForm = {
  username: '',
  password: '',
  telefono: '',
  role: 'BARBER',
};

const defaultBusiness = {
  businessName: '',
  businessPhone: '',
  businessAddress: '',
  whatsappSender: '',
};

const AdminPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState('agenda');
  const [barberos, setBarberos] = useState([]);
  const [selectedBarbero, setSelectedBarbero] = useState(user?.barberoId ? String(user.barberoId) : '');
  const [citas, setCitas] = useState([]);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [savingUser, setSavingUser] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const [business, setBusiness] = useState(defaultBusiness);
  const [savingBusiness, setSavingBusiness] = useState(false);

  useEffect(() => {
    if (!isAdmin && activeTab !== 'agenda') {
      setActiveTab('agenda');
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    setSelectedBarbero(user?.barberoId ? String(user.barberoId) : '');
  }, [user?.barberoId]);

  const loadBarberos = async () => {
    try {
      const { data } = await api.get('/barberos');
      setBarberos(data);
    } catch (error) {
      console.error(error);
      setStatus({ state: 'error', message: 'No se pudieron cargar los barberos.' });
    }
  };

  const loadCitas = async (barberoIdValue) => {
    try {
      setLoading(true);
      let endpoint = '/citas';
      if (isAdmin && barberoIdValue) {
        endpoint = `/citas/${barberoIdValue}`;
      }
      const { data } = await api.get(endpoint);
      setCitas(data);
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'No se pudieron cargar las citas.';
      setStatus({ state: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    if (!isAdmin) return;
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'No se pudieron cargar los usuarios.';
      setStatus({ state: 'error', message });
    }
  };

  const loadBusiness = async () => {
    if (!isAdmin) return;
    try {
      const { data } = await api.get('/business');
      const mapped = data.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
      setBusiness({ ...defaultBusiness, ...mapped });
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'No se pudo cargar la información del negocio.';
      setStatus({ state: 'error', message });
    }
  };

  useEffect(() => {
    loadBarberos();
  }, []);

  useEffect(() => {
    loadCitas(isAdmin ? selectedBarbero : '');
  }, [selectedBarbero, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadBusiness();
    }
  }, [isAdmin]);

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
      })),
    [citas]
  );

  const metrics = useMemo(() => {
    const total = citas.length;
    const confirmadas = citas.filter((cita) => cita.estado === 'confirmada').length;
    const ingresos = citas.reduce((acc, cita) => acc + Number(cita.servicio?.precio || 0), 0);
    const duracionPromedio = citas.length
      ? Math.round(citas.reduce((acc, cita) => acc + Number(cita.servicio?.duracion || 0), 0) / citas.length)
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
      await loadCitas(isAdmin ? selectedBarbero : '');
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'No fue posible mover la cita. Revisa disponibilidad.';
      setStatus({ state: 'error', message });
      info.revert();
    }
  };

  const handleCancel = async (id) => {
    const confirmCancel = window.confirm('¿Deseas cancelar esta cita?');
    if (!confirmCancel) return;
    try {
      await api.patch(`/citas/${id}`, { estado: 'cancelada' });
      setStatus({ state: 'success', message: 'Cita cancelada correctamente.' });
      await loadCitas(isAdmin ? selectedBarbero : '');
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'No se pudo cancelar la cita.';
      setStatus({ state: 'error', message });
    }
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
      await loadCitas(isAdmin ? selectedBarbero : '');
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'No fue posible reprogramar la cita. Revisa la disponibilidad.';
      setStatus({ state: 'error', message });
    }
  };

  const dayHeaderContent = (arg) => {
    const dayName = arg.date.toLocaleDateString('es-MX', { weekday: 'short' });
    const dayNumber = arg.date.getDate();

    return {
      html: `
        <div class="fc-col-header-chip">
          <span class="fc-chip-day">${dayName.toUpperCase()}</span>
          <span class="fc-chip-date">${dayNumber}</span>
        </div>
      `,
    };
  };

  const slotLabelContent = (arg) => {
    const formatter = new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const parts = formatter.formatToParts(arg.date);
    const hour = parts.find((part) => part.type === 'hour')?.value ?? '';
    const minute = parts.find((part) => part.type === 'minute')?.value ?? '';
    const period = parts
      .find((part) => part.type === 'dayPeriod')
      ?.value.replace(/[.\s]/g, '')
      .toUpperCase();

    return {
      html: `
        <div class="fc-slot-label-chip">
          <span class="fc-slot-label-time">${hour}:${minute}</span>
          <span class="fc-slot-label-meridiem">${period || ''}</span>
        </div>
      `,
    };
  };

  const handleUserFormChange = (event) => {
    const { name, value } = event.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setSavingUser(true);
    try {
      const { data } = await api.post('/users', userForm);
      setUsers((prev) => [data, ...prev]);
      setUserForm(initialUserForm);
      setStatus({ state: 'success', message: 'Usuario creado correctamente.' });
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'No se pudo crear el usuario.';
      setStatus({ state: 'error', message });
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm('¿Deseas eliminar este usuario?');
    if (!confirmDelete) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((item) => item.id !== id));
      setStatus({ state: 'success', message: 'Usuario eliminado.' });
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'No se pudo eliminar el usuario.';
      setStatus({ state: 'error', message });
    }
  };

  const handleResetPassword = async (userItem) => {
    const newPassword = window.prompt(`Nueva contraseña para ${userItem.username}`, userItem.password);
    if (!newPassword) return;
    try {
      const { data } = await api.patch(`/users/${userItem.id}`, { password: newPassword });
      setUsers((prev) => prev.map((item) => (item.id === data.id ? data : item)));
      setStatus({ state: 'success', message: 'Contraseña actualizada.' });
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'No se pudo actualizar la contraseña.';
      setStatus({ state: 'error', message });
    }
  };

  const handleEditPhone = async (userItem) => {
    const newPhone = window.prompt(`Nuevo teléfono para ${userItem.username}`, userItem.telefono || '');
    if (newPhone === null) return;
    try {
      const { data } = await api.patch(`/users/${userItem.id}`, { telefono: newPhone });
      setUsers((prev) => prev.map((item) => (item.id === data.id ? data : item)));
      setStatus({ state: 'success', message: 'Teléfono actualizado.' });
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'No se pudo actualizar el teléfono.';
      setStatus({ state: 'error', message });
    }
  };

  const handleBusinessChange = (event) => {
    const { name, value } = event.target;
    setBusiness((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveBusiness = async (event) => {
    event.preventDefault();
    setSavingBusiness(true);
    try {
      await api.put('/business', business);
      setStatus({ state: 'success', message: 'Información del negocio actualizada.' });
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'No se pudo guardar la información.';
      setStatus({ state: 'error', message });
    } finally {
      setSavingBusiness(false);
    }
  };

  const barberoOptions = useMemo(() => {
    const base = barberos.map((barbero) => ({ value: String(barbero.id), label: barbero.nombre }));
    return [{ value: '', label: 'Todos los barberos' }, ...base];
  }, [barberos]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl shadow-emerald-500/10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">Agenda Octane</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Panel de administración</h2>
            <p className="mt-2 text-sm text-slate-400">
              Gestiona la agenda, usuarios y la información clave del estudio desde una vista unificada.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100">
            <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-300/80">
              <ShieldCheck className="h-4 w-4" /> Sesión activa
            </span>
            <span className="text-base font-semibold text-white">{user?.username}</span>
            <span className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">Rol · {user?.role}</span>
            {user?.barberoNombre && (
              <span className="text-xs text-emerald-200/80">Asignado a: {user.barberoNombre}</span>
            )}
          </div>
        </div>
        {isAdmin && (
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { id: 'agenda', label: 'Agenda', icon: <Calendar className="h-4 w-4" /> },
              { id: 'usuarios', label: 'Usuarios', icon: <Users className="h-4 w-4" /> },
              { id: 'negocio', label: 'Negocio', icon: <Settings className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${
                  activeTab === tab.id
                    ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                    : 'border-slate-700/70 text-slate-400 hover:border-emerald-400/60 hover:text-emerald-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {status.state !== 'idle' && <Alert type={status.state}>{status.message}</Alert>}

      {(activeTab === 'agenda' || !isAdmin) && (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Citas del periodo</span>
                <Calendar className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-white">{metrics.total}</p>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Confirmadas</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-emerald-300">{metrics.confirmadas}</p>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Ingresos estimados</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-emerald-300">
                ${metrics.ingresos.toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Duración promedio</span>
                <Clock className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-white">{metrics.duracionPromedio} min</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Filtro</h3>
                  <RefreshCcw
                    className="h-4 w-4 cursor-pointer text-slate-500 transition hover:text-emerald-300"
                    onClick={() => loadCitas(isAdmin ? selectedBarbero : '')}
                  />
                </div>
                {isAdmin ? (
                  <div className="mt-4 space-y-4">
                    <SelectField
                      label="Barbero"
                      options={barberoOptions}
                      value={selectedBarbero}
                      onChange={setSelectedBarbero}
                      placeholder="Selecciona un barbero"
                    />
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-200">
                    <p className="font-semibold">Tu agenda</p>
                    <p className="text-xs text-emerald-200/70">
                      Solo puedes visualizar y administrar las citas asignadas a tu perfil.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Acciones rápidas</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-400">
                  <button
                    type="button"
                    onClick={() => loadCitas(isAdmin ? selectedBarbero : '')}
                    className="w-full rounded-xl border border-slate-700/70 bg-slate-900 px-4 py-3 text-left text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200"
                  >
                    Actualizar agenda
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Agenda semanal</h3>
                <span className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">FullCalendar</span>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950/40 p-2">
                <FullCalendar
                  height="auto"
                  locale={esLocale}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  slotMinTime="08:00:00"
                  slotMaxTime="20:00:00"
                  headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
                  events={events}
                  eventContent={renderEventContent}
                  eventClassNames={eventClassNames}
                  editable
                  droppable
                  eventDrop={handleEventDrop}
                  dayHeaderContent={dayHeaderContent}
                  slotLabelContent={slotLabelContent}
                  slotEventOverlap={false}
                  nowIndicator
                  eventDidMount={(info) => {
                    info.el.setAttribute('title', `${info.event.title}\n${info.event.extendedProps.estado}`);
                  }}
                />
              </div>
              {loading && (
                <p className="mt-4 text-sm text-slate-400">Cargando agenda...</p>
              )}
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800/80">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/80 text-xs uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Barbero</th>
                      <th className="px-4 py-3">Servicio</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Hora</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {citas.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                          No hay citas registradas para este filtro.
                        </td>
                      </tr>
                    ) : (
                      citas.map((cita) => (
                        <tr key={cita.id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3 text-white">{cita.cliente}</td>
                          <td className="px-4 py-3 text-slate-300">{cita.barbero.nombre}</td>
                          <td className="px-4 py-3 text-slate-300">{cita.servicio.nombre}</td>
                          <td className="px-4 py-3 text-slate-300">{cita.fecha.split('T')[0]}</td>
                          <td className="px-4 py-3 text-slate-300">{cita.hora}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-200">
                              {cita.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleReschedule(cita)}
                                className="rounded-full border border-slate-700/70 px-3 py-1 text-slate-300 transition hover:border-emerald-400/60 hover:text-emerald-200"
                              >
                                Reprogramar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancel(cita.id)}
                                className="rounded-full border border-rose-500/40 px-3 py-1 text-rose-300 transition hover:border-rose-400 hover:text-rose-200"
                              >
                                Cancelar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdmin && activeTab === 'usuarios' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <UserPlus className="h-5 w-5 text-emerald-400" /> Nuevo usuario
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Los accesos permiten diferenciar entre administradores y barberos. Las contraseñas se almacenan cifradas, pero como administrador puedes consultarlas desde esta vista.
            </p>
            <form onSubmit={handleCreateUser} className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Usuario</label>
                <input
                  name="username"
                  value={userForm.username}
                  onChange={handleUserFormChange}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  placeholder="barbero01"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Contraseña</label>
                <input
                  name="password"
                  value={userForm.password}
                  onChange={handleUserFormChange}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  placeholder="********"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Teléfono</label>
                <input
                  name="telefono"
                  value={userForm.telefono}
                  onChange={handleUserFormChange}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  placeholder="+52 555 010 1234"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Rol</label>
                <select
                  name="role"
                  value={userForm.role}
                  onChange={handleUserFormChange}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="BARBER">Barbero</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={savingUser}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-slate-950 transition hover:from-emerald-400 hover:to-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingUser ? 'Guardando...' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Users className="h-5 w-5 text-emerald-400" /> Usuarios registrados
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-slate-700/70 px-4 py-2 text-xs uppercase tracking-widest text-slate-300 transition hover:border-emerald-400/60 hover:text-emerald-200"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPasswords ? 'Ocultar' : 'Mostrar'} contraseñas
              </button>
            </div>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800/80">
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">Contraseña</th>
                    <th className="px-4 py-3">Barbero</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  ) : (
                    users.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30">
                        <td className="px-4 py-3 text-white">{item.username}</td>
                        <td className="px-4 py-3 text-slate-300">{item.role}</td>
                        <td className="px-4 py-3 text-slate-300">{item.telefono || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs text-emerald-200">
                          {showPasswords ? item.password : '••••••••'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">{item.barberoNombre || 'Sin asignar'}</td>
                        <td className="px-4 py-3 text-xs">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleResetPassword(item)}
                              className="rounded-full border border-slate-700/70 px-3 py-1 text-slate-300 transition hover:border-emerald-400/60 hover:text-emerald-200"
                            >
                              Reset pass
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditPhone(item)}
                              className="rounded-full border border-slate-700/70 px-3 py-1 text-slate-300 transition hover:border-emerald-400/60 hover:text-emerald-200"
                            >
                              Editar teléfono
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(item.id)}
                              className="rounded-full border border-rose-500/40 px-3 py-1 text-rose-300 transition hover:border-rose-400 hover:text-rose-200"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isAdmin && activeTab === 'negocio' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Building className="h-5 w-5 text-emerald-400" /> Información general
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Actualiza los datos visibles en comunicaciones y recordatorios automáticos.
            </p>
            <form onSubmit={handleSaveBusiness} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Nombre comercial</label>
                <input
                  name="businessName"
                  value={business.businessName}
                  onChange={handleBusinessChange}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  placeholder="Agenda Octane Studio"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Teléfono principal</label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/40">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <input
                    name="businessPhone"
                    value={business.businessPhone}
                    onChange={handleBusinessChange}
                    className="w-full bg-transparent text-sm text-white outline-none"
                    placeholder="+52 555 010 7777"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Dirección</label>
                <textarea
                  name="businessAddress"
                  value={business.businessAddress}
                  onChange={handleBusinessChange}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  placeholder="Av. Revolución 123, CDMX"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Número remitente de WhatsApp</label>
                <input
                  name="whatsappSender"
                  value={business.whatsappSender}
                  onChange={handleBusinessChange}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  placeholder="+52 555 010 8888"
                />
              </div>
              <button
                type="submit"
                disabled={savingBusiness}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-slate-950 transition hover:from-emerald-400 hover:to-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingBusiness ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
            <h3 className="text-lg font-semibold text-white">Contexto operativo</h3>
            <p className="mt-2 text-sm text-slate-400">
              Mantén esta información actualizada para compartirla con tu equipo y garantizar que los recordatorios automáticos contengan datos correctos.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li>
                <strong className="text-emerald-300">Nombre comercial:</strong> {business.businessName || '—'}
              </li>
              <li>
                <strong className="text-emerald-300">Teléfono:</strong> {business.businessPhone || '—'}
              </li>
              <li>
                <strong className="text-emerald-300">Dirección:</strong> {business.businessAddress || '—'}
              </li>
              <li>
                <strong className="text-emerald-300">WhatsApp remitente:</strong> {business.whatsappSender || '—'}
              </li>
            </ul>
            <div className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5 text-sm text-slate-400">
              <p className="font-semibold text-white">Consejo</p>
              <p className="mt-2">
                Vincula a tus barberos con un usuario para que solo visualicen su propia agenda. Puedes hacerlo editando el campo <em>userId</em> del barbero en la base de datos o actualizando la semilla inicial.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
