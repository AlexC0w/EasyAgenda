import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, Shield, Users, Smartphone, Link as LinkIcon, MessageCircle, Star } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-300">
      {/* Hero Section */}
      <header className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.emerald.100),theme(colors.slate.50))] opacity-40 dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.emerald.500),theme(colors.slate.950))] dark:opacity-20" />
        <div className="mx-auto max-w-7xl">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                Tu agenda, <span className="text-blue-600 dark:text-purple-400">simplificada</span>.
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
                La plataforma todo en uno para negocios de belleza y bienestar. Gestiona citas, profesionales y recordatorios automáticos por WhatsApp.
              </p>
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-x-6">
                <Link
                  to="/register"
                  className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-500 dark:hover:bg-purple-400"
                >
                  Comenzar gratis
                </Link>
                <Link to="/login" className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">
                  Ya tengo cuenta <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            
            <div className="mt-16 lg:mt-0 lg:flex lg:justify-end">
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <img
                  src="/hero-mockup.png"
                  alt="Agenda Shessai Interfaz"
                  className="w-full rounded-3xl shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* How it Works Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-purple-400">Simple y rápido</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            ¿Cómo funciona Agenda Shessai?
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 dark:bg-purple-500 shadow-lg shadow-purple-500/20">
                <Smartphone className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold leading-8 text-slate-900 dark:text-white">1. Crea tu perfil</h3>
              <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">Regístrate en 2 minutos y personaliza tu enlace de reservas con tus servicios y horarios de trabajo.</p>
            </div>
            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 dark:bg-purple-500 shadow-lg shadow-purple-500/20">
                <LinkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold leading-8 text-slate-900 dark:text-white">2. Comparte tu link</h3>
              <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">Coloca tu enlace en Instagram, Facebook o envíalo por WhatsApp a tus clientes para que tengan acceso.</p>
            </div>
            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 dark:bg-purple-500 shadow-lg shadow-purple-500/20">
                <Calendar className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold leading-8 text-slate-900 dark:text-white">3. Citas en automático</h3>
              <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">Tus clientes se agendan solos 24/7 y reciben recordatorios por WhatsApp. Tú solo te dedicas a trabajar.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 bg-slate-100 dark:bg-slate-900/50 rounded-3xl my-10 border border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-purple-400">Casos de Éxito</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Negocios que ya están creciendo
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative">
            <div className="flex text-yellow-500 mb-6"><Star className="h-5 w-5 fill-current"/><Star className="h-5 w-5 fill-current"/><Star className="h-5 w-5 fill-current"/><Star className="h-5 w-5 fill-current"/><Star className="h-5 w-5 fill-current"/></div>
            <p className="text-slate-700 dark:text-slate-300 italic">"Gané mucha paz mental. Antes perdía horas contestando WhatsApp a media noche para agendar. Ahora mis clientes lo hacen solos."</p>
            <p className="mt-6 font-bold text-slate-900 dark:text-white">- André Rentería, Barberia Olimpo</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative">
             <div className="flex text-yellow-500 mb-6"><Star className="h-5 w-5 fill-current"/><Star className="h-5 w-5 fill-current"/><Star className="h-5 w-5 fill-current"/><Star className="h-5 w-5 fill-current"/><Star className="h-5 w-5 fill-current"/></div>
            <p className="text-slate-700 dark:text-slate-300 italic">"Los recordatorios automáticos por WhatsApp redujeron mis inasistencias a casi cero. El sistema se paga completamente solo."</p>
            <p className="mt-6 font-bold text-slate-900 dark:text-white">- Leonardo, Lions Dean</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative">
            <div className="flex text-yellow-500 mb-6"><Star className="h-5 w-5 fill-current"/><Star className="h-5 w-5 fill-current"/><Star className="h-5 w-5 fill-current"/><Star className="h-5 w-5 fill-current"/><Star className="h-5 w-5 fill-current"/></div>
            <p className="text-slate-700 dark:text-slate-300 italic">"El mejor diferenciador es el enlace privado. En otras apps mis clientes veían la publicidad de mi competencia al agendar. Aquí el control es mío."</p>
            <p className="mt-6 font-bold text-slate-900 dark:text-white">- Azucena Duarte, Unica Studio</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-purple-400">Todo lo que necesitas</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Gestiona tu negocio como un profesional
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900 dark:text-white">
                <Calendar className="h-5 w-5 flex-none text-blue-600 dark:text-purple-400" aria-hidden="true" />
                Reservas 24/7
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                <p className="flex-auto">
                  Tus clientes pueden reservar en cualquier momento desde tu enlace personalizado.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900 dark:text-white">
                <CheckCircle className="h-5 w-5 flex-none text-blue-600 dark:text-purple-400" aria-hidden="true" />
                Recordatorios WhatsApp
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                <p className="flex-auto">
                  Reduce el ausentismo con confirmaciones y recordatorios automáticos.
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 bg-slate-100 dark:bg-slate-900/50 rounded-3xl mb-24">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-purple-400">Precios Claros</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Planes diseñados para tu crecimiento
          </p>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Todos los planes incluyen 15 días de prueba sin costo. Cancela cuando quieras.
          </p>
        </div>
        
        <div className="mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:max-w-5xl lg:grid-cols-3">
          {/* Plan Básico */}
          <div className="flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 sm:p-10 transition-transform hover:-translate-y-1">
            <div>
              <h3 className="text-xl font-semibold leading-7 text-slate-900 dark:text-white">Emprendedor</h3>
              <p className="mt-4 flex items-baseline gap-x-2">
                <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">$600</span>
                <span className="text-sm font-semibold leading-6 text-slate-600 dark:text-slate-400">/mes</span>
              </p>
              <p className="mt-6 text-base leading-7 text-slate-600 dark:text-slate-400">
                Ideal para profesionales independientes que inician su propio espacio de trabajo.
              </p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <li className="flex gap-x-3"><CheckCircle className="h-6 w-5 flex-none text-blue-600 dark:text-purple-400" /> 1 Profesional activo</li>
                <li className="flex gap-x-3"><CheckCircle className="h-6 w-5 flex-none text-blue-600 dark:text-purple-400" /> Agenda compartible 24/7</li>
                <li className="flex gap-x-3"><CheckCircle className="h-6 w-5 flex-none text-blue-600 dark:text-purple-400" /> Recordatorios por WhatsApp</li>
              </ul>
            </div>
            <Link
              to="/register?plan=basico"
              className="mt-8 block rounded-full px-3 py-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ring-1 ring-inset ring-blue-600/20 text-blue-600 hover:ring-blue-600/30 dark:ring-purple-500/30 dark:text-purple-400 dark:hover:ring-purple-400 transition"
            >
              Comenzar prueba gratis
            </Link>
          </div>

          {/* Plan Intermedio (Popular) */}
          <div className="flex flex-col justify-between rounded-3xl bg-slate-900 dark:bg-slate-950 p-8 shadow-2xl ring-1 ring-blue-600 dark:ring-purple-500 sm:p-10 relative transition-transform hover:-translate-y-1">
            <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 text-center text-sm font-semibold text-white shadow-sm">
              Más Popular
            </div>
            <div>
              <h3 className="text-xl font-semibold leading-7 text-white">Estudio</h3>
              <p className="mt-4 flex items-baseline gap-x-2">
                <span className="text-4xl font-bold tracking-tight text-white">$1500</span>
                <span className="text-sm font-semibold leading-6 text-slate-400">/mes</span>
              </p>
              <p className="mt-6 text-base leading-7 text-slate-300">
                Para negocios consolidados con múltiples estaciones de trabajo y profesionales.
              </p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-300">
                <li className="flex gap-x-3"><CheckCircle className="h-6 w-5 flex-none text-purple-400" /> Múltiples Profesionales</li>
                <li className="flex gap-x-3"><CheckCircle className="h-6 w-5 flex-none text-purple-400" /> Estadísticas de Citas</li>
                <li className="flex gap-x-3"><CheckCircle className="h-6 w-5 flex-none text-purple-400" /> Recordatorios Inteligentes</li>
                <li className="flex gap-x-3"><CheckCircle className="h-6 w-5 flex-none text-purple-400" /> Control de Roles</li>
              </ul>
            </div>
            <Link
              to="/register?plan=intermedio"
              className="mt-8 block rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-3 text-center text-sm font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Comenzar prueba gratis
            </Link>
          </div>

          {/* Plan Avanzado */}
          <div className="flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 sm:p-10 transition-transform hover:-translate-y-1">
            <div>
              <h3 className="text-xl font-semibold leading-7 text-slate-900 dark:text-white">Corporativo</h3>
              <p className="mt-4 flex items-baseline gap-x-2">
                <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">$2500</span>
                <span className="text-sm font-semibold leading-6 text-slate-600 dark:text-slate-400">/mes</span>
              </p>
              <p className="mt-6 text-base leading-7 text-slate-600 dark:text-slate-400">
                Para franquicias o negocios que requieren conectividad avanzada.
              </p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <li className="flex gap-x-3"><CheckCircle className="h-6 w-5 flex-none text-blue-600 dark:text-purple-400" /> Profesionales ilimitados</li>
                <li className="flex gap-x-3"><CheckCircle className="h-6 w-5 flex-none text-blue-600 dark:text-purple-400" /> Conexiones personalizadas</li>
                <li className="flex gap-x-3"><CheckCircle className="h-6 w-5 flex-none text-blue-600 dark:text-purple-400" /> Soporte Prioritario 24/7</li>
                <li className="flex gap-x-3"><CheckCircle className="h-6 w-5 flex-none text-blue-600 dark:text-purple-400" /> Herramientas de Marketing</li>
              </ul>
            </div>
            <Link
              to="/register?plan=avanzado"
              className="mt-8 block rounded-full px-3 py-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ring-1 ring-inset ring-blue-600/20 text-blue-600 hover:ring-blue-600/30 dark:ring-purple-500/30 dark:text-purple-400 dark:hover:ring-purple-400 transition"
            >
              Comenzar prueba gratis
            </Link>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="mx-auto max-w-4xl px-6 lg:px-8 py-24 border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Preguntas Frecuentes
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Resolvemos tus dudas más comunes de forma transparente.
          </p>
        </div>
        <div className="space-y-4">
          <details className="group rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-slate-900 dark:text-white font-semibold text-lg">
              ¿Por qué somos diferentes a Booksy u otros marketplaces?
              <span className="relative size-5 shrink-0 text-blue-600 dark:text-purple-400">
                <svg className="size-5 shrink-0 transition duration-300 group-open:-rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </span>
            </summary>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
              A diferencia de los marketplaces tradicionales donde tu negocio aparece en un catálogo junto a cientos de competidores (y corres el riesgo de perder clientes por ofertas de otros o campañas publicitarias externas), <b>Agenda Shessai es de "Marca Blanca"</b>. <br/><br/>
              Tú posees tu propio enlace privado (`agenda.com/tu-negocio`) garantizando que cuando tu cliente entra, solo vea a tu negocio, tus servicios y tus logos. Son tus clientes y siempre serán tuyos.
            </p>
          </details>
          
          <details className="group rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-slate-900 dark:text-white font-semibold text-lg">
              ¿Mis clientes tienen que descargar alguna aplicación al celular?
              <span className="relative size-5 shrink-0 text-blue-600 dark:text-purple-400">
                <svg className="size-5 shrink-0 transition duration-300 group-open:-rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </span>
            </summary>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
              Cero descargas. Hemos optimizado nuestra agenda para que funcione directamente en cualquier navegador web móvil. Además, todo el flujo de notificaciones, recordatorios y confirmación se envía de forma amigable a través de WhatsApp.
            </p>
          </details>

          <details className="group rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-slate-900 dark:text-white font-semibold text-lg">
              ¿Tengo que pagar hoy para iniciar mi prueba de 15 días?
              <span className="relative size-5 shrink-0 text-blue-600 dark:text-purple-400">
                <svg className="size-5 shrink-0 transition duration-300 group-open:-rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </span>
            </summary>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
              ¡Absolutamente no! Te regalamos los primeros 15 días enteros para que uses el sistema sin límites de citas. Solo requerimos registrar la cuenta, pero <b>no se hará ningún cargo</b> hasta tu fecha de corte. Eres libre de cancelar en cualquier momento desde tu panel de administrador con un solo clic automatizado.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
