import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const METHODS = [
  { id: 'jazzcash', label: 'JazzCash', blurb: 'Pay from your JazzCash mobile account.' },
  { id: 'upaisa', label: 'UPaisa', blurb: 'Pay from your UPaisa mobile account.' },
];

export default function Payment() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState('jazzcash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function pay() {
    setLoading(true);
    setError('');
    try {
      const result = await api.initiatePayment({ booking_id: Number(id), method }, token);
      navigate(result.redirectUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-14">
      <h1 className="font-display text-2xl font-bold">Choose how to pay</h1>
      <p className="mt-1 text-sm text-road-950/60">Your seat is held for a few minutes while you complete payment.</p>

      <div className="mt-8 space-y-3">
        {METHODS.map((m) => (
          <label
            key={m.id}
            className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition ${method === m.id ? 'border-magenta-500 bg-magenta-500/5' : 'border-road-900/10 bg-white'}`}
          >
            <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="h-4 w-4 accent-magenta-500" />
            <div>
              <p className="font-display font-semibold">{m.label}</p>
              <p className="text-sm text-road-950/50">{m.blurb}</p>
            </div>
          </label>
        ))}
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <button onClick={pay} disabled={loading} className="btn-primary mt-8 w-full">
        {loading ? 'Redirecting…' : `Pay with ${METHODS.find((m) => m.id === method).label}`}
      </button>
    </div>
  );
}
