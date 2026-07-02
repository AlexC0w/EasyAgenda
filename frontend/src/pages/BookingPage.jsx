import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  MessageCircle,
  Monitor,
  Phone,
  User,
  Video,
  Zap,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';
import { getInitials } from '../utils/stringUtils.js';

const DAY_LABELS_ES = {
  sunday: 'Dom', monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié',
  thursday: 'Jue', friday: 'Vie', saturday: 'Sáb',
};
const DAY_LABELS_EN = {
  sunday: 'Sun', monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat',
};
const DAYS_OF_WEEK_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAYS_OF_WEEK_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
  for (let i = 0; i < firstDay.getDay(); i += 1) days.push(null);
  for (let day = 1; day <= lastDay.getDate(); day += 1) days.push(new Date(year, month, day));
  return days;
};

const findFirstSelectableDate = (barbero) => {
  if (!barbero) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let step = 0; step < 90; step += 1) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + step);
    const dayName = candidate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (barbero.dias_laborales.includes(dayName)) return toISODate(candidate);
  }
  return '';
};

const formatPrice = (value) => {
  const n = Number(value);
  if (!n) return null;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
};

const StepDot = ({ active, done, label, num }) => (
  <div className="flex flex-col items-center gap-1">
    <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
      done
        ? 'border-[#a24bff] bg-[#a24bff] text-white shadow-[0_0_12px_rgba(162,75,255,0.5)]'
        : active
        ? 'border-[#a24bff] bg-[#a24bff]/10 text-[#a24bff]'
        : 'border-slate-700 bg-transparent text-slate-500'
    }`}>
      {done ? <Check className="h-4 w-4" /> : num}
    </div>
    <span className={`hidden text-xs font-semibold uppercase tracking-wider sm:block ${
      active ? 'text-[#a24bff]' : done ? 'text-[#be83ff]' : 'text-slate-600'
    }`}>{label}</span>
  </div>
);

const StepConnector = ({ done }) => (
  <div className={`h-px w-8 flex-1 transition-all duration-500 sm:w-12 ${done ? 'bg-[#a24bff]/60' : 'bg-[#19102f]'}`} />
);

// Detect if the visitor comes from Vently (URL param OR referrer)
const detectVently = (searchParams) => {
  if (searchParams.get('ref') === 'vently') return true;
  try {
    return document.referrer.toLowerCase().includes('vently');
  } catch { return false; }
};

const BookingPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const isES = i18n.language.startsWith('es');
  const formRef = useRef(null);

  const isVently = useMemo(() => detectVently(searchParams), [searchParams]);

  const [view, setView] = useState('selection'); // selection | calendar | form | done
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [selectedBarberoId, setSelectedBarberoId] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [availability, setAvailability] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', telefono: '', email: '', empresa: '', countryCode: '52' });
  const [confirmation, setConfirmation] = useState(null);

  const dayNameToLabel = isES ? DAY_LABELS_ES : DAY_LABELS_EN;
  const daysOfWeek = isES ? DAYS_OF_WEEK_ES : DAYS_OF_WEEK_EN;

  // Scroll to top on every step transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      try {
        const [bRes, sRes] = await Promise.all([
          api.get('/barberos', { params: { slug } }),
          api.get('/servicios', { params: { slug } }),
        ]);
        setBarberos(bRes.data);
        setServicios(sRes.data);
        if (bRes.data.length) {
          const firstId = String(bRes.data[0].id);
          setSelectedBarberoId(firstId);
          const firstDate = findFirstSelectableDate(bRes.data[0]);
          if (firstDate) {
            setSelectedDate(firstDate);
            const d = new Date(`${firstDate}T00:00:00`);
            setMonthCursor(new Date(d.getFullYear(), d.getMonth(), 1));
          }
        }
        if (sRes.data.length) {
          // When coming from Vently, auto-select the Vently service
          if (isVently) {
            const ventlyService = sRes.data.find(s => s.nombre.toLowerCase().includes('vently'));
            setSelectedServiceIds([String(ventlyService ? ventlyService.id : sRes.data[0].id)]);
          } else {
            setSelectedServiceIds([String(sRes.data[0].id)]);
          }
        }
      } catch {
        setError(t('booking.errorLoadData'));
      }
    };
    load();
  }, [slug]);

  const selectedBarbero = useMemo(
    () => barberos.find((b) => String(b.id) === selectedBarberoId),
    [barberos, selectedBarberoId]
  );

  const selectedServices = useMemo(
    () => servicios.filter((s) => selectedServiceIds.includes(String(s.id))),
    [servicios, selectedServiceIds]
  );

  const totalDuration = useMemo(() => selectedServices.reduce((s, x) => s + x.duracion, 0), [selectedServices]);
  const totalPrice = useMemo(() => selectedServices.reduce((s, x) => s + Number(x.precio), 0), [selectedServices]);

  // When from Vently, only show Vently-tagged services
  const serviciosVisibles = useMemo(() => {
    if (!isVently) return servicios;
    const vently = servicios.filter(s => s.nombre.toLowerCase().includes('vently'));
    return vently.length ? vently : servicios;
  }, [servicios, isVently]);

  useEffect(() => {
    if (!selectedBarbero) return;
    const next = findFirstSelectableDate(selectedBarbero);
    if (next && next !== selectedDate) {
      setSelectedDate(next);
      const d = new Date(`${next}T00:00:00`);
      setMonthCursor(new Date(d.getFullYear(), d.getMonth(), 1));
    }
    setSelectedTime('');
  }, [selectedBarberoId]);

  useEffect(() => { setSelectedTime(''); }, [selectedServiceIds, selectedDate]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedBarberoId || selectedServiceIds.length === 0 || !selectedDate) {
        setAvailability([]); return;
      }
      try {
        setLoadingSlots(true);
        const { data } = await api.get(`/disponibles/${selectedBarberoId}`, {
          params: { fecha: selectedDate, servicioId: selectedServiceIds[0], duration: totalDuration, slug },
        });
        setAvailability(data.disponibilidad || []);
      } catch { setAvailability([]); }
      finally { setLoadingSlots(false); }
    };
    loadSlots();
  }, [selectedBarberoId, selectedServiceIds, selectedDate, totalDuration, slug]);

  const monthDays = useMemo(() => generateMonthDays(monthCursor), [monthCursor]);

  const isDateSelectable = (date) => {
    if (!date || !selectedBarbero) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const c = new Date(date); c.setHours(0, 0, 0, 0);
    if (c < today) return false;
    const dayName = c.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return selectedBarbero.dias_laborales.includes(dayName);
  };

  const handleMonthShift = (delta) => {
    const c = new Date(monthCursor);
    c.setMonth(c.getMonth() + delta); c.setDate(1);
    const now = new Date(); now.setDate(1);
    if (c < now) return;
    setMonthCursor(c);
  };

  const todayIso = useMemo(() => toISODate(new Date()), []);

  const visibleSlots = useMemo(() => {
    if (!availability.length || selectedDate !== todayIso) return availability;
    const now = new Date();
    return availability.filter((slot) => new Date(`${selectedDate}T${slot}:00`) > now);
  }, [availability, selectedDate, todayIso]);

  useEffect(() => {
    if (selectedTime && !visibleSlots.includes(selectedTime)) setSelectedTime('');
  }, [visibleSlots]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBarbero || selectedServices.length === 0 || !selectedDate || !selectedTime) {
      setError(t('booking.errorAllFields')); return;
    }
    setBookingLoading(true);
    setError('');
    try {
      const payload = {
        barberoId: Number(selectedBarbero.id),
        servicioId: Number(selectedServices[0].id),
        serviciosIds: selectedServiceIds.map(Number),
        cliente: formData.nombre,
        telefono: formData.countryCode + formData.telefono,
        fecha: selectedDate,
        hora: selectedTime,
        slug,
      };
      const { data } = await api.post('/citas', payload, { params: { slug } });
      setConfirmation({ cita: data, barbero: selectedBarbero, servicios: selectedServices, fecha: selectedDate, hora: selectedTime });
      setView('done');
    } catch (err) {
      setError(err.response?.data?.message || t('booking.errorBooking'));
      if (err.response?.data?.disponibilidad) setAvailability(err.response.data.disponibilidad);
    } finally { setBookingLoading(false); }
  };

  const monthLabel = monthCursor.toLocaleDateString(isES ? 'es-MX' : 'en-US', { month: 'long', year: 'numeric' });
  const step = view === 'selection' ? 1 : view === 'calendar' ? 2 : view === 'form' ? 3 : 3;

  // ─── SIDEBAR (desktop only) ───────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="hidden lg:flex w-full flex-col gap-6 lg:w-80 lg:min-w-[300px] lg:max-w-[320px]">
      <div className="rounded-2xl border border-[#a24bff]/20 bg-[#0A0518]/80 p-6 backdrop-blur-xl">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--violet-400)', margin: '0 0 10px', fontWeight: 600 }}>
          {isES ? 'Agenda tu sesión' : 'Book your session'}
        </p>
        <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-mute)', margin: 0 }}>
          {t('booking.sidebarDesc')}
        </p>
      </div>

      {(selectedServices.length > 0 || selectedBarbero) && (
        <div className="rounded-2xl border border-[#a24bff]/15 bg-[#120a26]/60 p-5 backdrop-blur">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#be83ff]">
            {t('booking.selectedSession')}
          </p>
          <div className="space-y-3 text-sm">
            {selectedServices.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#a24bff]/10">
                  <Monitor className="h-4 w-4 text-[#a24bff]" />
                </div>
                <div>
                  <p className="font-semibold text-white">{selectedServices.map(s => s.nombre).join(' + ')}</p>
                  <p className="text-slate-400">{totalDuration} {t('booking.minutes')}</p>
                </div>
              </div>
            )}
            {selectedBarbero && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#be83ff]/10 text-sm font-bold text-[#be83ff]">
                  {getInitials(selectedBarbero.nombre)}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">{t('booking.specialist')}</p>
                  <p className="font-semibold text-white">{selectedBarbero.nombre}</p>
                </div>
              </div>
            )}
            {selectedDate && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#a24bff]/10">
                  <Calendar className="h-4 w-4 text-[#a24bff]" />
                </div>
                <p className="font-semibold text-white">
                  {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(isES ? 'es-MX' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {selectedTime && <span className="ml-2 text-[#be83ff]">· {selectedTime}</span>}
                </p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#a24bff]/10">
                <Video className="h-4 w-4 text-[#a24bff]" />
              </div>
              <p className="text-slate-300">{t('booking.videoCall')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[#a24bff]/15 bg-[#120a26]/60 p-5 backdrop-blur">
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#be83ff]">
          {t('booking.whatToExpect')}
        </p>
        <ul className="space-y-3">
          {[
            { icon: <MessageCircle className="h-4 w-4" />, text: t('booking.expect1') },
            { icon: <Video className="h-4 w-4" />, text: t('booking.expect2') },
            { icon: <Sparkles className="h-4 w-4" />, text: t('booking.expect3') },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
              <span className="mt-0.5 shrink-0 text-[#a24bff]">{item.icon}</span>
              {item.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/5 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
          <MessageCircle className="h-4 w-4 text-green-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-green-400">{t('booking.whatsappConfirm')}</p>
          <p className="text-[11px] text-slate-500">{t('booking.instantBook')}</p>
        </div>
      </div>
    </aside>
  );

  // ─── MOBILE SUMMARY STRIP ────────────────────────────────────────────────
  const MobileSummary = () => {
    if (!selectedBarbero && selectedServices.length === 0) return null;
    return (
      <div className="lg:hidden rounded-2xl border border-[#a24bff]/20 bg-[#120a26]/80 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {selectedServices.length > 0 && (
            <span className="font-semibold text-white">{selectedServices.map(s => s.nombre).join(' + ')}</span>
          )}
          {selectedBarbero && (
            <span className="text-[#be83ff]">· {selectedBarbero.nombre}</span>
          )}
          {selectedDate && (
            <span className="text-slate-400">
              · {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(isES ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {selectedTime && (
            <span className="font-bold text-[#a24bff]">· {selectedTime}</span>
          )}
          {totalDuration > 0 && (
            <span className="text-slate-500 text-xs">· {totalDuration} min</span>
          )}
        </div>
      </div>
    );
  };

  // ─── STICKY BOTTOM CTA (mobile only) ─────────────────────────────────────
  const StickyMobileCTA = ({ label, onClick, disabled, type = 'button', form }) => (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-4 lg:hidden"
      style={{ background: 'linear-gradient(to top, rgba(6,3,18,1) 55%, rgba(6,3,18,0) 100%)' }}>
      <button
        type={type}
        form={form}
        disabled={disabled}
        onClick={onClick}
        className="flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-bold text-white transition-all active:scale-[0.97] disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, #7724C4 0%, #a24bff 100%)', boxShadow: '0 8px 30px rgba(162,75,255,0.45)' }}
      >
        {disabled && type !== 'submit' ? (
          <span className="text-white/60">{label}</span>
        ) : (
          <>
            {label}
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>
    </div>
  );

  // ─── STEP INDICATOR ───────────────────────────────────────────────────────
  const Steps = () => (
    <div className="mb-6 flex items-center justify-center gap-2">
      <StepDot num={1} active={step === 1} done={step > 1} label={t('booking.step1')} />
      <StepConnector done={step > 1} />
      <StepDot num={2} active={step === 2} done={step > 2} label={t('booking.step2')} />
      <StepConnector done={step > 2} />
      <StepDot num={3} active={step === 3} done={view === 'done'} label={t('booking.step3')} />
    </div>
  );

  // ─── VIEW: SELECTION ─────────────────────────────────────────────────────
  if (view === 'selection') return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <Sidebar />
      <div className="flex-1 space-y-6 pb-28 lg:pb-0">
        <MobileSummary />

        {/* Vently co-branding banner */}
        {isVently && (
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
            <img src="/vently-logo.png" alt="Vently" className="h-8 object-contain" />
            <div className="h-8 w-px bg-white/15" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isES ? 'Agenda tu sesión desde' : 'Book your session via'}
              </p>
              <p className="text-sm font-bold text-white">Vently</p>
            </div>
          </div>
        )}

        <Steps />
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        {/* Service types */}
        <section className="space-y-4">
          {!isVently && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#a24bff]/10">
                <Monitor className="h-4 w-4 text-[#a24bff]" />
              </div>
              <h3 className="text-lg font-bold text-slate-300">{t('booking.sessionTypes')}</h3>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {serviciosVisibles.map((s) => {
              const active = selectedServiceIds.includes(String(s.id));
              const price = formatPrice(s.precio);
              const isVentlyService = s.nombre.toLowerCase().includes('vently');
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => !isVently && setSelectedServiceIds([String(s.id)])}
                  className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 active:scale-[0.98] ${
                    active
                      ? 'border-[#a24bff]/60 bg-[#a24bff]/10 shadow-lg shadow-[#a24bff]/10'
                      : 'border-[#a24bff]/15 bg-[#120a26]/70 hover:border-[#a24bff]/30 hover:bg-[#120a26]/80'
                  } ${isVently ? 'cursor-default' : ''}`}
                >
                  {active && (
                    <div className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-[#a24bff]">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className="mb-3 flex items-center gap-3">
                    {isVentlyService ? (
                      <div className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl ${active ? 'bg-white/10' : 'bg-[#19102f]'}`}>
                        <img src="/vently-logo.png" alt="Vently" className="h-7 w-7 object-contain" />
                      </div>
                    ) : (
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${active ? 'bg-[#a24bff]/20' : 'bg-[#19102f]'}`}>
                        <Clock className={`h-5 w-5 ${active ? 'text-[#a24bff]' : 'text-slate-400'}`} />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-white">{s.nombre}</p>
                      <p className={`text-sm ${active ? 'text-[#be83ff]' : 'text-slate-500'}`}>{s.duracion} {t('booking.minutes')}</p>
                    </div>
                  </div>
                  {price && (
                    <p className="text-lg font-bold" style={{ color: active ? '#a24bff' : '#64748b' }}>{price}</p>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Specialists */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#be83ff]/10">
              <User className="h-4 w-4 text-[#be83ff]" />
            </div>
            <h3 className="text-lg font-bold text-slate-300">{t('booking.specialists')}</h3>
          </div>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
            {barberos.map((b) => {
              const active = String(b.id) === selectedBarberoId;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBarberoId(String(b.id))}
                  className={`group relative rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98] ${
                    active
                      ? 'border-[#be83ff]/50 shadow-lg shadow-[#be83ff]/10'
                      : 'border-[#a24bff]/15 bg-[#120a26]/70 hover:border-[#be83ff]/25 hover:bg-[#120a26]/80'
                  }`}
                  style={active ? { background: 'rgba(162,75,255,0.07)' } : {}}
                >
                  {active && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#be83ff]">
                      <Check className="h-3 w-3 text-[#0A0518]" />
                    </div>
                  )}
                  <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold"
                    style={{ background: active ? 'rgba(162,75,255,0.2)' : 'rgba(30,40,60,1)', color: active ? '#be83ff' : '#94a3b8' }}>
                    {getInitials(b.nombre)}
                  </div>
                  <p className="font-bold text-white text-sm">{b.nombre}</p>
                  <p className={`mt-1 text-xs leading-tight ${active ? 'text-[#be83ff]' : 'text-slate-500'}`}>
                    {b.dias_laborales.map(d => dayNameToLabel[d] || d.slice(0, 3)).join(' · ')}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Desktop CTA */}
        {selectedServices.length > 0 && selectedBarbero && (
          <div className="hidden lg:flex justify-end">
            <button
              type="button"
              onClick={() => setView('calendar')}
              className="group flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all hover:gap-4"
              style={{ background: 'linear-gradient(135deg, #7724C4 0%, #a24bff 100%)', boxShadow: '0 8px 30px rgba(162,75,255,0.3)' }}
            >
              {t('booking.continueToCalendar')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile sticky CTA */}
      <StickyMobileCTA
        label={selectedServices.length > 0 && selectedBarbero ? t('booking.continueToCalendar') : isES ? 'Selecciona servicio y barbero' : 'Select service & specialist'}
        onClick={() => setView('calendar')}
        disabled={!(selectedServices.length > 0 && selectedBarbero)}
      />
    </div>
  );

  // ─── VIEW: CALENDAR ───────────────────────────────────────────────────────
  if (view === 'calendar') return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <Sidebar />
      <div className="flex-1 space-y-5 pb-28 lg:pb-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setView('selection')}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('booking.backToSelection')}
          </button>
          <div className="h-px flex-1 bg-[#19102f]" />
        </div>

        <MobileSummary />
        <Steps />

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        <div className="grid gap-5 xl:grid-cols-[1fr,320px]">
          {/* Calendar */}
          <div className="rounded-2xl border border-[#a24bff]/15 bg-[#120a26]/60 p-5 backdrop-blur">
            <header className="mb-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleMonthShift(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#a24bff]/15 text-slate-400 transition active:scale-95 hover:border-[#a24bff]/40 hover:text-[#a24bff]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center">
                <p className="text-base font-bold capitalize text-white">{monthLabel}</p>
                <p className="text-xs uppercase tracking-wider text-[#be83ff]/70">{t('booking.availability')}</p>
              </div>
              <button
                type="button"
                onClick={() => handleMonthShift(1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#a24bff]/15 text-slate-400 transition active:scale-95 hover:border-[#a24bff]/40 hover:text-[#a24bff]"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </header>

            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
              {daysOfWeek.map(d => <div key={d} className="py-2">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((date, i) => {
                if (!date) return <div key={`e-${i}`} className="aspect-square" />;
                const sel = isDateSelectable(date);
                const iso = toISODate(date);
                const chosen = iso === selectedDate;
                const isToday = iso === todayIso;
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={!sel}
                    onClick={() => sel && setSelectedDate(iso)}
                    className={`flex aspect-square min-h-[40px] items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
                      !sel
                        ? 'cursor-not-allowed text-[#5c4e7a]'
                        : chosen
                        ? 'text-white shadow-lg shadow-[#a24bff]/30'
                        : isToday
                        ? 'border border-[#a24bff]/40 text-[#a24bff] hover:bg-[#a24bff]/10'
                        : 'text-slate-300 hover:bg-[#19102f] hover:text-white'
                    }`}
                    style={chosen ? { background: 'linear-gradient(135deg, #7724C4 0%, #a24bff 100%)' } : {}}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#a24bff]/15 bg-[#120a26]/60 p-5 backdrop-blur">
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#a24bff]" />
                <p className="font-bold text-white">{t('booking.availableSlots')}</p>
              </div>
              <p className="mb-1 text-sm font-semibold text-slate-300">{selectedBarbero?.nombre}</p>
              <p className="mb-4 text-sm text-slate-500">{selectedServices.map(s => s.nombre).join(' + ')}</p>

              {loadingSlots && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#a24bff]/30 border-t-[#a24bff]" />
                </div>
              )}
              {!loadingSlots && visibleSlots.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-600">{t('booking.noSlots')}</p>
              )}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {!loadingSlots && visibleSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`rounded-xl border py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
                      selectedTime === slot
                        ? 'border-[#a24bff]/60 text-white shadow-lg shadow-[#a24bff]/20'
                        : 'border-[#a24bff]/15 text-slate-400 hover:border-[#a24bff]/30 hover:text-white'
                    }`}
                    style={selectedTime === slot ? { background: 'linear-gradient(135deg, #7724C4 0%, #a24bff 100%)' } : {}}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop CTA (inline) */}
            {selectedTime && (
              <button
                type="button"
                onClick={() => setView('form')}
                className="hidden lg:flex group w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-bold text-white transition-all hover:gap-4"
                style={{ background: 'linear-gradient(135deg, #7724C4 0%, #a24bff 100%)', boxShadow: '0 8px 30px rgba(162,75,255,0.3)' }}
              >
                {t('booking.continueToCalendar')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <StickyMobileCTA
        label={selectedTime ? (isES ? 'Continuar' : 'Continue') : (isES ? 'Selecciona un horario' : 'Select a time slot')}
        onClick={() => setView('form')}
        disabled={!selectedTime}
      />
    </div>
  );

  // ─── VIEW: FORM ──────────────────────────────────────────────────────────
  if (view === 'form') return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <Sidebar />
      <div className="flex-1 space-y-5 pb-28 lg:pb-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setView('calendar')}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('booking.backToSelection')}
          </button>
          <div className="h-px flex-1 bg-[#19102f]" />
        </div>

        <MobileSummary />
        <Steps />

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        <form
          id="booking-form"
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-[#a24bff]/15 bg-[#120a26]/60 p-5 backdrop-blur lg:max-w-lg"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a24bff]/10">
              <User className="h-5 w-5 text-[#a24bff]" />
            </div>
            <div>
              <p className="font-bold text-white">{t('booking.yourData')}</p>
              <p className="text-xs text-slate-500">
                {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(isES ? 'es-MX' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                {' · '}{selectedTime}
              </p>
            </div>
          </div>

          {/* Name */}
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-sm font-semibold text-slate-400">{t('booking.fullName')}</span>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-600" />
              <input
                type="text"
                value={formData.nombre}
                onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))}
                required
                placeholder={t('booking.namePlaceholder')}
                className="w-full rounded-xl border border-[#a24bff]/15 bg-[#120a26]/80 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-700 focus:border-[#a24bff]/60 focus:outline-none focus:ring-2 focus:ring-[#a24bff]/20 transition"
              />
            </div>
          </label>

          {/* Phone */}
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-sm font-semibold text-slate-400">{t('booking.phone')}</span>
            <div className="flex gap-2">
              <select
                value={formData.countryCode}
                onChange={e => setFormData(p => ({ ...p, countryCode: e.target.value }))}
                className="rounded-xl border border-[#a24bff]/15 bg-[#120a26]/80 px-3 py-3.5 text-sm text-white focus:border-[#a24bff]/60 focus:outline-none"
              >
                <option value="52">🇲🇽 +52</option>
                <option value="1">🇺🇸 +1</option>
                <option value="34">🇪🇸 +34</option>
                <option value="54">🇦🇷 +54</option>
                <option value="57">🇨🇴 +57</option>
                <option value="56">🇨🇱 +56</option>
                <option value="51">🇵🇪 +51</option>
              </select>
              <div className="relative flex-1">
                <Phone className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-600" />
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={e => setFormData(p => ({ ...p, telefono: e.target.value.replace(/\D/g, '') }))}
                  required
                  placeholder={t('booking.phonePlaceholder')}
                  className="w-full rounded-xl border border-[#a24bff]/15 bg-[#120a26]/80 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-700 focus:border-[#a24bff]/60 focus:outline-none focus:ring-2 focus:ring-[#a24bff]/20 transition"
                />
              </div>
            </div>
          </label>

          {/* Email */}
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-sm font-semibold text-slate-400">
              {t('booking.email')}
              <span className="ml-2 text-xs font-normal text-slate-600">(opcional)</span>
            </span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-600" />
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder={t('booking.emailPlaceholder')}
                className="w-full rounded-xl border border-[#a24bff]/15 bg-[#120a26]/80 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-700 focus:border-[#a24bff]/60 focus:outline-none focus:ring-2 focus:ring-[#a24bff]/20 transition"
              />
            </div>
          </label>

          {/* Empresa — hidden on mobile, visible on desktop */}
          <label className="hidden lg:flex flex-col gap-1.5 text-sm">
            <span className="text-sm font-semibold text-slate-400">
              {t('booking.company')}
              <span className="ml-2 text-xs font-normal text-slate-600">(opcional)</span>
            </span>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-600" />
              <input
                type="text"
                value={formData.empresa}
                onChange={e => setFormData(p => ({ ...p, empresa: e.target.value }))}
                placeholder={t('booking.companyPlaceholder')}
                className="w-full rounded-xl border border-[#a24bff]/15 bg-[#120a26]/80 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-700 focus:border-[#a24bff]/60 focus:outline-none focus:ring-2 focus:ring-[#a24bff]/20 transition"
              />
            </div>
          </label>

          {/* Desktop submit button */}
          <button
            type="submit"
            disabled={bookingLoading}
            className="hidden lg:flex mt-2 w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-bold text-white transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #7724C4 0%, #a24bff 100%)', boxShadow: '0 8px 30px rgba(162,75,255,0.3)' }}
          >
            {bookingLoading ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('booking.processing')}</>
            ) : (
              <><Zap className="h-4 w-4" />{t('booking.confirmBooking')}</>
            )}
          </button>
        </form>
      </div>

      {/* Mobile sticky submit */}
      <StickyMobileCTA
        label={bookingLoading ? t('booking.processing') : t('booking.confirmBooking')}
        type="submit"
        form="booking-form"
        disabled={bookingLoading}
      />
    </div>
  );

  // ─── VIEW: DONE ───────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6 text-center">
        <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full opacity-25" style={{ background: 'linear-gradient(135deg, #7724C4 0%, #a24bff 100%)' }} />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #7724C4 0%, #a24bff 100%)' }}>
            <Check className="h-14 w-14 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-extrabold text-white">{t('booking.confirmationTitle')}</h2>
          <p className="mt-2 text-slate-400">{t('booking.confirmationDesc')}</p>
        </div>

        {confirmation && (
          <div className="rounded-2xl border border-[#a24bff]/20 bg-[#0A0518]/80 p-6 text-left backdrop-blur">
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('booking.professional')}</span>
                <span className="font-bold text-white">{confirmation.barbero.nombre}</span>
              </div>
              <div className="border-t border-[#a24bff]/15 pt-3">
                <p className="mb-2 text-slate-500">{t('booking.services')}</p>
                {confirmation.servicios.map(s => (
                  <div key={s.id} className="flex justify-between pl-2">
                    <span className="text-white">{s.nombre}</span>
                    {formatPrice(s.precio) && <span className="text-slate-500">{formatPrice(s.precio)}</span>}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-[#a24bff]/15 pt-3">
                <span className="text-slate-500">{t('booking.totalDuration')}</span>
                <span className="font-bold text-white">{totalDuration} {t('booking.minutes')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('booking.date')}</span>
                <span className="font-bold text-white">
                  {new Date(`${confirmation.fecha}T12:00:00`).toLocaleDateString(isES ? 'es-MX' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('booking.time')}</span>
                <span className="font-bold text-[#be83ff]">{confirmation.hora}</span>
              </div>
              {totalPrice > 0 && (
                <div className="flex items-center justify-between border-t border-[#a24bff]/15 pt-3">
                  <span className="text-slate-500">{t('booking.total')}</span>
                  <span className="text-xl font-extrabold" style={{ color: '#a24bff' }}>{formatPrice(totalPrice)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/5 px-5 py-4">
          <MessageCircle className="h-5 w-5 shrink-0 text-green-400" />
          <p className="text-left text-sm text-slate-400">{t('booking.expect1')}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setConfirmation(null);
            setSelectedTime('');
            setFormData({ nombre: '', telefono: '', email: '', empresa: '', countryCode: '52' });
            setView('selection');
          }}
          className="rounded-2xl border border-[#a24bff]/15 px-8 py-3 text-sm font-semibold text-slate-400 transition hover:border-slate-700 hover:text-white active:scale-95"
        >
          {t('booking.bookAnother')}
        </button>
      </div>
    </div>
  );
};

export default BookingPage;
