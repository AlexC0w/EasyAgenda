import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, Shield, Users } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-300">
      {/* Hero Section */}
      <header className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.emerald.100),theme(colors.slate.50))] opacity-40 dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.emerald.500),theme(colors.slate.950))] dark:opacity-20" />
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            Tu agenda, <span className="text-emerald-600 dark:text-emerald-400">simplificada</span>.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
            La plataforma todo en uno para negocios de belleza y bienestar. Gestiona citas, profesionales y recordatorios automáticos por WhatsApp.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/register"
              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            >
              Comenzar gratis
            </Link>
            <Link to="/login" className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">
              Ya tengo cuenta <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-emerald-600 dark:text-emerald-400">Todo lo que necesitas</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Gestiona tu negocio como un profesional
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900 dark:text-white">
                <Calendar className="h-5 w-5 flex-none text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
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
                <CheckCircle className="h-5 w-5 flex-none text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
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
    </div>
  );
};

export default LandingPage;
