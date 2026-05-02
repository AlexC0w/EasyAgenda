import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, Scissors, CalendarCheck, Search, Plus,
  ChevronRight, X, Save, AlertTriangle, CheckCircle, RefreshCw,
  Power, PowerOff, KeyRound, Wifi, LogOut, ArrowLeft,
} from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import Alert from '../components/Alert.jsx';

const GIROS = ['Barbería', 'Salón de belleza', 'Spa', 'Clínica', 'Consultorio', 'Fumigación', 'Otro'];

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
    status === 'ACTIVE'
      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
  }`}>
    {status === 'ACTIVE' ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
    {status === 'ACTIVE' ? 'Activo' : 'Suspendido'}
  </span>
);

const StatCard = ({ icon: Icon, label, value, color = 'emerald' }) => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-3">
    <div className={`rounded-lg bg-${color}-500/15 p-2`}>
      <Icon className={`h-4 w-4 text-${color}-400`} />
    </div>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  </div>
);

export default function SuperAdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // Edit forms
  const [infoForm, setInfoForm] = useState({ name: '', slug: '', giro: '' });
  const [waForm, setWaForm] = useState({ whatsappSender: '', whatsappToken: '' });
  const [newPassword, setNewPassword] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingWa, setSavingWa] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Create business modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    businessName: '', slug: '', giro: 'Barbería',
    adminUsername: '', adminPassword: '', adminTelefono: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user?.role !== 'SUPERADMIN') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const loadBusinesses = async () => {
    try {
      const { data } = await api.get('/superadmin/businesses');
      setBusinesses(data);
    } catch {
      setStatus({ type: 'error', message: 'Error cargando negocios.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBusinesses(); }, []);

  const openDetail = async (b) => {
    setSelected(null);
    setDetailLoading(true);
    setNewPassword('');
    setStatus(null);
    try {
      const { data } = await api.get(`/superadmin/businesses/${b.id}`);
      setSelected(data);
      setInfoForm({ name: data.name, slug: data.slug, giro: data.giro });
      setWaForm({
        whatsappSender: data.settings?.whatsappSender || '',
        whatsappToken: data.settings?.whatsappToken || '',
      });
    } catch {
      setStatus({ type: 'error', message: 'Error cargando detalle.' });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    try {
      const { data } = await api.patch(`/superadmin/businesses/${selected.id}`, infoForm);
      setSelected((prev) => ({ ...prev, ...data }));
      setBusinesses((prev) => prev.map((b) => b.id === data.id ? { ...b, ...data } : b));
      setStatus({ type: 'success', message: 'Información actualizada.' });
    } catch (e) {
      setStatus({ type: 'error', message: e.response?.data?.message || 'Error al guardar.' });
    } finally {
      setSavingInfo(false);
    }
  };

  const handleSaveWa = async () => {
    setSavingWa(true);
    try {
      await api.patch(`/superadmin/businesses/${selected.id}/settings`, waForm);
      setSelected((prev) => ({ ...prev, settings: { ...prev.settings, ...waForm } }));
      setStatus({ type: 'success', message: 'WhatsApp actualizado.' });
    } catch (e) {
      setStatus({ type: 'error', message: e.response?.data?.message || 'Error al guardar.' });
    } finally {
      setSavingWa(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = selected.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`¿${newStatus === 'SUSPENDED' ? 'Suspender' : 'Activar'} "${selected.name}"?`)) return;
    setTogglingStatus(true);
    try {
      const { data } = await api.patch(`/superadmin/businesses/${selected.id}/status`, { status: newStatus });
      setSelected((prev) => ({ ...prev, status: data.status }));
      setBusinesses((prev) => prev.map((b) => b.id === data.id ? { ...b, status: data.status } : b));
      setStatus({ type: 'success', message: `Negocio ${newStatus === 'ACTIVE' ? 'activado' : 'suspendido'}.` });
    } catch (e) {
      setStatus({ type: 'error', message: e.response?.data?.message || 'Error.' });
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) return;
    if (!window.confirm(`¿Resetear contraseña del admin de "${selected.name}"?`)) return;
    setSavingPwd(true);
    try {
      await api.patch(`/superadmin/businesses/${selected.id}/reset-password`, { newPassword });
      setNewPassword('');
      setStatus({ type: 'success', message: 'Contraseña actualizada.' });
    } catch (e) {
      setStatus({ type: 'error', message: e.response?.data?.message || 'Error.' });
    } finally {
      setSavingPwd(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post('/superadmin/businesses', {
        ...createForm,
        adminTelefono: createForm.adminTelefono || undefined,
      });
      setBusinesses((prev) => [data, ...prev]);
      setCreateOpen(false);
      setCreateForm({ businessName: '', slug: '', giro: 'Barbería', adminUsername: '', adminPassword: '', adminTelefono: '' });
      setStatus({ type: 'success', message: `Negocio "${data.name}" creado correctamente.` });
    } catch (e) {
      setStatus({ type: 'error', message: e.response?.data?.message || 'Error al crear.' });
    } finally {
      setCreating(false);
    }
  };

  const filtered = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/20 p-2">
              <Building2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Super Admin</h1>
              <p className="text-xs text-slate-400">Panel de plataforma</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{user?.username}</span>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition hover:border-rose-500/50 hover:text-rose-400"
            >
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 p-6">
        {/* Left: business list — hidden on mobile when detail is open */}
        <div className={`flex flex-col gap-4 transition-all duration-300 ${selected ? 'hidden lg:flex lg:w-2/5' : 'w-full'}`}>
          {status && (
            <Alert
              type={status.type}
              message={status.message}
              onClose={() => setStatus(null)}
            />
          )}

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nombre o slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              <Plus className="h-4 w-4" /> Nuevo
            </button>
            <button
              onClick={loadBusinesses}
              className="rounded-xl border border-slate-700 p-2.5 text-slate-400 transition hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <p className="text-center text-sm text-slate-500 py-10">Cargando...</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((b) => (
                <button
                  key={b.id}
                  onClick={() => openDetail(b)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selected?.id === b.id
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-slate-700/60 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-slate-700/60 p-2">
                        <Building2 className="h-4 w-4 text-slate-300" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{b.name}</p>
                        <p className="text-xs text-slate-400">/{b.slug} · {b.giro}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={b.status} />
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{b.stats?.totalUsuarios ?? 0} usuarios</span>
                    <span className="flex items-center gap-1"><CalendarCheck className="h-3 w-3" />{b.stats?.totalCitas ?? 0} citas</span>
                    <span className="flex items-center gap-1"><Scissors className="h-3 w-3" />{b.stats?.totalServicios ?? 0} servicios</span>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-10">No se encontraron negocios.</p>
              )}
            </div>
          )}
        </div>

        {/* Right: detail panel — full width on mobile, side panel on desktop */}
        {(selected || detailLoading) && (
          <div className="flex flex-1 flex-col gap-4 animate-in slide-in-from-right-4 duration-200">
            {detailLoading ? (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900">
                <p className="text-sm text-slate-500">Cargando detalle...</p>
              </div>
            ) : selected && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelected(null)} className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:text-white">
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                      <p className="text-sm text-slate-400">/{selected.slug} · {selected.giro}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selected.status} />
                    <button onClick={() => setSelected(null)} className="hidden lg:block rounded-lg p-1.5 text-slate-500 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  <StatCard icon={CalendarCheck} label="Total citas" value={selected.stats?.totalCitas ?? 0} />
                  <StatCard icon={CheckCircle} label="Confirmadas" value={selected.stats?.citasConfirmadas ?? 0} color="emerald" />
                  <StatCard icon={AlertTriangle} label="Pendientes" value={selected.stats?.citasPendientes ?? 0} color="amber" />
                  <StatCard icon={X} label="Canceladas" value={selected.stats?.citasCanceladas ?? 0} color="rose" />
                  <StatCard icon={Users} label="Usuarios" value={selected.stats?.totalUsuarios ?? 0} color="blue" />
                  <StatCard icon={Scissors} label="Servicios" value={selected.stats?.totalServicios ?? 0} color="purple" />
                </div>

                {/* Info edit */}
                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-200">Información del negocio</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Nombre</label>
                      <input
                        value={infoForm.name}
                        onChange={(e) => setInfoForm((p) => ({ ...p, name: e.target.value }))}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Slug</label>
                      <input
                        value={infoForm.slug}
                        onChange={(e) => setInfoForm((p) => ({ ...p, slug: e.target.value }))}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Giro</label>
                      <select
                        value={infoForm.giro}
                        onChange={(e) => setInfoForm((p) => ({ ...p, giro: e.target.value }))}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      >
                        {GIROS.map((g) => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveInfo}
                    disabled={savingInfo}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" /> {savingInfo ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>

                {/* WhatsApp */}
                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <Wifi className="h-4 w-4 text-emerald-400" /> WhatsApp
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Sender (número)</label>
                      <input
                        value={waForm.whatsappSender}
                        onChange={(e) => setWaForm((p) => ({ ...p, whatsappSender: e.target.value }))}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Token</label>
                      <input
                        value={waForm.whatsappToken}
                        onChange={(e) => setWaForm((p) => ({ ...p, whatsappToken: e.target.value }))}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveWa}
                    disabled={savingWa}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" /> {savingWa ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>

                {/* Account actions */}
                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-200">Cuenta</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleToggleStatus}
                      disabled={togglingStatus}
                      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                        selected.status === 'ACTIVE'
                          ? 'border-rose-500/50 text-rose-400 hover:bg-rose-500/10'
                          : 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {selected.status === 'ACTIVE'
                        ? <><PowerOff className="h-4 w-4" /> Suspender</>
                        : <><Power className="h-4 w-4" /> Activar</>}
                    </button>
                  </div>
                  <div className="mt-4 flex items-end gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Nueva contraseña (admin)</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nueva contraseña..."
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleResetPassword}
                      disabled={savingPwd || !newPassword.trim()}
                      className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:opacity-50"
                    >
                      <KeyRound className="h-4 w-4" /> {savingPwd ? 'Guardando...' : 'Resetear'}
                    </button>
                  </div>
                  {selected.admins?.length > 0 && (
                    <p className="mt-2 text-xs text-slate-500">
                      Admin actual: <span className="text-slate-300">{selected.admins[0].username}</span>
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Create Business Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo negocio" maxWidth="max-w-lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Nombre del negocio</label>
              <input
                required
                value={createForm.businessName}
                onChange={(e) => setCreateForm((p) => ({ ...p, businessName: e.target.value }))}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Slug (URL)</label>
              <input
                required
                value={createForm.slug}
                onChange={(e) => setCreateForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s/g, '-') }))}
                placeholder="mi-negocio"
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Giro</label>
              <select
                value={createForm.giro}
                onChange={(e) => setCreateForm((p) => ({ ...p, giro: e.target.value }))}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                {GIROS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Teléfono admin</label>
              <input
                value={createForm.adminTelefono}
                onChange={(e) => setCreateForm((p) => ({ ...p, adminTelefono: e.target.value }))}
                placeholder="Opcional"
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Usuario admin</label>
              <input
                required
                value={createForm.adminUsername}
                onChange={(e) => setCreateForm((p) => ({ ...p, adminUsername: e.target.value }))}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Contraseña admin</label>
              <input
                required
                type="password"
                value={createForm.adminPassword}
                onChange={(e) => setCreateForm((p) => ({ ...p, adminPassword: e.target.value }))}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {creating ? 'Creando...' : 'Crear negocio'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
