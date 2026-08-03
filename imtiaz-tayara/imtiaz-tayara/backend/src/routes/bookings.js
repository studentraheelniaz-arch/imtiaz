import { Router } from 'express';
import { customAlphabet } from 'nanoid';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8); // no ambiguous chars, no dashes

function seatsTakenFor(scheduleId, date) {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(seats_booked), 0) taken FROM bookings
       WHERE schedule_id = ? AND booking_date = ? AND status != 'cancelled'`
    )
    .get(scheduleId, date);
  return row.taken;
}

router.post('/', authenticate, (req, res) => {
  const { schedule_id, booking_date, seats_booked, passenger_name, passenger_phone, boarding_point } = req.body || {};

  if (!schedule_id || !booking_date || !seats_booked || !passenger_name || !passenger_phone) {
    return res.status(400).json({
      error: 'schedule_id, booking_date, seats_booked, passenger_name, and passenger_phone are required.',
    });
  }
  if (seats_booked < 1) return res.status(400).json({ error: 'seats_booked must be at least 1.' });

  const schedule = db
    .prepare('SELECT s.*, v.capacity FROM schedules s JOIN vans v ON v.id = s.van_id WHERE s.id = ?')
    .get(schedule_id);
  if (!schedule || !schedule.is_active) return res.status(404).json({ error: 'Schedule not found or inactive.' });

  const taken = seatsTakenFor(schedule_id, booking_date);
  const available = schedule.capacity - taken;
  if (seats_booked > available) {
    return res.status(409).json({ error: `Only ${available} seat(s) left for this schedule on ${booking_date}.` });
  }

  const totalPrice = schedule.price * seats_booked;
  const reference = `IT-${nanoid()}`;

  const info = db
    .prepare(
      `INSERT INTO bookings
        (user_id, schedule_id, booking_date, seats_booked, passenger_name, passenger_phone, boarding_point, total_price, status, booking_reference)
       VALUES (?,?,?,?,?,?,?,?, 'pending', ?)`
    )
    .run(
      req.user.id,
      schedule_id,
      booking_date,
      seats_booked,
      passenger_name,
      passenger_phone,
      boarding_point || null,
      totalPrice,
      reference
    );

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ booking });
});

router.get('/:id', authenticate, (req, res) => {
  const booking = db
    .prepare(
      `SELECT b.*, s.departure_city, s.arrival_city, s.departure_time, s.arrival_time
       FROM bookings b JOIN schedules s ON s.id = b.schedule_id WHERE b.id = ?`
    )
    .get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });
  if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'You do not have access to this booking.' });
  }
  res.json({ booking });
});

// A customer's own booking history
router.get('/', authenticate, (req, res) => {
  const rows = db
    .prepare(
      `SELECT b.*, s.departure_city, s.arrival_city, s.departure_time, s.arrival_time
       FROM bookings b JOIN schedules s ON s.id = b.schedule_id
       WHERE b.user_id = ? ORDER BY b.created_at DESC`
    )
    .all(req.user.id);
  res.json({ bookings: rows });
});

export default router;
