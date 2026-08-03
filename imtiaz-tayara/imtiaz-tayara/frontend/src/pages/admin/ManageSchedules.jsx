import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/RouteGuards';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ManageSchedules() {
  const { token } = useAuth();
  const [schedules, setSchedules] = useState(null);
  const [vans, setVans] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  async function load() {
    try {
      const [s, v] = await Promise.all([api.adminSchedules(token), api.adminVans(token)]);
      setSchedules(s.schedules);
      setVans(v.vans);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, [token]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Schedules &amp; fares</h1>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary !px-4 !py-2 text-sm">
          {showForm ? 'Close' : '+ Add schedule'}
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {showForm && (
        <NewScheduleForm
          vans={vans}
          token={token}
          onCreated={() => { setShowForm(false); load(); }}
        />
      )}

      <div className="mt-6 space-y-3">
        {schedules === null && <PageSpinner />}
        {schedules?.map((s) => (
          <ScheduleRow key={s.id} schedule={s} token={token} onChanged={load} />
        ))}
      </div>
    </div>
  );
}

function ScheduleRow({ schedule, token, onChanged }) {
  const [editingPrice, setEditingPrice] = useState(false);
  const [price, setPrice] = useState(schedule.price);
  const [editingTime, setEditingTime] = useState(false);
  const [departure, setDeparture] = useState(schedule.departure_time);
  const [arrival, setArrival] = useState(schedule.arrival_time);
  const [days, setDays] = useState(schedule.available_days.split(','));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function savePrice() {
    setBusy(true);
    setError('');
    try {
      await api.adminUpdatePrice(schedule.id, Number(price), token);
      setEditingPrice(false);
      onChanged();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  async function saveTiming() {
    setBusy(true);
    setError('');
    try {
      await api.adminUpdateSchedule(schedule.id, { departure_time: departure, arrival_time: arrival, available_days: days.join(',') }, token);
      setEditingTime(false);
      onChanged();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  async function remove() {
    if (!confirm('Remove this schedule? It will stop appearing in search but history is kept.')) return;
    setBusy(true);
    try {
      await api.adminDeleteSchedule(schedule.id, token);
      onChanged();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  function toggleDay(d) {
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  }

  return (
    <div className={`rounded-2xl border p-5 ${schedule.is_active ? 'border-road-900/10 bg-white' : 'border-road-900/10 bg-road-900/5 opacity-60'}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display font-semibold">{schedule.departure_city} → {schedule.arrival_city} · {schedule.van_number}</p>
          <p className="text-xs text-road-950/50">{schedule.available_days.split(',').join(' · ')}</p>
        </div>

        {/* Timing */}
        {editingTime ? (
          <div className="flex flex-wrap items-center gap-2">
            <input type="time" value={departure} onChange={(e) => setDeparture(e.target.value)} className="input-field !w-28 !py-1.5 text-sm" />
            <span className="text-road-950/40">→</span>
            <input type="time" value={arrival} onChange={(e) => setArrival(e.target.value)} className="input-field !w-28 !py-1.5 text-sm" />
            <div className="flex gap-1">
              {DAYS.map((d) => (
                <button key={d} type="button" onClick={() => toggleDay(d)}
                  className={`rounded-md px-1.5 py-1 text-xs font-semibold ${days.includes(d) ? 'bg-teal-500 text-white' : 'bg-road-900/5 text-road-950/40'}`}>
                  {d[0]}
                </button>
              ))}
            </div>
            <button onClick={saveTiming} disabled={busy} className="btn-primary !px-3 !py-1.5 text-xs">Save</button>
            <button onClick={() => setEditingTime(false)} className="btn-secondary !px-3 !py-1.5 text-xs">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditingTime(true)} className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm hover:bg-road-900/5">
            <span className="font-mono">{schedule.departure_time} → {schedule.arrival_time}</span>
            <span className="text-xs text-road-950/40">edit</span>
          </button>
        )}

        {/* Price */}
        {editingPrice ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-road-950/50">Rs.</span>
            <input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field !w-24 !py-1.5 text-sm" />
            <button onClick={savePrice} disabled={busy} className="btn-primary !px-3 !py-1.5 text-xs">Save</button>
            <button onClick={() => setEditingPrice(false)} className="btn-secondary !px-3 !py-1.5 text-xs">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditingPrice(true)} className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm hover:bg-road-900/5">
            <span className="font-display font-bold text-magenta-500">Rs. {schedule.price.toLocaleString()}</span>
            <span className="text-xs text-road-950/40">edit</span>
          </button>
        )}

        <button onClick={remove} disabled={busy} className="text-sm text-road-950/40 hover:text-red-600">
          {schedule.is_active ? 'Remove' : 'Removed'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}

function NewScheduleForm({ vans, token, onCreated }) {
  const [van_id, setVanId] = useState(vans[0]?.id || '');
  const [departure_city, setDepartureCity] = useState('Gambat');
  const [arrival_city, setArrivalCity] = useState('Karachi');
  const [departure_time, setDepartureTime] = useState('08:00');
  const [arrival_time, setArrivalTime] = useState('15:30');
  const [price, setPrice] = useState(2500);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.adminCreateSchedule({ van_id: Number(van_id), departure_city, arrival_city, departure_time, arrival_time, price: Number(price) }, token);
      onCreated();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl border border-road-900/10 bg-white p-5 sm:grid-cols-6">
      <select value={van_id} onChange={(e) => setVanId(e.target.value)} className="input-field sm:col-span-2" required>
        {vans.map((v) => <option key={v.id} value={v.id}>{v.van_number} ({v.capacity} seats)</option>)}
      </select>
      <select value={departure_city} onChange={(e) => setDepartureCity(e.target.value)} className="input-field">
        <option>Gambat</option><option>Karachi</option>
      </select>
      <select value={arrival_city} onChange={(e) => setArrivalCity(e.target.value)} className="input-field">
        <option>Karachi</option><option>Gambat</option>
      </select>
      <input type="time" value={departure_time} onChange={(e) => setDepartureTime(e.target.value)} className="input-field" required />
      <input type="time" value={arrival_time} onChange={(e) => setArrivalTime(e.target.value)} className="input-field" required />
      <input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field sm:col-span-2" placeholder="Price (Rs.)" required />
      <button type="submit" disabled={busy} className="btn-primary sm:col-span-1">{busy ? 'Adding…' : 'Add'}</button>
      {error && <p className="text-sm text-red-700 sm:col-span-6">{error}</p>}
    </form>
  );
}
