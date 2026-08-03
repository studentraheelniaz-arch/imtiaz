import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';

// Stands in for the hosted JazzCash / UPaisa checkout page. Real credentials
// (see README) replace this entire route with an actual gateway redirect —
// nothing else in the booking flow needs to change.
export default function MockCheckout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const txn = params.get('txn');
  const amount = params.get('amount');
  const ref = params.get('ref');
  const method = params.get('method');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function complete(fail) {
    setLoading(true);
    setError('');
    try {
      await api.mockPay(txn, fail);
      navigate(fail ? `/payment-failed?ref=${ref}` : `/confirmation?ref=${ref}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-14">
      <div className="rounded-2xl border border-road-900/10 bg-white p-6 text-center shadow-sm">
        <p className="font-display text-lg font-bold uppercase tracking-wide text-road-950/40">{method}</p>
        <p className="mt-1 text-xs text-road-950/40">Sandbox checkout — simulates the real gateway</p>
        <p className="mt-6 font-display text-3xl font-bold">Rs. {Number(amount).toLocaleString()}</p>
        <p className="mt-1 font-mono text-sm text-road-950/50">Ref: {ref}</p>

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <button onClick={() => complete(false)} disabled={loading} className="btn-primary mt-8 w-full">
          {loading ? 'Processing…' : 'Confirm payment'}
        </button>
        <button onClick={() => complete(true)} disabled={loading} className="mt-3 w-full text-sm text-road-950/40 underline hover:text-road-950/70">
          Simulate a failed payment
        </button>
      </div>
    </div>
  );
}
