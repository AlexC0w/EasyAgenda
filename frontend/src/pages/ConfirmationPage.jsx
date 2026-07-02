import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, X, Calendar, Clock, User, Scissors, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';

const ConfirmationPage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isES = i18n.language.startsWith('es');

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [cita, setCita] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchCita = async () => {
      setMessage(t('confirmation.loadingMessage'));
      try {
        const { data } = await api.get(`/citas/${id}/public`);
        setCita(data);
        if (data.estado === 'confirmada') {
          setStatus('success');
          setMessage(t('confirmation.alreadyConfirmed'));
        } else if (data.estado === 'cancelada') {
          setStatus('cancelled');
          setMessage(t('confirmation.alreadyCancelled'));
        } else {
          setStatus('ready');
          setMessage(t('confirmation.reviewDetails'));
        }
      } catch (error) {
        console.error(error);
        setStatus('error');
        setMessage(error.response?.data?.message || t('confirmation.notFound'));
      }
    };

    if (id) fetchCita();
  }, [id, t]);

  const handleConfirm = async () => {
    if (!window.confirm(t('confirmation.confirmConfirm'))) return;
    setActionLoading(true);
    try {
      const { data } = await api.post(`/citas/${id}/confirm`);
      setCita(data.cita);
      setStatus('success');
      setMessage(t('confirmation.successConfirm'));
    } catch (error) {
      console.error(error);
      alert(t('confirmation.errorConfirm'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(t('confirmation.confirmCancel'))) return;
    setActionLoading(true);
    try {
      const { data } = await api.post(`/citas/${id}/cancel`);
      setCita(data.cita);
      setStatus('cancelled');
      setMessage(t('confirmation.successCancel'));
    } catch (error) {
      console.error(error);
      alert(t('confirmation.errorCancel'));
    } finally {
      setActionLoading(false);
    }
  };

  const S = {
    page: { display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--void)', padding: '48px 20px', position: 'relative', overflow: 'hidden' },
    card: { width: '100%', maxWidth: 480, position: 'relative', zIndex: 1, padding: 36 },
    row: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--line)' },
    label: { fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 2 },
    value: { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text)' },
  };

  if (status === 'loading') {
    return (
      <div style={S.page}>
        <div className="oct-hexgrid" style={{ opacity: 0.3 }} />
        <div style={{ textAlign: 'center', zIndex: 1, position: 'relative' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid rgba(162,75,255,0.2)', borderTopColor: 'var(--violet-400)', animation: 'oct-spin 0.8s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: 20, color: 'var(--text-soft)', fontFamily: 'var(--font-display)' }}>{t('confirmation.loading')}</p>
        </div>
      </div>
    );
  }

  const statusTitle = {
    success: t('confirmation.confirmed'),
    cancelled: t('confirmation.cancelled'),
    error: t('confirmation.error'),
    ready: t('confirmation.manage'),
  }[status] ?? t('confirmation.manage');

  const statusIcon = {
    success: { icon: Check, bg: 'var(--success-dim)', color: 'var(--success)' },
    cancelled: { icon: X, bg: 'var(--danger-dim)', color: 'var(--danger)' },
    ready: { icon: AlertTriangle, bg: 'rgba(162,75,255,0.15)', color: 'var(--violet-400)' },
    error: { icon: X, bg: 'rgba(255,255,255,0.06)', color: 'var(--text-mute)' },
  }[status];

  return (
    <div style={S.page}>
      <div className="oct-hexgrid" style={{ opacity: 0.3 }} />
      <div className="oct-orb" style={{ width: 400, height: 400, background: '#7724c4', top: -120, left: -120, opacity: 0.28 }} />
      <div className="oct-orb" style={{ width: 280, height: 280, background: '#a24bff', bottom: -80, right: -60, opacity: 0.2 }} />

      <div className="oct-card oct-card--glass" style={S.card}>
        {/* Status header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {statusIcon && (
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: statusIcon.bg, color: statusIcon.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: status === 'success' ? '0 0 24px rgba(54,229,164,0.3)' : status === 'ready' ? 'var(--glow-md)' : 'none' }}>
              <statusIcon.icon size={32} strokeWidth={2} />
            </div>
          )}
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', color: 'var(--text)', margin: '0 0 8px' }}>{statusTitle}</h2>
          <p style={{ color: 'var(--text-mute)', fontSize: '0.875rem', margin: 0 }}>{message}</p>
        </div>

        {cita && (
          <div style={{ background: 'rgba(18,10,38,0.6)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '20px 20px 8px', marginBottom: 24 }}>
            <div style={S.row}>
              <User size={16} style={{ color: 'var(--violet-400)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={S.label}>{t('confirmation.client')}</div>
                <div style={S.value}>{cita.cliente}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-mute)' }}>{t('confirmation.phone')}: {cita.telefono}</div>
              </div>
            </div>
            <div style={S.row}>
              <Scissors size={16} style={{ color: 'var(--violet-400)', flexShrink: 0, marginTop: 2 }} />
              <div style={{ width: '100%' }}>
                <div style={S.label}>{t('confirmation.services')}</div>
                {cita.servicios?.length > 0 ? cita.servicios.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text)' }}>{item.servicio.nombre}</span>
                    <span style={{ color: 'var(--text-mute)' }}>{item.servicio.duracion} {t('confirmation.minutes')}</span>
                  </div>
                )) : <div style={{ ...S.value }}>{cita.servicio?.nombre}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', marginTop: 8, paddingTop: 8, fontSize: '0.875rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-soft)' }}>{t('confirmation.totalDuration')}</span>
                  <span style={{ color: 'var(--violet-400)' }}>{cita.duracionTotal || cita.servicio?.duracion} {t('confirmation.minutes')}</span>
                </div>
              </div>
            </div>
            <div style={S.row}>
              <Calendar size={16} style={{ color: 'var(--violet-400)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={S.label}>{t('confirmation.date')}</div>
                <div style={S.value}>{new Date(cita.fecha).toLocaleDateString(isES ? 'es-MX' : 'en-US', { dateStyle: 'long', timeZone: 'UTC' })}</div>
              </div>
            </div>
            <div style={{ ...S.row, borderBottom: 'none' }}>
              <Clock size={16} style={{ color: 'var(--violet-400)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={S.label}>{t('confirmation.schedule')}</div>
                <div style={S.value}>
                  {cita.hora} – {(() => {
                    const [h, m] = cita.hora.split(':').map(Number);
                    const total = h * 60 + m + (cita.duracionTotal || cita.servicio?.duracion || 30);
                    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'ready' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <button onClick={handleCancel} disabled={actionLoading} className="oct-btn oct-btn--md" style={{ background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid rgba(255,84,112,0.3)' }}>
              <X size={16} /> {t('confirmation.cancel')}
            </button>
            <button onClick={handleConfirm} disabled={actionLoading} className="oct-btn oct-btn--primary oct-btn--md">
              <Check size={16} /> {t('confirmation.confirm')}
            </button>
          </div>
        )}

        <Link
          to={cita?.business?.slug ? `/${cita.business.slug}` : '/'}
          className="oct-btn oct-btn--secondary oct-btn--md oct-btn--block"
          style={{ textDecoration: 'none', marginTop: 4 }}
        >
          {t('confirmation.backToAgenda')}
        </Link>
      </div>
    </div>
  );
};

export default ConfirmationPage;
