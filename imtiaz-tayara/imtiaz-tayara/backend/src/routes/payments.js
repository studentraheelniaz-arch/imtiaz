import { Router } from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { initiatePayment, verifyWebhookSignature, signPayload } from '../utils/payments.js';
import { sendBookingSms, sendBookingEmail } from '../utils/notifications.js';

const router = Router();

router.post('/initiate', authenticate, async (req, res) => {
  const { booking_id, method } = req.body || {};
  if (!booking_id || !['jazzcash', 'upaisa'].includes(method)) {
    return res.status(400).json({ error: 'booking_id and a valid method (jazzcash|upaisa) are required.' });
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });
  if (booking.user_id !== req.user.id) return res.status(403).json({ error: 'Not your booking.' });
  if (booking.status !== 'pending') return res.status(409).json({ error: `Booking is already ${booking.status}.` });

  const result = await initiatePayment({
    method,
    amount: booking.total_price,
    bookingReference: booking.booking_reference,
  });

  db.prepare(
    `INSERT INTO payments (booking_id, transaction_id, amount, status, payment_method) VALUES (?,?,?, 'pending', ?)`
  ).run(booking.id, result.transactionId, booking.total_price, method);

  res.json({ ...result });
});

// Mock checkout "pay now" — stands in for the user completing payment on
// the gateway's hosted page. Signs and fires the same webhook a real
// gateway would call, so the confirmation path is identical in sandbox
// and production.
router.post('/mock-pay', async (req, res) => {
  const { txn, fail } = req.body || {};
  const payment = db.prepare('SELECT * FROM payments WHERE transaction_id = ?').get(txn);
  if (!payment) return res.status(404).json({ error: 'Transaction not found.' });

  const payload = { transaction_id: txn, status: fail ? 'failed' : 'success' };
  const signature = signPayload(payload);

  try {
    const result = await handleWebhook(payload, signature);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

async function handleWebhook(payload, signature) {
  if (!verifyWebhookSignature(payload, signature)) {
    throw Object.assign(new Error('Invalid webhook signature.'), { status: 401 });
  }

  const payment = db.prepare('SELECT * FROM payments WHERE transaction_id = ?').get(payload.transaction_id);
  if (!payment) throw Object.assign(new Error('Unknown transaction.'), { status: 404 });

  const newStatus = payload.status === 'success' ? 'success' : 'failed';
  db.prepare('UPDATE payments SET status = ? WHERE id = ?').run(newStatus, payment.id);

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(payment.booking_id);

  if (newStatus === 'success') {
    db.prepare(`UPDATE bookings SET status = 'confirmed' WHERE id = ?`).run(booking.id);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(booking.user_id);
    const confirmed = { ...booking, status: 'confirmed' };
    // Fire-and-forget style, but awaited so errors surface in logs.
    await sendBookingSms(booking.passenger_phone, confirmed).catch((e) => console.error('SMS failed:', e.message));
    await sendBookingEmail(user.email, confirmed).catch((e) => console.error('Email failed:', e.message));
  } else {
    db.prepare(`UPDATE bookings SET status = 'cancelled' WHERE id = ?`).run(booking.id);
  }

  return { received: true, status: newStatus };
}

// POST /api/payments/webhook — real gateway callback endpoint.
// Header 'x-signature' must be a valid HMAC over the JSON body using
// PAYMENT_WEBHOOK_SECRET (sandbox) or the gateway's own scheme (live).
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-signature'];
    const result = await handleWebhook(req.body, signature);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;
