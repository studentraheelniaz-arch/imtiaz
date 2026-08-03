import { Link, useSearchParams } from 'react-router-dom';

export default function PaymentFailed() {
  const [params] = useSearchParams();
  const ref = params.get('ref');

  return (
    <div className="mx-auto max-w-md px-5 py-14 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-3xl text-red-500">✕</div>
      <h1 className="mt-6 font-display text-2xl font-bold">Payment didn't go through</h1>
      <p className="mt-2 text-road-950/60">Your seat for booking {ref} was released. No charge was made.</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/" className="btn-primary">Search again</Link>
        <Link to="/my-bookings" className="btn-secondary">My bookings</Link>
      </div>
    </div>
  );
}
