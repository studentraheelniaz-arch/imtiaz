import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { PageSpinner } from '../components/RouteGuards';

export default function SearchResults() {
  const [params] = useSearchParams();
  const from = params.get('from') || 'Gambat';
  const to = params.get('to') || 'Karachi';
  const date = params.get('date') || '';

  const [schedules, setSchedules] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setSchedules(null);
    setError('');
    api.searchSchedules(from, to, date)
      .then((d) => setSchedules(d.schedules))
      .catch((e) => setError(e.message));
  }, [from, to, date]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <div className="road-strip rounded-full" />
      <h1 className="mt-6 font-display text-2xl font-bold">
        {from} <span className="text-magenta-500">→</span> {to}
      </h1>
      <p className="mt-1 text-sm text-road-950/60">
        {date ? new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Any date'}
      </p>

      <div className="mt-8 space-y-4">
        {schedules === null && !error && <PageSpinner />}
        {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {schedules?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-road-900/20 p-10 text-center text-road-950/60">
            No vans scheduled for this route on this day yet. Try another date.
          </div>
        )}
        {schedules?.map((s) => (
          <ScheduleCard key={s.id} schedule={s} date={date} />
        ))}
      </div>
    </div>
  );
}

function ScheduleCard({ schedule, date }) {
  const soldOut = date && schedule.seats_available <= 0;
  return (
    <div className="ticket-stub flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="font-mono text-xl font-bold">{schedule.departure_time}</p>
          <p className="text-xs uppercase tracking-wide text-road-950/50">{schedule.departure_city}</p>
        </div>
        <div className="flex flex-col items-center text-road-950/30">
          <span className="text-xs">{schedule.van_number}</span>
          <span>— — — →</span>
        </div>
        <div className="text-center">
          <p className="font-mono text-xl font-bold">{schedule.arrival_time}</p>
          <p className="text-xs uppercase tracking-wide text-road-950/50">{schedule.arrival_city}</p>
        </div>
      </div>

      <div className="ticket-divider flex items-center gap-6 pl-6 sm:pl-8">
        <div>
          <p className="font-display text-2xl font-bold text-magenta-500">Rs. {schedule.price.toLocaleString()}</p>
          <p className="text-xs text-road-950/50">
            {date ? `${schedule.seats_available} of ${schedule.capacity} seats left` : `${schedule.capacity} seats`}
          </p>
        </div>
        <Link
          to={soldOut ? '#' : `/booking/${schedule.id}?date=${date}`}
          aria-disabled={soldOut}
          className={soldOut ? 'btn-secondary pointer-events-none opacity-40' : 'btn-primary'}
        >
          {soldOut ? 'Sold out' : 'Select'}
        </Link>
      </div>
    </div>
  );
}
