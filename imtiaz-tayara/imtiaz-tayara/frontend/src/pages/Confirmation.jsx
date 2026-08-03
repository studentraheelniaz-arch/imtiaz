import { Link, useSearchParams } from 'react-router-dom';

export default function Confirmation() {
  const [params] = useSearchParams();
  const ref = params.get('ref');

  return (
    <div className="mx-auto max-w-md px-5 py-14 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-500/10 text-3xl text-teal-600">✓</div>
      <h1 className="mt-6 font-display text-2xl font-bold">Booking confirmed!</h1>
      <p className="mt-2 text-road-950/60">Your e-ticket has been sent by SMS and email.</p>

      <div className="ticket-stub mt-8 p-6">
        <p className="text-xs uppercase tracking-wide text-road-950/40">Booking reference</p>
        <p className="mt-1 font-mono text-2xl font-bold text-magenta-500">{ref}</p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/my-bookings" className="btn-primary">View my bookings</Link>
        <Link to="/" className="btn-secondary">Book another seat</Link>
      </div>
    </div>
  );
}
