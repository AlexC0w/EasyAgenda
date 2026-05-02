import { Link } from 'react-router-dom';
import { Calendar, MessageSquare, Zap } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:text-white transition-colors duration-300" style={{}}>
      {/* Dark mode override for bg */}
      <style>{`
        .dark .shessai-page { background-color: #0B0F1A; }
        .shessai-page { background-color: #f8fafc; }
        .dark .shessai-hero-glow {
          background: radial-gradient(ellipse 80rem 50rem at top, rgba(3,153,255,0.12), transparent 60%),
                      radial-gradient(ellipse 60rem 40rem at 70% 80%, rgba(42,209,201,0.08), transparent 55%);
        }
        .shessai-hero-glow {
          background: radial-gradient(ellipse 80rem 50rem at top, rgba(3,153,255,0.08), transparent 60%),
                      radial-gradient(ellipse 60rem 40rem at 70% 80%, rgba(42,209,201,0.05), transparent 55%);
        }
        .dark .shessai-card {
          background: rgba(3, 153, 255, 0.05);
          border-color: rgba(3, 153, 255, 0.15);
        }
        .shessai-card {
          background: rgba(3, 153, 255, 0.04);
          border: 1px solid rgba(3, 153, 255, 0.15);
        }
        .dark .shessai-card-cyan {
          background: rgba(42, 209, 201, 0.05);
          border-color: rgba(42, 209, 201, 0.15);
        }
        .shessai-card-cyan {
          background: rgba(42, 209, 201, 0.04);
          border: 1px solid rgba(42, 209, 201, 0.15);
        }
        .dark .shessai-card-green {
          background: rgba(0, 255, 198, 0.04);
          border-color: rgba(0, 255, 198, 0.12);
        }
        .shessai-card-green {
          background: rgba(0, 255, 198, 0.03);
          border: 1px solid rgba(0, 255, 198, 0.12);
        }
        .dark .shessai-footer {
          border-color: rgba(3,153,255,0.1);
        }
        .shessai-footer {
          border-color: rgba(3,153,255,0.15);
        }
        .dark .shessai-badge {
          background: rgba(3,153,255,0.08);
          border-color: rgba(3,153,255,0.2);
        }
        .shessai-badge {
          background: rgba(3,153,255,0.06);
          border: 1px solid rgba(3,153,255,0.2);
        }
        .dark .shessai-subtitle { color: #94a3b8; }
        .shessai-subtitle { color: #475569; }
        .dark .shessai-body-text { color: #94a3b8; }
        .shessai-body-text { color: #64748b; }
        .dark .shessai-secondary-link { color: #cbd5e1; }
        .shessai-secondary-link { color: #334155; }
        .dark .shessai-secondary-link:hover { color: #ffffff; }
        .shessai-secondary-link:hover { color: #0f172a; }
      `}</style>

      <div className="shessai-page min-h-screen transition-colors duration-300">
        {/* Hero Section */}
        <header className="relative overflow-hidden px-6 py-28 sm:py-36 lg:px-8">
          <div className="absolute inset-0 -z-10 shessai-hero-glow" />

          <div className="mx-auto max-w-2xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-widest uppercase shessai-badge" style={{ color: '#2AD1C9' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FFC6] animate-pulse" />
              Agenda inteligente desde WhatsApp
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl leading-tight">
              Conversaciones que se{' '}
              <span
                className="inline-block"
                style={{
                  background: 'linear-gradient(135deg, #0399FF 0%, #2AD1C9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                convierten en citas.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 shessai-subtitle">
              Convierte mensajes en citas. Sin responder tú. Todo desde WhatsApp.
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-full px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #0399FF 0%, #2AD1C9 100%)',
                  boxShadow: '0 8px 30px rgba(3, 153, 255, 0.3)',
                }}
              >
                Comenzar gratis
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold leading-6 transition shessai-secondary-link"
              >
                Ya tengo cuenta <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section className="mx-auto max-w-7xl px-6 lg:px-8 pb-28">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#2AD1C9' }}>
              Cómo funciona
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Gestiona tu negocio como un profesional
            </h2>
            <p className="mt-4 shessai-body-text">
              Tus clientes ya te escriben. Ahora sus mensajes se convierten en citas automáticamente.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl p-6 border transition hover:-translate-y-1 shessai-card">
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #0399FF, #2AD1C9)' }}
              >
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-semibold mb-2">Reservas desde WhatsApp</h3>
              <p className="text-sm leading-7 shessai-body-text">
                Tus clientes agendan directamente desde el chat. Sin apps, sin formularios complicados.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl p-6 border transition hover:-translate-y-1 shessai-card-cyan">
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #0399FF, #2AD1C9)' }}
              >
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-semibold mb-2">Agenda Automática</h3>
              <p className="text-sm leading-7 shessai-body-text">
                La cita queda registrada, confirmada y recordada. Sin que tú tengas que hacer nada.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl p-6 border transition hover:-translate-y-1 shessai-card-green">
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #0399FF, #2AD1C9)' }}
              >
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-semibold mb-2">Sin responder tú</h3>
              <p className="text-sm leading-7 shessai-body-text">
                No pierdas clientes por no responder. Shessai responde, agenda y confirma por ti, 24/7.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8 text-center text-xs text-slate-400 shessai-footer">
          <span>Shessai</span>
          <span className="mx-2 opacity-40">·</span>
          <span>Conversaciones que se convierten en citas.</span>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
