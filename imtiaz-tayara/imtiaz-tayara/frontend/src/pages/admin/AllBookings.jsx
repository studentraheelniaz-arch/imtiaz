import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/RouteGuards';

const STATUS_STYLES = {
  confirmed: 'bg-teal-500/10 text-teal-700',
  pending: 'bg-marigold-500/10 text-marigold-600',
  cancelled: 'bg-road-900/10 text-road-950/50',
};

export default function AllBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');

  async function load() {
    const qs = [];
    if (date) qs.push(`date=${date}`);
    if (status) qs.push(`status=${status}`);
    try {
      setBookings((await api.adminBookings(token, qs.length ? `?${qs.join('&')}` : '')).bookings);
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, [token, date, status]);

  async function cancel(id) {
    if (!confirm('Cancel this booking?')) return;
    await api.adminCancelBooking(id, token);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">All bookings</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field !w-auto" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field !w-auto">
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="mt-6 space-y-3">
        {bookings === null && !error && <PageSpinner />}
        {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {bookings?.length === 0 && <p className="text-sm text-road-950/50">No bookings match these filters.</p>}
        {bookings?.map((b) => (
          <div key={b.id} className="flex flex-col gap-2 rounded-2xl border border-road-900/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display font-semibold">{b.passenger_name} · {b.departure_city} → {b.arrival_city}</p>
              <p className="text-sm text-road-950/50">{b.booking_date} · {b.departure_time}–{b.arrival_time} · {b.seats_booked} seat(s) · {b.customer_email}</p>
              <p className="font-mono text-xs text-road-950/40">Ref: {b.booking_reference}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[b.status]}`}>{b.status}</span>
              <span className="font-display font-bold">Rs. {b.total_price.toLocaleString()}</span>
              {b.status !== 'cancelled' && (
                <button onClick={() => cancel(b.id)} className="text-sm text-road-950/40 hover:text-red-600">Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
