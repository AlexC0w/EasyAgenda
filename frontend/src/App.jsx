import { NavLink, Route, Routes } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BookingPage from './pages/BookingPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

const App = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
    <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-900/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-400 to-emerald-600 text-2xl">
            💈
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Agenda Octane</h1>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">Barber studio</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition ${
                isActive
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                  : 'hover:border-slate-700 hover:bg-slate-800/60 hover:text-emerald-200'
              }`
            }
            end
          >
            <Menu className="h-4 w-4" />
            Reservar
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition ${
                isActive
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                  : 'hover:border-slate-700 hover:bg-slate-800/60 hover:text-emerald-200'
              }`
            }
          >
            Administración
          </NavLink>
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Routes>
        <Route path="/" element={<BookingPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </main>
    <ToastContainer position="top-right" theme="dark" closeOnClick pauseOnFocusLoss={false} />
  </div>
);

export default App;
