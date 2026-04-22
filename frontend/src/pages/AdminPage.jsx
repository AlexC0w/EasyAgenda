import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
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
  Scissors,
  ListChecks,
  Edit3,
  Trash2,
  Save,
  XCircle,
} from 'lucide-react';
import api from '../api/client.js';
import SelectField from '../components/SelectField.jsx';
import Alert from '../components/Alert.jsx';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const toDateTime = (fecha, hora) => new Date(`${fecha.split('T')[0]}T${hora}:00`);

const dayOptions = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

const createEmptyBarberProfile = () => ({
  nombre: '',
  horarioInicio: '09:00',
  horarioFin: '18:00',
  duracionCita: 30,
  diasLaborales: [],
  horariosEspeciales: {},
});

const createInitialUserForm = () => ({
  username: '',
  password: '',
  telefono: '',
  role: 'BARBER',
  barberoProfile: createEmptyBarberProfile(),
});

const createInitialServiceForm = () => ({
  nombre: '',
  duracion: 30,
  precio: '',
});

const toEditableBarberProfile = (profile) => ({
  nombre: profile?.nombre ?? '',
  horarioInicio: profile?.horario_inicio ?? '09:00',
  horarioFin: profile?.horario_fin ?? '18:00',
  duracionCita: profile?.duracion_cita ?? 30,
  diasLaborales: Array.isArray(profile?.dias_laborales) ? profile.dias_laborales : [],
  horariosEspeciales: profile?.horarios_especiales ?? {},
});

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value));

const defaultBusiness = {
  businessName: '',
  businessPhone: '',
  businessAddress: '',
  whatsappSender: '',
  whatsappToken: '',
};

const AdminPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState('agenda');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [calendarTitle, setCalendarTitle] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [barberos, setBarberos] = useState([]);
  const [selectedBarbero, setSelectedBarbero] = useState(user?.barberoId ? String(user.barberoId) : '');
  const [citas, setCitas] = useState([]);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState(() => createInitialUserForm());
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const [selectedBarberUserId, setSelectedBarberUserId] = useState(null);
  const [barberProfileForm, setBarberProfileForm] = useState(() => createEmptyBarberProfile());
  const [savingBarberProfile, setSavingBarberProfile] = useState(false);

  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState(() => createInitialServiceForm());
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [savingService, setSavingService] = useState(false);

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
      setStatus({ state: 'error', message: 'No se pudieron cargar los profesionales.' });
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

  const loadServicios = async () => {
    if (!isAdmin) return;
    try {
      const { data } = await api.get('/servicios');
      setServices(data);
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'No se pudieron cargar los servicios.';
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
      loadServicios();
    }
  }, [isAdmin]);

  const events = useMemo(
    () =>
      citas.map((cita) => {
        const start = toDateTime(cita.fecha, cita.hora);
        // Use duracionTotal if available, otherwise fallback to single service duration or barber default
        const durationMinutes = Number(cita.duracionTotal || cita.servicio?.duracion || cita.barbero?.duracion_cita || 60);
        const end = new Date(start.getTime() + durationMinutes * 60_000);

        let serviceName = cita.servicio?.nombre;
        if (cita.servicios && cita.servicios.length > 0) {
            serviceName = cita.servicios.map(s => s.servicio.nombre).join(' + ');
        }

        return {
          id: String(cita.id),
          title: `${cita.cliente} · ${serviceName}`,
          start,
          end,
          extendedProps: {
            telefono: cita.telefono,
            estado: cita.estado,
            barbero: cita.barbero.nombre,
            servicio: serviceName,
            precio: cita.servicio.precio, // Note: Total price calculation might be needed if not stored
            duracion: durationMinutes,
            servicios: cita.servicios
          },
        };
      }),
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
    setUserForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'role' && value !== 'BARBER') {
        next.barberoProfile = createEmptyBarberProfile();
      }
      return next;
    });
  };

  const handleUserBarberFieldChange = (field, value) => {
    setUserForm((prev) => ({
      ...prev,
      barberoProfile: {
        ...prev.barberoProfile,
        [field]: value,
      },
    }));
  };

  const handleUserBarberDayToggle = (day) => {
    setUserForm((prev) => {
      const alreadySelected = prev.barberoProfile.diasLaborales.includes(day);
      const diasLaborales = alreadySelected
        ? prev.barberoProfile.diasLaborales.filter((item) => item !== day)
        : [...prev.barberoProfile.diasLaborales, day];
      const horariosEspeciales = { ...prev.barberoProfile.horariosEspeciales };
      if (alreadySelected) delete horariosEspeciales[day];
      return {
        ...prev,
        barberoProfile: {
          ...prev.barberoProfile,
          diasLaborales,
          horariosEspeciales,
        },
      };
    });
  };

  const handleUserBarberSpecialScheduleToggle = (day) => {
    setUserForm((prev) => {
      const horariosEspeciales = { ...prev.barberoProfile.horariosEspeciales };
      if (horariosEspeciales[day]) {
        delete horariosEspeciales[day];
      } else {
        horariosEspeciales[day] = { inicio: prev.barberoProfile.horarioInicio, fin: prev.barberoProfile.horarioFin };
      }
      return { ...prev, barberoProfile: { ...prev.barberoProfile, horariosEspeciales } };
    });
  };

  const handleUserBarberSpecialScheduleChange = (day, field, value) => {
    setUserForm((prev) => ({
      ...prev,
      barberoProfile: {
        ...prev.barberoProfile,
        horariosEspeciales: {
          ...prev.barberoProfile.horariosEspeciales,
          [day]: { ...prev.barberoProfile.horariosEspeciales[day], [field]: value },
        },
      },
    }));
  };

  const openBarberProfileEditor = (userItem) => {
    setSelectedBarberUserId(userItem.id);
    setBarberProfileForm(toEditableBarberProfile(userItem.barberoProfile));
  };

  const closeBarberProfileEditor = () => {
    setSelectedBarberUserId(null);
    setBarberProfileForm(createEmptyBarberProfile());
  };

  const handleBarberProfileFormChange = (field, value) => {
    setBarberProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBarberProfileDayToggle = (day) => {
    setBarberProfileForm((prev) => {
      const alreadySelected = prev.diasLaborales.includes(day);
      const horariosEspeciales = { ...prev.horariosEspeciales };
      if (alreadySelected) delete horariosEspeciales[day];
      return {
        ...prev,
        diasLaborales: alreadySelected
          ? prev.diasLaborales.filter((item) => item !== day)
          : [...prev.diasLaborales, day],
        horariosEspeciales,
      };
    });
  };

  const handleBarberProfileSpecialScheduleToggle = (day) => {
    setBarberProfileForm((prev) => {
      const horariosEspeciales = { ...prev.horariosEspeciales };
      if (horariosEspeciales[day]) {
        delete horariosEspeciales[day];
      } else {
        horariosEspeciales[day] = { inicio: prev.horarioInicio, fin: prev.horarioFin };
      }
      return { ...prev, horariosEspeciales };
    });
  };

  const handleBarberProfileSpecialScheduleChange = (day, field, value) => {
    setBarberProfileForm((prev) => ({
      ...prev,
      horariosEspeciales: {
        ...prev.horariosEspeciales,
        [day]: { ...prev.horariosEspeciales[day], [field]: value },
      },
    }));
  };

  const handleSaveBarberProfile = async (event) => {
    event.preventDefault();
    if (!selectedBarberUserId) return;

    if (!barberProfileForm.nombre.trim()) {
      setStatus({ state: 'error', message: 'El nombre del profesional es obligatorio.' });
      return;
    }
    if (!barberProfileForm.diasLaborales.length) {
      setStatus({ state: 'error', message: 'Selecciona al menos un día laboral.' });
      return;
    }
    const duration = Number(barberProfileForm.duracionCita);
    if (!Number.isFinite(duration) || duration <= 0) {
      setStatus({ state: 'error', message: 'Define una duración base válida.' });
      return;
    }
    if (!barberProfileForm.horarioInicio || !barberProfileForm.horarioFin) {
      setStatus({ state: 'error', message: 'Selecciona un horario de inicio y fin.' });
      return;
    }

    setSavingBarberProfile(true);
    try {
      const payload = {
        barberoProfile: {
          nombre: barberProfileForm.nombre.trim(),
          horarioInicio: barberProfileForm.horarioInicio,
          horarioFin: barberProfileForm.horarioFin,
          duracionCita: duration,
          diasLaborales: barberProfileForm.diasLaborales,
          horariosEspeciales: barberProfileForm.horariosEspeciales,
        },
      };
      const { data } = await api.patch(`/users/${selectedBarberUserId}`, payload);
      setUsers((prev) => prev.map((item) => (item.id === data.id ? data : item)));
      setBarberProfileForm(toEditableBarberProfile(data.barberoProfile));
      setStatus({ state: 'success', message: 'Perfil profesional actualizado correctamente.' });
      await loadBarberos();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'No se pudo guardar el perfil profesional.';
      setStatus({ state: 'error', message });
    } finally {
      setSavingBarberProfile(false);
    }
  };

  const handleServiceFormChange = (event) => {
    const { name, value } = event.target;
    setServiceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitService = async (event) => {
    event.preventDefault();
    setSavingService(true);
    try {
      const duration = Number(serviceForm.duracion);
      const price = Number.parseFloat(serviceForm.precio);
      if (!serviceForm.nombre.trim() || !Number.isFinite(duration) || duration <= 0 || !Number.isFinite(price)) {
        setStatus({ state: 'error', message: 'Verifica el nombre, duración y precio del servicio.' });
        setSavingService(false);
        return;
      }

      const payload = {
        nombre: serviceForm.nombre.trim(),
        duracion: duration,
        precio: price,
      };

      if (editingServiceId) {
        const { data } = await api.put(`/servicios/${editingServiceId}`, payload);
        setServices((prev) => prev.map((item) => (item.id === data.id ? data : item)));
        setStatus({ state: 'success', message: 'Servicio actualizado correctamente.' });
      } else {
        const { data } = await api.post('/servicios', payload);
        setServices((prev) => [data, ...prev]);
        setStatus({ state: 'success', message: 'Servicio creado correctamente.' });
      }
      setServiceForm(createInitialServiceForm());
      setEditingServiceId(null);
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'No se pudo guardar el servicio.';
      setStatus({ state: 'error', message });
    } finally {
      setSavingService(false);
    }
  };

  const handleEditService = (service) => {
    setEditingServiceId(service.id);
    setServiceForm({
      nombre: service.nombre,
      duracion: service.duracion,
      precio: typeof service.precio === 'string' ? service.precio : String(service.precio),
    });
  };

  const handleCancelServiceEdit = () => {
    setEditingServiceId(null);
    setServiceForm(createInitialServiceForm());
  };

  const handleDeleteService = async (service) => {
    const confirmDelete = window.confirm(`¿Eliminar el servicio ${service.nombre}?`);
    if (!confirmDelete) return;
    try {
      await api.delete(`/servicios/${service.id}`);
      setServices((prev) => prev.filter((item) => item.id !== service.id));
      setStatus({ state: 'success', message: 'Servicio eliminado.' });
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'No se pudo eliminar el servicio.';
      setStatus({ state: 'error', message });
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setSavingUser(true);
    try {
      const payload = {
        username: userForm.username.trim(),
        password: userForm.password,
        telefono: userForm.telefono,
        role: userForm.role,
      };

      if (!payload.username || !payload.password) {
        setStatus({ state: 'error', message: 'Usuario y contraseña son requeridos.' });
        setSavingUser(false);
        return;
      }

      if (payload.role === 'BARBER') {
        const { nombre, horarioInicio, horarioFin, duracionCita, diasLaborales, horariosEspeciales } = userForm.barberoProfile;
        payload.barberoProfile = {
          nombre: nombre.trim(),
          horarioInicio,
          horarioFin,
          duracionCita: Number(duracionCita),
          diasLaborales,
          horariosEspeciales,
        };
        if (!payload.barberoProfile.nombre) {
          setStatus({ state: 'error', message: 'Debes indicar el nombre del profesional.' });
          setSavingUser(false);
          return;
        }
        if (!payload.barberoProfile.diasLaborales.length) {
          setStatus({ state: 'error', message: 'Selecciona los días laborales del profesional.' });
          setSavingUser(false);
          return;
        }
        if (!payload.barberoProfile.horarioInicio || !payload.barberoProfile.horarioFin) {
          setStatus({ state: 'error', message: 'Completa el horario de servicio del profesional.' });
          setSavingUser(false);
          return;
        }
        if (!Number.isFinite(payload.barberoProfile.duracionCita) || payload.barberoProfile.duracionCita <= 0) {
          setStatus({ state: 'error', message: 'Define una duración base válida.' });
          setSavingUser(false);
          return;
        }
      }

      const { data } = await api.post('/users', payload);
      setUsers((prev) => [data, ...prev]);
      setUserForm(createInitialUserForm());
      if (payload.role === 'BARBER') {
        await loadBarberos();
      }
      setStatus({ state: 'success', message: 'Usuario creado correctamente.' });
      setIsCreateUserModalOpen(false);
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
      if (selectedBarberUserId === id) {
        closeBarberProfileEditor();
      }
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
    return [{ value: '', label: 'Todos los profesionales' }, ...base];
  }, [barberos]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-emerald-500/5 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-emerald-500/10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-600/70 dark:text-emerald-300/70">Agenda Octane</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Panel de administración</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Gestiona la agenda, usuarios y la información clave del estudio desde una vista unificada.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-800 dark:text-emerald-100">
            <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-600/80 dark:text-emerald-300/80">
              <ShieldCheck className="h-4 w-4" /> Sesión activa
            </span>
            <span className="text-base font-semibold text-slate-900 dark:text-white">{user?.username}</span>
            <span className="text-xs uppercase tracking-[0.3em] text-emerald-600/70 dark:text-emerald-300/70">Rol · {user?.role}</span>
            {user?.barberoNombre && (
              <span className="text-xs text-emerald-700/80 dark:text-emerald-200/80">Asignado a: {user.barberoNombre}</span>
            )}
          </div>
        </div>
        {isAdmin && (
          <div className="mt-6 flex flex-wrap gap-3">
            {[ 
              { id: 'agenda', label: 'Agenda', icon: <Calendar className="h-4 w-4" /> },
              { id: 'usuarios', label: 'Usuarios', icon: <Users className="h-4 w-4" /> },
              { id: 'servicios', label: 'Servicios', icon: <Scissors className="h-4 w-4" /> },
              { id: 'negocio', label: 'Negocio', icon: <Settings className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${
                  activeTab === tab.id
                    ? 'border-emerald-400 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
                    : 'border-slate-200 text-slate-500 hover:border-emerald-400/60 hover:text-emerald-600 dark:border-slate-700/70 dark:text-slate-400 dark:hover:text-emerald-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {business.whatsapp_pending_setup === 'true' && (
        <Alert type="warning">
          <div className="flex flex-col gap-2">
            <span className="font-bold">⚠️ Configuración de WhatsApp pendiente</span>
            <p>
              El proveedor de WhatsApp reportó que no hay un número vinculado. 
              Por favor, ve a tu panel de proveedor (Shessai) y escanea el código QR para conectar tu WhatsApp.
            </p>
            <div className="flex flex-wrap gap-2">
              <a 
                href="https://app.shessai.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="rounded-lg bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-500/30 dark:text-blue-200"
              >
                Ir a Shessai ↗
              </a>
              <button 
                onClick={async () => {
                  try {
                    await api.put('/business', { ...business, whatsapp_pending_setup: 'false' });
                    setBusiness(prev => ({ ...prev, whatsapp_pending_setup: 'false' }));
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="rounded-lg bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-700 hover:bg-yellow-500/30 dark:text-yellow-200"
              >
                Ya lo solucioné / Ocultar aviso
              </button>
            </div>
          </div>
        </Alert>
      )}

      {status.state !== 'idle' && <Alert type={status.state}>{status.message}</Alert>}

      {(activeTab === 'agenda' || !isAdmin) && (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/80">
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Citas del periodo</span>
                <Calendar className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{metrics.total}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/80">
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Confirmadas</span>
                <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-emerald-600 dark:text-emerald-300">{metrics.confirmadas}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/80">
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Ingresos estimados</span>
                <DollarSign className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-emerald-600 dark:text-emerald-300">
                ${metrics.ingresos.toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/80">
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Duración promedio</span>
                <Clock className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{metrics.duracionPromedio} min</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Filters and Actions Bar */}
            {/* Filters and Actions Bar */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between dark:border-slate-800/80 dark:bg-slate-900/80">
              <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                     <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Filtros de visualización</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Selecciona qué citas ver</p>
                  </div>
                </div>
                
                <div className="h-8 w-px bg-slate-800 hidden md:block"></div>

                {isAdmin ? (
                  <div className="w-full md:w-64">
                    <SelectField
                      options={barberoOptions}
                      value={selectedBarbero}
                      onChange={setSelectedBarbero}
                      placeholder="Todos los profesionales"
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-200">
                    Vista de profesional: <strong>{user?.username}</strong>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => loadCitas(isAdmin ? selectedBarbero : '')}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 transition hover:bg-emerald-500 hover:text-white hover:border-emerald-500 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-300"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Actualizar
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900/80">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Agenda semanal</h3>
                <span className="text-xs uppercase tracking-[0.3em] text-emerald-600/70 dark:text-emerald-300/70">FullCalendar</span>
              </div>
              
              <style>{`
                .fc-custom-theme {
                  --fc-border-color: #e2e8f0;
                  --fc-page-bg-color: transparent;
                  --fc-neutral-bg-color: transparent;
                  --fc-list-event-hover-bg-color: #f1f5f9;
                  --fc-today-bg-color: rgba(16, 185, 129, 0.05) !important;
                }
                .dark .fc-custom-theme {
                  --fc-border-color: #1e293b;
                  --fc-list-event-hover-bg-color: #1e293b;
                }
                .fc-custom-theme .fc-col-header-cell {
                  background-color: #f8fafc;
                  padding: 12px 0;
                  border-bottom: 1px solid #e2e8f0;
                }
                .dark .fc-custom-theme .fc-col-header-cell {
                  background-color: #0f172a;
                  border-bottom: 1px solid #334155;
                }
                .fc-custom-theme .fc-timegrid-slot {
                  height: 48px !important; 
                }
                .fc-custom-theme .fc-timegrid-slot-label {
                  font-size: 0.75rem;
                  color: #64748b;
                  font-weight: 500;
                }
                .dark .fc-custom-theme .fc-timegrid-slot-label {
                  color: #94a3b8;
                }
                .fc-custom-theme .fc-event {
                  border: none;
                  border-radius: 6px;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                .fc-custom-theme .fc-event-confirmed {
                  background: linear-gradient(135deg, #059669 0%, #047857 100%);
                  border-left: 3px solid #34d399;
                }
                .fc-custom-theme .fc-event-pending {
                  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
                  border-left: 3px solid #fbbf24;
                }
                .fc-custom-theme .fc-event-cancelled {
                  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
                  border-left: 3px solid #fca5a5;
                  opacity: 0.7;
                }
                .fc-chip-day {
                  display: block;
                  font-size: 0.7rem;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  color: #64748b;
                  margin-bottom: 2px;
                }
                .fc-chip-date {
                  display: block;
                  font-size: 1.25rem;
                  font-weight: 700;
                  color: #0f172a;
                }
                .dark .fc-chip-date {
                  color: #f8fafc;
                }
                .fc-custom-theme .fc-day-today .fc-chip-date {
                  color: #059669;
                }
                .dark .fc-custom-theme .fc-day-today .fc-chip-date {
                  color: #34d399;
                }
                .fc-custom-theme .fc-day-today .fc-chip-day {
                  color: #059669;
                }
                .dark .fc-custom-theme .fc-day-today .fc-chip-day {
                  color: #34d399;
                }
                /* Remove default ugly borders */
                .fc-theme-standard td, .fc-theme-standard th {
                  border-color: #e2e8f0;
                }
                .dark .fc-theme-standard td, .dark .fc-theme-standard th {
                  border-color: #1e293b;
                }
                .fc-timegrid-now-indicator-line {
                  border-color: #ef4444;
                  border-width: 2px;
                }
                .fc-timegrid-now-indicator-arrow {
                  border-color: #ef4444;
                  border-width: 6px;
                }
                
                /* Modern Toolbar Buttons */
                .fc-custom-theme .fc-button {
                  background-color: #f1f5f9;
                  border: 1px solid #e2e8f0;
                  color: #475569;
                  text-transform: uppercase;
                  font-size: 0.75rem;
                  font-weight: 600;
                  letter-spacing: 0.05em;
                  padding: 0.5rem 1rem;
                  border-radius: 0.75rem;
                  transition: all 0.2s;
                  box-shadow: none;
                }
                .dark .fc-custom-theme .fc-button {
                  background-color: #1e293b;
                  border: 1px solid #334155;
                  color: #cbd5e1;
                }
                .fc-custom-theme .fc-button:hover {
                  background-color: #e2e8f0;
                  border-color: #cbd5e1;
                  color: #1e293b;
                }
                .dark .fc-custom-theme .fc-button:hover {
                  background-color: #334155;
                  border-color: #475569;
                  color: #f8fafc;
                }
                .fc-custom-theme .fc-button-primary:not(:disabled).fc-button-active,
                .fc-custom-theme .fc-button-primary:not(:disabled):active {
                  background-color: rgba(16, 185, 129, 0.1);
                  border-color: rgba(16, 185, 129, 0.5);
                  color: #059669;
                  box-shadow: none;
                }
                .dark .fc-custom-theme .fc-button-primary:not(:disabled).fc-button-active,
                .dark .fc-custom-theme .fc-button-primary:not(:disabled):active {
                  color: #34d399;
                }
                .fc-custom-theme .fc-button:focus {
                  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
                }
                .fc-custom-theme .fc-toolbar-title {
                  font-size: 1rem;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  font-weight: 800;
                  color: #1e293b;
                }
                .dark .fc-custom-theme .fc-toolbar-title {
                  color: #e2e8f0;
                }
                .fc-custom-theme .fc-list-day-cushion {
                  background-color: #f8fafc !important;
                }
                .dark .fc-custom-theme .fc-list-day-cushion {
                  background-color: #0f172a !important;
                }
                .fc-custom-theme .fc-list-event:hover td {
                  background-color: #f1f5f9 !important;
                }
                .dark .fc-custom-theme .fc-list-event:hover td {
                  background-color: #1e293b !important;
                }
              `}</style>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white/50 p-2 fc-custom-theme dark:border-slate-800/60 dark:bg-slate-950/40">
                {isMobile && (
                  <div className="mb-4 text-center">
                    <h2 className="text-lg font-extrabold uppercase tracking-widest text-slate-900 dark:text-white">
                      {calendarTitle}
                    </h2>
                  </div>
                )}
                <FullCalendar
                  key={isMobile ? 'mobile' : 'desktop'}
                  height="auto"
                  locale={esLocale}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                  initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
                  headerToolbar={{
                    left: isMobile ? 'prev,next' : 'prev,next today',
                    center: isMobile ? '' : 'title',
                    right: isMobile ? 'timeGridDay,listWeek' : 'dayGridMonth,timeGridWeek,timeGridDay',
                  }}
                  titleFormat={
                    isMobile
                      ? { year: 'numeric', month: 'long', day: 'numeric' }
                      : { year: 'numeric', month: 'long', day: 'numeric' }
                  }
                  datesSet={(arg) => setCalendarTitle(arg.view.title)}
                  slotMinTime="08:00:00"
                  slotMaxTime="20:00:00"
                  allDaySlot={false}
                  slotDuration="00:30:00"
                  slotLabelInterval="01:00"
                  expandRows={true}
                  stickyHeaderDates={true}
                  dayHeaderContent={dayHeaderContent}
                  slotLabelContent={slotLabelContent}
                  events={events}
                  eventContent={renderEventContent}
                  eventClassNames={eventClassNames}
                  editable={true}
                  eventDrop={handleEventDrop}
                  eventClick={(info) => {
                    const action = window.prompt(
                      'Escribe "cancelar" para cancelar o "reprogramar" para cambiar fecha/hora.'
                    );
                    if (action?.toLowerCase() === 'cancelar') handleCancel(info.event.id);
                    if (action?.toLowerCase() === 'reprogramar')
                      handleReschedule({
                        id: info.event.id,
                        fecha: info.event.start.toISOString(),
                        hora: info.event.start.toTimeString().slice(0, 5),
                      });
                  }}
                />
              </div>
            </div>
          </div>

              {loading && (
                <p className="mt-4 text-sm text-slate-400">Cargando agenda...</p>
              )}
              <div className="mt-6">
                {isMobile ? (
                  <div className="space-y-4">
                    {citas.length === 0 ? (
                      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-6 text-center text-slate-500">
                        No hay citas registradas para este filtro.
                      </div>
                    ) : (
                      citas.map((cita) => (
                        <div key={cita.id} className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-lg shadow-emerald-500/5">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-lg font-bold text-white">{cita.cliente}</h4>
                              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                                {cita.servicios && cita.servicios.length > 0 
                                    ? cita.servicios.map(s => s.servicio.nombre).join(' + ')
                                    : cita.servicio.nombre}
                              </p>
                            </div>
                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                              {cita.estado}
                            </span>
                          </div>
                          
                          <div className="mt-4 space-y-2 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Profesional:</span>
                              <span className="text-slate-200">{cita.barbero.nombre}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Fecha:</span>
                              <span className="text-slate-200">{cita.fecha.split('T')[0]}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Hora:</span>
                              <span className="text-slate-200">{cita.hora}</span>
                            </div>
                          </div>

                          <div className="mt-5 flex gap-3 border-t border-slate-800/60 pt-4">
                            <button
                              type="button"
                              onClick={() => handleReschedule(cita)}
                              className="flex-1 rounded-xl border border-slate-700/70 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 transition hover:border-emerald-400/60 hover:text-emerald-200"
                            >
                              Reprogramar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancel(cita.id)}
                              className="flex-1 rounded-xl border border-rose-500/30 py-2 text-xs font-semibold uppercase tracking-wider text-rose-300 transition hover:border-rose-400 hover:text-rose-200"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Cliente</th>
                          <th className="px-4 py-3">Profesional</th>
                          <th className="px-4 py-3">Servicio</th>
                          <th className="px-4 py-3">Fecha</th>
                          <th className="px-4 py-3">Hora</th>
                          <th className="px-4 py-3">Estado</th>
                          <th className="px-4 py-3">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
                        {citas.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                              No hay citas registradas para este filtro.
                            </td>
                          </tr>
                        ) : (
                          citas.map((cita) => (
                            <tr key={cita.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="px-4 py-3 text-slate-900 dark:text-white">{cita.cliente}</td>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{cita.barbero.nombre}</td>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                {cita.servicios && cita.servicios.length > 0 
                                    ? cita.servicios.map(s => s.servicio.nombre).join(' + ')
                                    : cita.servicio.nombre}
                              </td>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{cita.fecha.split('T')[0]}</td>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{cita.hora}</td>
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
                )}
              </div>
        </div>
      )}

      {isAdmin && activeTab === 'usuarios' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900/80">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <Users className="h-5 w-5 text-emerald-400" /> Usuarios registrados
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-emerald-600"
                >
                  <UserPlus className="h-4 w-4" /> Nuevo usuario
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs uppercase tracking-widest text-slate-600 transition hover:border-emerald-400/60 hover:text-emerald-600 dark:border-slate-700/70 dark:text-slate-300 dark:hover:text-emerald-200"
                >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPasswords ? 'Ocultar' : 'Mostrar'} contraseñas
              </button>
            </div>
          </div>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800/80">
              <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">Contraseña</th>
                    <th className="px-4 py-3">Perfil profesional</th>
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
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3 text-slate-900 dark:text-white">{item.username}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{item.role}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{item.telefono || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs text-emerald-600 dark:text-emerald-200">
                          {showPasswords ? item.password : '••••••••'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {item.role === 'BARBER' ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {item.barberoProfile?.nombre || 'Sin asignar'}
                              </span>
                              <span
                                className={`text-xs uppercase tracking-widest ${
                                  item.barberoProfile
                                    ? 'text-emerald-600 dark:text-emerald-300'
                                    : 'text-amber-600 dark:text-amber-300'
                                }`}
                              >
                                {item.barberoProfile ? 'Perfil completo' : 'Perfil pendiente'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500">No aplica</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="flex flex-wrap gap-2">
                            {item.role === 'BARBER' && (
                              <button
                                type="button"
                                onClick={() => openBarberProfileEditor(item)}
                                className="rounded-full border border-emerald-500/50 px-3 py-1 text-emerald-600 transition hover:bg-emerald-500/10 dark:border-emerald-400/60 dark:text-emerald-200 dark:hover:border-emerald-300 dark:hover:text-emerald-100"
                              >
                                Configurar perfil
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleResetPassword(item)}
                              className="rounded-full border border-slate-300 px-3 py-1 text-slate-600 transition hover:border-emerald-400/60 hover:text-emerald-600 dark:border-slate-700/70 dark:text-slate-300 dark:hover:text-emerald-200"
                            >
                              Reset pass
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditPhone(item)}
                              className="rounded-full border border-slate-300 px-3 py-1 text-slate-600 transition hover:border-emerald-400/60 hover:text-emerald-600 dark:border-slate-700/70 dark:text-slate-300 dark:hover:text-emerald-200"
                            >
                              Editar teléfono
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(item.id)}
                              className="rounded-full border border-rose-300 px-3 py-1 text-rose-600 transition hover:border-rose-400 hover:text-rose-700 dark:border-rose-500/40 dark:text-rose-300 dark:hover:text-rose-200"
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
          {selectedBarberUserId && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900/80">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                  <Edit3 className="h-5 w-5 text-emerald-400" /> Configurar perfil profesional
                </h3>
                <button
                  type="button"
                  onClick={closeBarberProfileEditor}
                  className="flex items-center gap-2 rounded-full border border-slate-700/70 px-3 py-1 text-xs uppercase tracking-widest text-slate-300 transition hover:border-rose-400/60 hover:text-rose-200"
                >
                  <XCircle className="h-4 w-4" /> Cerrar
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Ajusta los parámetros del profesional para alinear su agenda con los servicios disponibles.
              </p>
              <form onSubmit={handleSaveBarberProfile} className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Nombre del profesional</label>
                    <input
                      value={barberProfileForm.nombre}
                      onChange={(event) => handleBarberProfileFormChange('nombre', event.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      placeholder="Carlos Hernández"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Duración base (min)</label>
                    <input
                      type="number"
                      min={10}
                      step={5}
                      value={barberProfileForm.duracionCita}
                      onChange={(event) => handleBarberProfileFormChange('duracionCita', event.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Horario inicio</label>
                    <input
                      type="time"
                      value={barberProfileForm.horarioInicio}
                      onChange={(event) => handleBarberProfileFormChange('horarioInicio', event.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Horario fin</label>
                    <input
                      type="time"
                      value={barberProfileForm.horarioFin}
                      onChange={(event) => handleBarberProfileFormChange('horarioFin', event.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Días laborables</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {dayOptions.map((day) => {
                        const active = barberProfileForm.diasLaborales.includes(day.value);
                        const hasSpecial = !!barberProfileForm.horariosEspeciales?.[day.value];
                        return (
                          <div key={day.value} className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleBarberProfileDayToggle(day.value)}
                              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                active
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/60'
                                  : 'border border-slate-700/70 text-slate-400 hover:border-emerald-400/60 hover:text-emerald-200'
                              }`}
                            >
                              {day.label}
                            </button>
                            {active && (
                              <button
                                type="button"
                                onClick={() => handleBarberProfileSpecialScheduleToggle(day.value)}
                                className={`rounded-full px-2 py-1 text-xs transition ${
                                  hasSpecial
                                    ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-400/60'
                                    : 'text-slate-500 border border-slate-700/50 hover:text-emerald-300 hover:border-emerald-400/40'
                                }`}
                                title={hasSpecial ? 'Quitar horario especial' : 'Agregar horario especial'}
                              >
                                {hasSpecial ? '⏰' : '+'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {barberProfileForm.diasLaborales.some((d) => barberProfileForm.horariosEspeciales?.[d]) && (
                      <div className="mt-3 space-y-2">
                        {barberProfileForm.diasLaborales.filter((d) => barberProfileForm.horariosEspeciales?.[d]).map((dayValue) => {
                          const dayLabel = dayOptions.find((d) => d.value === dayValue)?.label;
                          const special = barberProfileForm.horariosEspeciales[dayValue];
                          return (
                            <div key={dayValue} className="flex items-center gap-2">
                              <span className="w-20 text-xs font-semibold text-emerald-400">{dayLabel}</span>
                              <input
                                type="time"
                                value={special.inicio}
                                onChange={(e) => handleBarberProfileSpecialScheduleChange(dayValue, 'inicio', e.target.value)}
                                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white focus:border-emerald-400 focus:outline-none"
                              />
                              <span className="text-xs text-slate-500">–</span>
                              <input
                                type="time"
                                value={special.fin}
                                onChange={(e) => handleBarberProfileSpecialScheduleChange(dayValue, 'fin', e.target.value)}
                                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white focus:border-emerald-400 focus:outline-none"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeBarberProfileEditor}
                    className="flex items-center gap-2 rounded-full border border-slate-700/70 px-4 py-2 text-xs uppercase tracking-widest text-slate-300 transition hover:border-rose-400/60 hover:text-rose-200"
                  >
                    <XCircle className="h-4 w-4" /> Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingBarberProfile}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-950 transition hover:from-emerald-400 hover:to-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" /> {savingBarberProfile ? 'Guardando...' : 'Guardar perfil'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <Modal
            isOpen={isCreateUserModalOpen}
            onClose={() => setIsCreateUserModalOpen(false)}
            title="Nuevo usuario"
            maxWidth="max-w-2xl"
          >
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              Los accesos permiten diferenciar entre administradores y profesionales. Las contraseñas se almacenan cifradas, pero como administrador puedes consultarlas desde esta vista.
            </p>
            <form onSubmit={handleCreateUser} className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Usuario</label>
                <input
                  name="username"
                  value={userForm.username}
                  onChange={handleUserFormChange}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="profesional01"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Contraseña</label>
                <input
                  name="password"
                  value={userForm.password}
                  onChange={handleUserFormChange}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="********"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Teléfono</label>
                <input
                  name="telefono"
                  value={userForm.telefono}
                  onChange={handleUserFormChange}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="+52 555 010 1234"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Rol</label>
                <select
                  name="role"
                  value={userForm.role}
                  onChange={handleUserFormChange}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="BARBER">Profesional</option>
                </select>
              </div>
              {userForm.role === 'BARBER' && (
                <div className="md:col-span-2 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800/70 dark:bg-slate-950/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-300">
                        <ShieldCheck className="h-4 w-4" /> Perfil profesional
                      </h4>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        Define el horario base y los días laborables para habilitar la agenda de este perfil.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Nombre completo</label>
                      <input
                        value={userForm.barberoProfile.nombre}
                        onChange={(event) => handleUserBarberFieldChange('nombre', event.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        placeholder="Carlos Hernández"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Duración base (min)</label>
                      <input
                        type="number"
                        min={10}
                        step={5}
                        value={userForm.barberoProfile.duracionCita}
                        onChange={(event) => handleUserBarberFieldChange('duracionCita', event.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Horario inicio</label>
                      <input
                        type="time"
                        value={userForm.barberoProfile.horarioInicio}
                        onChange={(event) => handleUserBarberFieldChange('horarioInicio', event.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Horario fin</label>
                      <input
                        type="time"
                        value={userForm.barberoProfile.horarioFin}
                        onChange={(event) => handleUserBarberFieldChange('horarioFin', event.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Días laborables</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {dayOptions.map((day) => {
                          const active = userForm.barberoProfile.diasLaborales.includes(day.value);
                          const hasSpecial = !!userForm.barberoProfile.horariosEspeciales?.[day.value];
                          return (
                            <div key={day.value} className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUserBarberDayToggle(day.value)}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                  active
                                    ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/50 dark:text-emerald-300 dark:border-emerald-400/60'
                                    : 'border border-slate-300 text-slate-600 hover:border-emerald-400/60 hover:text-emerald-600 dark:border-slate-700/70 dark:text-slate-400 dark:hover:text-emerald-200'
                                }`}
                              >
                                {day.label}
                              </button>
                              {active && (
                                <button
                                  type="button"
                                  onClick={() => handleUserBarberSpecialScheduleToggle(day.value)}
                                  className={`rounded-full px-2 py-1 text-xs transition ${
                                    hasSpecial
                                      ? 'text-emerald-600 bg-emerald-500/20 border border-emerald-500/50 dark:text-emerald-300 dark:border-emerald-400/60'
                                      : 'text-slate-400 border border-slate-300 hover:text-emerald-600 hover:border-emerald-400/60 dark:border-slate-700/50 dark:hover:text-emerald-300'
                                  }`}
                                  title={hasSpecial ? 'Quitar horario especial' : 'Agregar horario especial'}
                                >
                                  {hasSpecial ? '⏰' : '+'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {userForm.barberoProfile.diasLaborales.some((d) => userForm.barberoProfile.horariosEspeciales?.[d]) && (
                        <div className="mt-3 space-y-2">
                          {userForm.barberoProfile.diasLaborales.filter((d) => userForm.barberoProfile.horariosEspeciales?.[d]).map((dayValue) => {
                            const dayLabel = dayOptions.find((d) => d.value === dayValue)?.label;
                            const special = userForm.barberoProfile.horariosEspeciales[dayValue];
                            return (
                              <div key={dayValue} className="flex items-center gap-2">
                                <span className="w-20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{dayLabel}</span>
                                <input
                                  type="time"
                                  value={special.inicio}
                                  onChange={(e) => handleUserBarberSpecialScheduleChange(dayValue, 'inicio', e.target.value)}
                                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-900 focus:border-emerald-400 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                                <span className="text-xs text-slate-400">–</span>
                                <input
                                  type="time"
                                  value={special.fin}
                                  onChange={(e) => handleUserBarberSpecialScheduleChange(dayValue, 'fin', e.target.value)}
                                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-900 focus:border-emerald-400 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
          </Modal>
        </div>
      )}

      {isAdmin && activeTab === 'servicios' && (
        <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900/80">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <Scissors className="h-5 w-5 text-emerald-400" /> {editingServiceId ? 'Editar servicio' : 'Nuevo servicio'}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Administra los servicios disponibles manteniendo actualizados sus precios y duraciones.
            </p>
            <form onSubmit={handleSubmitService} className="mt-6 space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Nombre</label>
                <input
                  name="nombre"
                  value={serviceForm.nombre}
                  onChange={handleServiceFormChange}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="Corte premium"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Duración (min)</label>
                  <input
                    type="number"
                    min={10}
                    step={5}
                    name="duracion"
                    value={serviceForm.duracion}
                    onChange={handleServiceFormChange}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Precio (MXN)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    name="precio"
                    value={serviceForm.precio}
                    onChange={handleServiceFormChange}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                {editingServiceId && (
                  <button
                    type="button"
                    onClick={handleCancelServiceEdit}
                    className="flex items-center gap-2 rounded-full border border-slate-700/70 px-4 py-2 text-xs uppercase tracking-widest text-slate-300 transition hover:border-rose-400/60 hover:text-rose-200"
                  >
                    <XCircle className="h-4 w-4" /> Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingService}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-950 transition hover:from-emerald-400 hover:to-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" /> {savingService ? 'Guardando...' : editingServiceId ? 'Actualizar servicio' : 'Crear servicio'}
                </button>
              </div>
            </form>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <ListChecks className="h-5 w-5 text-emerald-400" /> Servicios disponibles
              </h3>
              <span className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">{services.length} activos</span>
            </div>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800/80">
              <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Servicio</th>
                    <th className="px-4 py-3">Duración</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {services.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                        No hay servicios registrados.
                      </td>
                    </tr>
                  ) : (
                    services.map((service) => (
                      <tr key={service.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3 text-slate-900 dark:text-white">{service.nombre}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{service.duracion} min</td>
                        <td className="px-4 py-3 text-emerald-600 dark:text-emerald-300">{formatCurrency(service.precio)}</td>
                        <td className="px-4 py-3 text-xs">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditService(service)}
                              className="rounded-full border border-slate-300 px-3 py-1 text-slate-600 transition hover:border-emerald-400/60 hover:text-emerald-600 dark:border-slate-700/70 dark:text-slate-300 dark:hover:text-emerald-200"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteService(service)}
                              className="rounded-full border border-rose-300 px-3 py-1 text-rose-600 transition hover:border-rose-400 hover:text-rose-700 dark:border-rose-500/40 dark:text-rose-300 dark:hover:text-rose-200"
                            >
                              <Trash2 className="mr-1 h-3.5 w-3.5" /> Eliminar
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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900/80">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <Building className="h-5 w-5 text-emerald-400" /> Información general
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Actualiza los datos visibles en comunicaciones y recordatorios automáticos.
            </p>
            <form onSubmit={handleSaveBusiness} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Nombre comercial</label>
                <input
                  name="businessName"
                  value={business.businessName}
                  onChange={handleBusinessChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="Agenda Octane Studio"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Teléfono principal</label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <input
                    name="businessPhone"
                    value={business.businessPhone}
                    onChange={handleBusinessChange}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-white"
                    placeholder="+52 555 010 7777"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Dirección</label>
                <textarea
                  name="businessAddress"
                  value={business.businessAddress}
                  onChange={handleBusinessChange}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="Av. Revolución 123, CDMX"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Número remitente de WhatsApp</label>
                <input
                  name="whatsappSender"
                  value={business.whatsappSender}
                  onChange={handleBusinessChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="+52 555 010 8888"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">Token de WhatsApp (GratbeLabs)</label>
                <div className="relative mt-2">
                    <input
                    type={showPasswords ? "text" : "password"}
                    name="whatsappToken"
                    value={business.whatsappToken || ''}
                    onChange={handleBusinessChange}
                    placeholder="Pegar token aquí..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Token de autenticación proporcionado por GratbeLabs. Necesario para enviar mensajes.
                </p>
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

          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900/80">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Contexto operativo</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Mantén esta información actualizada para compartirla con tu equipo y garantizar que los recordatorios automáticos contengan datos correctos.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
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
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500 dark:border-slate-800/60 dark:bg-slate-950/40 dark:text-slate-400">
              <p className="font-semibold text-slate-900 dark:text-white">Consejo</p>
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
