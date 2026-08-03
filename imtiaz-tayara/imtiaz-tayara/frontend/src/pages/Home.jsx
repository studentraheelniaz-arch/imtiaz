import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Home() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('Gambat');
  const [to, setTo] = useState('Karachi');
  const [date, setDate] = useState(todayISO());

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function onSubmit(e) {
    e.preventDefault();
    navigate(`/search?from=${from}&to=${to}&date=${date}`);
  }

  return (
    <div>
      {/* Hero: the search form itself is the thesis — booking a seat is the
          single job of this page, so the form leads, not a marketing banner. */}
      <section className="relative overflow-hidden bg-road-950">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
          <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-marigold-400 blur-3xl" />
          <div className="absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-magenta-500 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-teal-400 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pb-24 sm:pt-20">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-marigold-400">Gambat ⇄ Karachi, every day</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Book your van seat in under a minute.
          </h1>
          <p className="mt-4 max-w-xl text-paper/70">
            Real-time seats, fixed fares, and instant e-tickets. Pay with JazzCash or UPaisa and get your confirmation by SMS.
          </p>

          <form onSubmit={onSubmit} className="ticket-stub mt-10 grid gap-4 p-6 sm:grid-cols-[1fr_auto_1fr_1fr_auto] sm:items-end sm:p-8">
            <div>
              <label className="label-field">From</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="input-field">
                <option>Gambat</option>
                <option>Karachi</option>
              </select>
            </div>

            <button
              type="button"
              onClick={swap}
              aria-label="Swap origin and destination"
              className="mx-auto mb-0.5 hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-road-900/15 text-road-900 transition hover:border-magenta-500 hover:text-magenta-500 sm:flex"
            >
              ⇄
            </button>

            <div>
              <label className="label-field">To</label>
              <select value={to} onChange={(e) => setTo(e.target.value)} className="input-field">
                <option>Karachi</option>
                <option>Gambat</option>
              </select>
            </div>

            <div>
              <label className="label-field">Travel date</label>
              <input type="date" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} className="input-field" required />
            </div>

            <button type="submit" className="btn-primary w-full sm:w-auto">
              Search vans
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { title: 'Real seats, real time', body: 'Availability updates the moment a seat is booked — no overbooked vans.' },
            { title: 'JazzCash & UPaisa', body: 'Pay the way you already do. Your booking confirms the instant payment clears.' },
            { title: 'E-ticket by SMS & email', body: 'Your reference number and boarding details land in your inbox and your phone.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-road-900/10 bg-white p-6">
              <p className="font-display font-semibold text-road-950">{f.title}</p>
              <p className="mt-2 text-sm text-road-950/60">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
