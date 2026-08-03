import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { PageSpinner } from '../components/RouteGuards';

export default function Booking() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const date = params.get('date') || '';
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [seats, setSeats] = useState(1);
  const [passengerName, setPassengerName] = useState(user?.name || '');
  const [passengerPhone, setPassengerPhone] = useState(user?.phone || '');
  const [boardingPoint, setBoardingPoint] = useState('');

  useEffect(() => {
    api.getSchedule(id).then((d) => setSchedule(d.schedule)).catch((e) => setError(e.message));
  }, [id]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!token) {
      navigate('/login', { state: { from: { pathname: `/booking/${id}`, search: `?date=${date}` } } });
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { booking } = await api.createBooking(
        { schedule_id: Number(id), booking_date: date, seats_booked: Number(seats), passenger_name: passengerName, passenger_phone: passengerPhone, boarding_point: boardingPoint },
        token
      );
      navigate(`/payment/${booking.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!schedule && !error) return <PageSpinner />;
  if (error && !schedule) return <p className="mx-auto max-w-lg px-5 py-10 text-red-700">{error}</p>;

  const total = schedule.price * seats;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-2xl font-bold">Passenger details</h1>

      <div className="ticket-stub mt-6 grid gap-0 sm:grid-cols-[1.4fr_1fr]">
        <form onSubmit={onSubmit} className="space-y-4 p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Passenger name</label>
              <input required value={passengerName} onChange={(e) => setPassengerName(e.target.value)} className="input-field" placeholder="Full name" />
            </div>
            <div>
              <label className="label-field">Phone number</label>
              <input required value={passengerPhone} onChange={(e) => setPassengerPhone(e.target.value)} className="input-field" placeholder="03xx-xxxxxxx" />
            </div>
          </div>

          <div>
            <label className="label-field">Boarding point (optional)</label>
            <input value={boardingPoint} onChange={(e) => setBoardingPoint(e.target.value)} className="input-field" placeholder="e.g. Gambat Chowk" />
          </div>

          <div>
            <label className="label-field">Seats</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setSeats((s) => Math.max(1, s - 1))} className="btn-secondary !px-4 !py-2">−</button>
              <span className="w-8 text-center font-display text-lg font-bold">{seats}</span>
              <button type="button" onClick={() => setSeats((s) => Math.min(schedule.capacity, s + 1))} className="btn-secondary !px-4 !py-2">+</button>
            </div>
          </div>

          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Booking…' : 'Continue to payment'}
          </button>
        </form>

        <div className="ticket-divider bg-road-950 p-6 text-paper sm:p-8">
          <p className="text-xs uppercase tracking-wide text-marigold-400">Trip summary</p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-lg font-bold">{schedule.departure_time}</p>
              <p className="text-xs text-paper/60">{schedule.departure_city}</p>
            </div>
            <span className="text-paper/30">→</span>
            <div className="text-right">
              <p className="font-mono text-lg font-bold">{schedule.arrival_time}</p>
              <p className="text-xs text-paper/60">{schedule.arrival_city}</p>
            </div>
          </div>
          <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm text-paper/70">
            <p>Van {schedule.van_number} · {schedule.driver_name}</p>
            <p>{seats} seat(s) × Rs. {schedule.price.toLocaleString()}</p>
          </div>
          <p className="mt-4 font-display text-2xl font-bold text-marigold-400">Rs. {total.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
