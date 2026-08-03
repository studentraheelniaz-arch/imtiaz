import { Router } from 'express';
import db from '../db.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, authorizeAdmin);

function logAction(adminId, action, details) {
  db.prepare('INSERT INTO admin_logs (admin_id, action, details) VALUES (?,?,?)').run(
    adminId,
    action,
    JSON.stringify(details || {})
  );
}

// ---------- Schedules ----------

router.get('/schedules', (req, res) => {
  const rows = db
    .prepare(
      `SELECT s.*, v.van_number, v.capacity
       FROM schedules s JOIN vans v ON v.id = s.van_id
       ORDER BY s.departure_city, s.departure_time`
    )
    .all();
  res.json({ schedules: rows });
});

router.post('/schedules', (req, res) => {
  const { van_id, departure_city, arrival_city, departure_time, arrival_time, price, available_days } = req.body || {};
  if (!van_id || !departure_city || !arrival_city || !departure_time || !arrival_time || price == null) {
    return res.status(400).json({ error: 'van_id, departure_city, arrival_city, departure_time, arrival_time, and price are required.' });
  }
  const info = db
    .prepare(
      `INSERT INTO schedules (van_id, departure_city, arrival_city, departure_time, arrival_time, price, available_days)
       VALUES (?,?,?,?,?,?,?)`
    )
    .run(van_id, departure_city, arrival_city, departure_time, arrival_time, price, available_days || 'Mon,Tue,Wed,Thu,Fri,Sat,Sun');

  logAction(req.user.id, 'schedule_created', { schedule_id: info.lastInsertRowid });
  const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ schedule });
});

router.put('/schedules/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Schedule not found.' });

  const fields = ['departure_time', 'arrival_time', 'available_days', 'is_active', 'van_id'];
  const updates = {};
  for (const f of fields) if (req.body?.[f] !== undefined) updates[f] = req.body[f];

  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields to update.' });

  const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  db.prepare(`UPDATE schedules SET ${setClause} WHERE id = ?`).run(...Object.values(updates), req.params.id);

  logAction(req.user.id, 'timing_changed', { schedule_id: req.params.id, updates });
  const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id);
  res.json({ schedule });
});

router.patch('/schedules/:id/price', (req, res) => {
  const { price } = req.body || {};
  if (price == null || price <= 0) return res.status(400).json({ error: 'A positive price is required.' });

  const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Schedule not found.' });

  db.prepare('UPDATE schedules SET price = ? WHERE id = ?').run(price, req.params.id);
  logAction(req.user.id, 'price_updated', { schedule_id: req.params.id, old_price: existing.price, new_price: price });

  res.json({ message: 'Price updated successfully.', schedule: db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id) });
});

router.delete('/schedules/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Schedule not found.' });

  db.prepare('UPDATE schedules SET is_active = 0 WHERE id = ?').run(req.params.id); // soft delete
  logAction(req.user.id, 'schedule_removed', { schedule_id: req.params.id });
  res.json({ message: 'Schedule removed.' });
});

// ---------- Vans ----------

router.get('/vans', (req, res) => {
  res.json({ vans: db.prepare('SELECT * FROM vans ORDER BY van_number').all() });
});

router.post('/vans', (req, res) => {
  const { van_number, capacity, driver_name, driver_phone } = req.body || {};
  if (!van_number || !capacity) return res.status(400).json({ error: 'van_number and capacity are required.' });

  const existing = db.prepare('SELECT id FROM vans WHERE van_number = ?').get(van_number);
  if (existing) return res.status(409).json({ error: 'A van with this number already exists.' });

  const info = db
    .prepare('INSERT INTO vans (van_number, capacity, driver_name, driver_phone) VALUES (?,?,?,?)')
    .run(van_number, capacity, driver_name || null, driver_phone || null);

  logAction(req.user.id, 'van_added', { van_id: info.lastInsertRowid });
  res.status(201).json({ van: db.prepare('SELECT * FROM vans WHERE id = ?').get(info.lastInsertRowid) });
});

router.put('/vans/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM vans WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Van not found.' });

  const fields = ['van_number', 'capacity', 'driver_name', 'driver_phone', 'is_active'];
  const updates = {};
  for (const f of fields) if (req.body?.[f] !== undefined) updates[f] = req.body[f];
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields to update.' });

  const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  db.prepare(`UPDATE vans SET ${setClause} WHERE id = ?`).run(...Object.values(updates), req.params.id);

  logAction(req.user.id, 'van_updated', { van_id: req.params.id, updates });
  res.json({ van: db.prepare('SELECT * FROM vans WHERE id = ?').get(req.params.id) });
});

// ---------- Bookings ----------

router.get('/bookings', (req, res) => {
  const { date, status } = req.query;
  let sql = `
    SELECT b.*, s.departure_city, s.arrival_city, s.departure_time, s.arrival_time, u.email AS customer_email
    FROM bookings b
    JOIN schedules s ON s.id = b.schedule_id
    JOIN users u ON u.id = b.user_id
    WHERE 1=1`;
  const params = [];
  if (date) { sql += ' AND b.booking_date = ?'; params.push(date); }
  if (status) { sql += ' AND b.status = ?'; params.push(status); }
  sql += ' ORDER BY b.created_at DESC';

  res.json({ bookings: db.prepare(sql).all(...params) });
});

router.post('/bookings/:id/cancel', (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });

  db.prepare(`UPDATE bookings SET status = 'cancelled' WHERE id = ?`).run(req.params.id);
  logAction(req.user.id, 'booking_cancelled', { booking_id: req.params.id });
  res.json({ message: 'Booking cancelled.' });
});

// ---------- Reports ----------

router.get('/reports/revenue', (req, res) => {
  const byDay = db
    .prepare(
      `SELECT booking_date, SUM(total_price) revenue, SUM(seats_booked) seats
       FROM bookings WHERE status = 'confirmed'
       GROUP BY booking_date ORDER BY booking_date DESC LIMIT 30`
    )
    .all();

  const totals = db
    .prepare(
      `SELECT COALESCE(SUM(total_price),0) revenue, COALESCE(SUM(seats_booked),0) seats, COUNT(*) bookings
       FROM bookings WHERE status = 'confirmed'`
    )
    .get();

  const byRoute = db
    .prepare(
      `SELECT s.departure_city, s.arrival_city, SUM(b.total_price) revenue, SUM(b.seats_booked) seats
       FROM bookings b JOIN schedules s ON s.id = b.schedule_id
       WHERE b.status = 'confirmed'
       GROUP BY s.departure_city, s.arrival_city`
    )
    .all();

  res.json({ totals, byDay, byRoute });
});

// ---------- Audit log ----------

router.get('/logs', (req, res) => {
  const rows = db
    .prepare(
      `SELECT l.*, u.name AS admin_name FROM admin_logs l JOIN users u ON u.id = l.admin_id
       ORDER BY l.created_at DESC LIMIT 200`
    )
    .all();
  res.json({ logs: rows });
});

export default router;
