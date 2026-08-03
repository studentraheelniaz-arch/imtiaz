import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { PageSpinner } from '../components/RouteGuards';

const STATUS_STYLES = {
  confirmed: 'bg-teal-500/10 text-teal-700',
  pending: 'bg-marigold-500/10 text-marigold-600',
  cancelled: 'bg-road-900/10 text-road-950/50',
};

export default function MyBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.myBookings(token).then((d) => setBookings(d.bookings)).catch((e) => setError(e.message));
  }, [token]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-2xl font-bold">My bookings</h1>

      <div className="mt-8 space-y-4">
        {bookings === null && !error && <PageSpinner />}
        {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {bookings?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-road-900/20 p-10 text-center text-road-950/60">
            No bookings yet. Ready when you are.
          </div>
        )}
        {bookings?.map((b) => (
          <div key={b.id} className="ticket-stub flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display font-semibold">{b.departure_city} → {b.arrival_city}</p>
              <p className="text-sm text-road-950/60">{b.booking_date} · {b.departure_time}–{b.arrival_time} · {b.seats_booked} seat(s)</p>
              <p className="mt-1 font-mono text-xs text-road-950/40">Ref: {b.booking_reference}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[b.status]}`}>{b.status}</span>
              <span className="font-display font-bold">Rs. {b.total_price.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
