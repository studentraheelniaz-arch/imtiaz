import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/RouteGuards';

export default function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.adminRevenue(token).then(setData).catch((e) => setError(e.message));
  }, [token]);

  if (error) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!data) return <PageSpinner />;

  const maxDay = Math.max(1, ...data.byDay.map((d) => d.revenue));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total revenue" value={`Rs. ${data.totals.revenue.toLocaleString()}`} accent="text-magenta-500" />
        <StatCard label="Confirmed bookings" value={data.totals.bookings} accent="text-teal-600" />
        <StatCard label="Seats sold" value={data.totals.seats} accent="text-marigold-600" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-road-900/10 bg-white p-6">
          <p className="font-display font-semibold">Revenue by day</p>
          <div className="mt-4 space-y-2">
            {data.byDay.length === 0 && <p className="text-sm text-road-950/50">No confirmed bookings yet.</p>}
            {data.byDay.map((d) => (
              <div key={d.booking_date} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-road-950/60">{d.booking_date}</span>
                <div className="h-2 flex-1 rounded-full bg-road-900/5">
                  <div className="h-2 rounded-full bg-magenta-500" style={{ width: `${(d.revenue / maxDay) * 100}%` }} />
                </div>
                <span className="w-20 shrink-0 text-right font-mono">{d.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-road-900/10 bg-white p-6">
          <p className="font-display font-semibold">Revenue by route</p>
          <div className="mt-4 space-y-3">
            {data.byRoute.length === 0 && <p className="text-sm text-road-950/50">No confirmed bookings yet.</p>}
            {data.byRoute.map((r) => (
              <div key={`${r.departure_city}-${r.arrival_city}`} className="flex items-center justify-between rounded-xl bg-road-900/5 px-4 py-3 text-sm">
                <span>{r.departure_city} → {r.arrival_city}</span>
                <span className="font-mono font-semibold">Rs. {r.revenue.toLocaleString()} · {r.seats} seats</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-road-900/10 bg-white p-6">
      <p className="text-sm text-road-950/50">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
