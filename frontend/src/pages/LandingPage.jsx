import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, CheckCircle, Clock, Monitor, Zap, BarChart2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const OCTANE_SLUG = 'octane';

const LandingPage = () => {
  const { i18n } = useTranslation();
  const isES = i18n.language.startsWith('es');

  const onHover = (e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,.45), 0 0 38px rgba(162,75,255,.65)'; };
  const onLeave = (e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--glow-btn)'; };

  /* ── lo que obtienes en la sesión ── */
  const deliverables = isES ? [
    { icon: Monitor, title: 'Demo personalizada', desc: 'Mostramos el software adaptado a los procesos reales de tu empresa, no una demo genérica.' },
    { icon: Zap,     title: 'Diagnóstico express', desc: 'Analizamos contigo los cuellos de botella actuales y proponemos dónde la tecnología puede ayudar más.' },
    { icon: BarChart2, title: 'Propuesta técnica', desc: 'Recibes una propuesta clara con alcance, tiempos, tecnología sugerida y estimación de inversión.' },
  ] : [
    { icon: Monitor,   title: 'Personalized demo', desc: 'We show the software adapted to your company\'s real processes — not a generic walkthrough.' },
    { icon: Zap,       title: 'Express diagnosis', desc: 'We analyze your current bottlenecks and identify where technology can have the most impact.' },
    { icon: BarChart2, title: 'Technical proposal', desc: 'You receive a clear proposal with scope, timeline, tech stack, and investment estimate.' },
  ];

  const checks = isES ? [
    'Sin compromiso de compra', 'Especialista asignado a tu industria',
    '30 minutos, sin relleno', 'Confirmación inmediata por WhatsApp',
    'Videollamada o presencial', 'Propuesta entregada post-sesión',
  ] : [
    'No purchase commitment', 'Specialist matched to your industry',
    '30 minutes, no fluff', 'Instant WhatsApp confirmation',
    'Video call or in-person', 'Proposal delivered after the session',
  ];

  return (
    <div style={{ background: 'var(--void)', color: 'var(--text)', fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: 'clamp(72px,10vw,120px) 0 clamp(64px,9vw,100px)', overflow: 'hidden' }}>
        <div className="oct-hexgrid" />
        <div className="oct-orb" style={{ width: 560, height: 560, background: '#7724c4', top: -200, left: -160 }} />
        <div className="oct-orb" style={{ width: 380, height: 380, background: '#a24bff', top: 60, right: -120, opacity: 0.35 }} />

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Wordmark */}
          <img
            src="/octane-wordmark-white.png"
            alt="Octane"
            style={{ height: 36, marginBottom: 40, filter: 'drop-shadow(0 0 16px rgba(162,75,255,0.5))' }}
          />

          <span className="oct-eyebrow" style={{ marginBottom: 20, display: 'inline-flex', justifyContent: 'center' }}>
            {isES ? 'Agenda tu sesión · 30 min · Sin costo' : 'Book your session · 30 min · Free'}
          </span>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'clamp(38px, 6vw, 74px)',
            lineHeight: 1.03, letterSpacing: '-0.035em',
            margin: '16px 0 24px', color: 'var(--text)',
          }}>
            {isES
              ? <>{' '}Software <span className="oct-grad-text">a tu medida</span>,<br />construido para crecer.</>
              : <>{' '}Custom software,<br /><span className="oct-grad-text">built to scale.</span></>
            }
          </h1>

          <p style={{ color: 'var(--text-soft)', fontSize: 'clamp(16px,1.8vw,20px)', lineHeight: 1.6, maxWidth: 620, margin: '0 auto 40px' }}>
            {isES
              ? 'En Octane diseñamos, desarrollamos y escalamos el software que tu negocio necesita. Agenda una sesión de 30 minutos con uno de nuestros especialistas y descubre cómo podemos ayudarte.'
              : 'At Octane we design, build, and scale the software your business needs. Book a 30-minute session with one of our specialists and find out how we can help.'}
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={`/${OCTANE_SLUG}`}
              className="oct-btn oct-btn--primary oct-btn--lg oct-btn--pill"
              style={{ textDecoration: 'none' }}
              onMouseEnter={onHover} onMouseLeave={onLeave}
            >
              {isES ? 'Agendar sesión gratuita' : 'Book free session'}
              <ArrowRight size={18} />
            </Link>
            <a
              href="https://wa.me/message/octane"
              target="_blank" rel="noopener noreferrer"
              className="oct-btn oct-btn--secondary oct-btn--lg oct-btn--pill"
              style={{ textDecoration: 'none' }}
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          </div>

          {/* Trust micro-bar */}
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', marginTop: 52 }}>
            {(isES
              ? ['+120 proyectos entregados', '99.9 % uptime', 'Soporte 24/7']
              : ['+120 projects delivered',   '99.9% uptime',  '24/7 support']
            ).map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--text-mute)', textTransform: 'uppercase' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--violet-400)', boxShadow: 'var(--glow-sm)' }} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUÉ PASA EN LA SESIÓN ──────────────────────────────────── */}
      <section style={{ padding: 'clamp(60px,8vw,96px) 0', background: 'var(--bg-2)', position: 'relative' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="oct-eyebrow" style={{ marginBottom: 14, display: 'inline-flex' }}>
              {isES ? 'Lo que pasa en tu sesión' : 'What happens in your session'}
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(26px,4vw,42px)', lineHeight: 1.08, letterSpacing: '-0.03em', margin: '12px 0 0', color: 'var(--text)' }}>
              {isES ? <>30 minutos que pueden <span className="oct-grad-text">cambiar tu operación</span></> : <>30 minutes that can <span className="oct-grad-text">change your operation</span></>}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {deliverables.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="oct-card oct-card--hover" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* step number + hex icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className="oct-hexicon oct-hexicon--neon" style={{ width: 52, height: 57 }}>
                    <span className="oct-hexicon__inner" style={{ width: 52, height: 52 }}>
                      <Icon strokeWidth={1.8} />
                    </span>
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.2em', color: 'var(--text-faint)', textTransform: 'uppercase' }}>0{i + 1}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.125rem', color: 'var(--text)', margin: 0 }}>{title}</h3>
                <p style={{ color: 'var(--text-mute)', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUÉ AGENDAR ────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(60px,8vw,96px) 0', position: 'relative' }}>
        <div className="oct-orb" style={{ width: 360, height: 360, background: '#662d91', bottom: -80, right: -80, opacity: 0.28 }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 52, alignItems: 'center' }} className="lg:grid-cols-2">
            {/* Left text */}
            <div>
              <span className="oct-eyebrow" style={{ marginBottom: 14, display: 'inline-flex' }}>
                {isES ? 'Sin riesgo' : 'Zero risk'}
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(26px,4vw,42px)', lineHeight: 1.08, letterSpacing: '-0.03em', margin: '12px 0 16px', color: 'var(--text)' }}>
                {isES
                  ? <>{' '}<span className="oct-grad-text">Una sesión.</span> Todo lo que necesitas para decidir.</>
                  : <>{' '}<span className="oct-grad-text">One session.</span> Everything you need to decide.</>}
              </h2>
              <p style={{ color: 'var(--text-soft)', fontSize: '1.0625rem', lineHeight: 1.65, margin: '0 0 36px' }}>
                {isES
                  ? 'Sin reuniones de ventas interminables. Sin presentaciones genéricas. Solo tú, tu problema real y el especialista correcto.'
                  : 'No endless sales meetings. No generic presentations. Just you, your real problem, and the right specialist.'}
              </p>
              <Link
                to={`/${OCTANE_SLUG}`}
                className="oct-btn oct-btn--primary oct-btn--lg oct-btn--pill"
                style={{ textDecoration: 'none', display: 'inline-flex' }}
                onMouseEnter={onHover} onMouseLeave={onLeave}
              >
                {isES ? 'Quiero mi sesión' : 'Book my session'}
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Right checklist */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {checks.map((c) => (
                <div key={c} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                  <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-soft)', lineHeight: 1.4 }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(64px,9vw,108px) 0', position: 'relative', overflow: 'hidden' }}>
        <div className="oct-hexgrid" style={{ opacity: 0.25 }} />
        <div className="oct-orb" style={{ width: 560, height: 560, background: '#7724c4', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.22 }} />

        <div style={{ maxWidth: 660, margin: '0 auto', padding: '0 28px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <img src="/octane-mark-white.png" alt="" aria-hidden="true"
            style={{ height: 68, marginBottom: 28, filter: 'drop-shadow(0 0 28px rgba(162,75,255,0.7))', animation: 'oct-float 6s ease-in-out infinite' }}
          />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(30px,5vw,52px)', lineHeight: 1.05, letterSpacing: '-0.035em', margin: '0 0 18px', color: 'var(--text)' }}>
            {isES
              ? <>{' '}¿Listo para hablar <span className="oct-grad-text">con un especialista</span>?</>
              : <>{' '}Ready to talk <span className="oct-grad-text">to a specialist</span>?</>}
          </h2>
          <p style={{ color: 'var(--text-soft)', fontSize: 'clamp(15px,1.7vw,18px)', lineHeight: 1.6, margin: '0 0 38px' }}>
            {isES
              ? 'Elige el tipo de sesión, el especialista que mejor encaje con tu proyecto y el horario que más te convenga.'
              : 'Choose the session type, the specialist that best fits your project, and the time that works for you.'}
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={`/${OCTANE_SLUG}`}
              className="oct-btn oct-btn--primary oct-btn--lg oct-btn--pill"
              style={{ textDecoration: 'none' }}
              onMouseEnter={onHover} onMouseLeave={onLeave}
            >
              {isES ? 'Agendar ahora' : 'Book now'}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--line)', padding: '28px 28px', background: 'var(--void)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <img src="/octane-wordmark-white.png" alt="Octane" style={{ height: 22, opacity: 0.7 }} />
          <p style={{ color: 'var(--text-faint)', fontSize: '0.78rem', margin: 0, fontFamily: 'var(--font-mono)' }}>
            © {new Date().getFullYear()} Octane Informatic Solutions
          </p>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Clock size={12} style={{ color: 'var(--violet-400)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {isES ? 'Agenda abierta 24/7' : 'Booking open 24/7'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
