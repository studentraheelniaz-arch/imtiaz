import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `font-display font-semibold transition ${isActive ? 'text-magenta-500' : 'text-road-950/70 hover:text-road-950'}`;

  return (
    <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b border-road-900/10">
      <div className="road-strip" />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-road-950 text-marigold-400 font-display font-bold">IT</span>
          <span className="font-display text-lg font-bold tracking-tight">Imtiaz Tayara</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={linkClass}>Book a seat</NavLink>
          <NavLink to="/my-bookings" className={linkClass}>My bookings</NavLink>
          {isAdmin && <NavLink to="/admin" className={linkClass}>Admin panel</NavLink>}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-road-950/60 sm:inline">Hi, {user.name.split(' ')[0]}</span>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="btn-secondary !px-4 !py-2 text-sm"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !px-4 !py-2 text-sm">Log in</Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
