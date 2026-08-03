import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/RouteGuards';

export default function ManageVans() {
  const { token } = useAuth();
  const [vans, setVans] = useState(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  async function load() {
    try { setVans((await api.adminVans(token)).vans); } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, [token]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Vans</h1>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary !px-4 !py-2 text-sm">
          {showForm ? 'Close' : '+ Add van'}
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {showForm && <NewVanForm token={token} onCreated={() => { setShowForm(false); load(); }} />}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {vans === null && <PageSpinner />}
        {vans?.map((v) => <VanCard key={v.id} van={v} token={token} onChanged={load} />)}
      </div>
    </div>
  );
}

function VanCard({ van, token, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [driver_name, setDriverName] = useState(van.driver_name || '');
  const [driver_phone, setDriverPhone] = useState(van.driver_phone || '');
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await api.adminUpdateVan(van.id, { driver_name, driver_phone }, token);
      setEditing(false);
      onChanged();
    } finally { setBusy(false); }
  }

  async function toggleActive() {
    setBusy(true);
    try {
      await api.adminUpdateVan(van.id, { is_active: van.is_active ? 0 : 1 }, token);
      onChanged();
    } finally { setBusy(false); }
  }

  return (
    <div className="rounded-2xl border border-road-900/10 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="font-display font-semibold">{van.van_number}</p>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${van.is_active ? 'bg-teal-500/10 text-teal-700' : 'bg-road-900/10 text-road-950/50'}`}>
          {van.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <p className="text-sm text-road-950/50">{van.capacity} seats</p>

      {editing ? (
        <div className="mt-3 space-y-2">
          <input value={driver_name} onChange={(e) => setDriverName(e.target.value)} className="input-field !py-1.5 text-sm" placeholder="Driver name" />
          <input value={driver_phone} onChange={(e) => setDriverPhone(e.target.value)} className="input-field !py-1.5 text-sm" placeholder="Driver phone" />
          <div className="flex gap-2">
            <button onClick={save} disabled={busy} className="btn-primary !px-3 !py-1.5 text-xs">Save</button>
            <button onClick={() => setEditing(false)} className="btn-secondary !px-3 !py-1.5 text-xs">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-road-950/70">
            <p>{van.driver_name || '—'}</p>
            <p className="text-road-950/40">{van.driver_phone || '—'}</p>
          </div>
          <div className="flex gap-2 text-xs">
            <button onClick={() => setEditing(true)} className="text-road-950/40 hover:text-road-950">Edit</button>
            <button onClick={toggleActive} disabled={busy} className="text-road-950/40 hover:text-red-600">
              {van.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NewVanForm({ token, onCreated }) {
  const [van_number, setVanNumber] = useState('');
  const [capacity, setCapacity] = useState(12);
  const [driver_name, setDriverName] = useState('');
  const [driver_phone, setDriverPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.adminCreateVan({ van_number, capacity: Number(capacity), driver_name, driver_phone }, token);
      onCreated();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl border border-road-900/10 bg-white p-5 sm:grid-cols-5">
      <input required value={van_number} onChange={(e) => setVanNumber(e.target.value)} className="input-field" placeholder="Van number (e.g. IT-105)" />
      <input type="number" min="1" required value={capacity} onChange={(e) => setCapacity(e.target.value)} className="input-field" placeholder="Capacity" />
      <input value={driver_name} onChange={(e) => setDriverName(e.target.value)} className="input-field" placeholder="Driver name" />
      <input value={driver_phone} onChange={(e) => setDriverPhone(e.target.value)} className="input-field" placeholder="Driver phone" />
      <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Adding…' : 'Add van'}</button>
      {error && <p className="text-sm text-red-700 sm:col-span-5">{error}</p>}
    </form>
  );
}
