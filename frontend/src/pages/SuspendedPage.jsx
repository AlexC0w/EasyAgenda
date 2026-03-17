import { ShieldAlert, Phone } from 'lucide-react';

const SuspendedPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-center">
      <div className="max-w-md w-full animate-fade-in relative">
        {/* Glow effect behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6 rounded-full bg-rose-500/10 p-5 ring-1 ring-rose-500/30">
            <ShieldAlert className="h-12 w-12 text-rose-500" />
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Servicio Suspendido
          </h1>
          
          <div className="mt-4 space-y-2">
            <p className="text-base text-slate-400">
              Esta cuenta requiere atención administrativa.
            </p>
            <p className="text-sm text-slate-500">
              El acceso a la plataforma y las reservas ha sido restringido temporalmente.
            </p>
          </div>

          <div className="mt-8 w-full rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              ¿Eres el propietario?
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Por favor comunícate con soporte para resolver cualquier pendiente y restaurar el servicio de inmediato.
            </p>
            
            <a 
              href="https://wa.me/526271310248" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500 shadow-lg shadow-blue-500/20"
            >
              <Phone className="h-4 w-4" />
              Contactar a Soporte
            </a>
          </div>
          
          <p className="mt-8 text-xs text-slate-600">
            ID de referencia: ACCOUNT_SUSPENDED
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuspendedPage;
