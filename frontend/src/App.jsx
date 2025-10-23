import { NavLink, Route, Routes } from 'react-router-dom';
import BookingPage from './pages/BookingPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

const App = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <header className="bg-slate-900 border-b border-slate-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold text-emerald-400">Agenda Octane</h1>
        <nav className="flex gap-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `transition hover:text-emerald-300 ${isActive ? 'text-emerald-400' : ''}`
            }
            end
          >
            Reservar
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `transition hover:text-emerald-300 ${isActive ? 'text-emerald-400' : ''}`
            }
          >
            Administración
          </NavLink>
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Routes>
        <Route path="/" element={<BookingPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </main>
  </div>
);

export default App;
