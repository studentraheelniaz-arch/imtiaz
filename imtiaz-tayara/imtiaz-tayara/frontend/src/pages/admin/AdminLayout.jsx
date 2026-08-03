import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/schedules', label: 'Schedules & fares' },
  { to: '/admin/vans', label: 'Vans' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/logs', label: 'Audit log' },
];

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="shrink-0 md:w-56">
          <p className="font-display text-lg font-bold">Admin panel</p>
          <nav className="mt-4 flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-road-950 text-white' : 'text-road-950/70 hover:bg-road-900/5'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
