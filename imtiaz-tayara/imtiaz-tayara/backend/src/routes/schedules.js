import { Router } from 'express';
import db from '../db.js';

const router = Router();

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function seatsTakenFor(scheduleId, date) {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(seats_booked), 0) taken FROM bookings
       WHERE schedule_id = ? AND booking_date = ? AND status != 'cancelled'`
    )
    .get(scheduleId, date);
  return row.taken;
}

// GET /api/schedules?from=Gambat&to=Karachi&date=2026-08-10
router.get('/', (req, res) => {
  const { from, to, date } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to query params are required.' });

  const rows = db
    .prepare(
      `SELECT s.*, v.van_number, v.capacity, v.driver_name, v.driver_phone
       FROM schedules s JOIN vans v ON v.id = s.van_id
       WHERE s.departure_city = ? AND s.arrival_city = ? AND s.is_active = 1 AND v.is_active = 1
       ORDER BY s.departure_time ASC`
    )
    .all(from, to);

  const filteredByDay = date
    ? rows.filter((r) => {
        const day = DAY_NAMES[new Date(date + 'T00:00:00').getDay()];
        return r.available_days.split(',').includes(day);
      })
    : rows;

  const withAvailability = filteredByDay.map((r) => {
    const taken = date ? seatsTakenFor(r.id, date) : 0;
    return { ...r, seats_available: Math.max(0, r.capacity - taken) };
  });

  res.json({ schedules: withAvailability });
});

router.get('/:id', (req, res) => {
  const row = db
    .prepare(
      `SELECT s.*, v.van_number, v.capacity, v.driver_name, v.driver_phone
       FROM schedules s JOIN vans v ON v.id = s.van_id WHERE s.id = ?`
    )
    .get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Schedule not found.' });
  res.json({ schedule: row });
});

export default router;
