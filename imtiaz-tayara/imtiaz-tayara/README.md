# Imtiaz Tayara — Gambat ⇄ Karachi Ticket Booking

A complete, working ticket booking platform: customer web app (search, book,
pay, e-ticket) plus a full admin panel (instant fare/timing edits, van
management, bookings, revenue reports, audit log).

This is a **real, runnable full-stack app** — not a mockup. It's been built
and tested end to end (backend API + frontend build both verified). Payments
and SMS/email run in a clearly-marked **sandbox mode** until you add your own
live credentials (see "Going live" below) — I don't have access to JazzCash,
UPaisa, Twilio, or SendGrid accounts on your behalf, since those require your
own business registration.

## Stack

- **Backend:** Node.js + Express + SQLite (via `better-sqlite3` — no separate
  database server to install). JWT auth.
- **Frontend:** React + Vite + Tailwind CSS, React Router.
- No mobile app is included (see "What's not included" below).

## Quick start

You need [Node.js 18+](https://nodejs.org) installed.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed      # creates the database, first admin, sample vans & schedules
npm run dev        # starts the API on http://localhost:4000
```

First admin login (change this password immediately — see `.env`):
- Email: `admin@imtiaztayara.pk`
- Password: `ChangeMe123!`

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev        # starts the app on http://localhost:5173
```

Open **http://localhost:5173**. The dev server proxies `/api/*` to the
backend automatically (see `vite.config.js`).

### 3. Try the full flow

1. Search Gambat → Karachi for any date.
2. Select a schedule, sign up, enter passenger details.
3. Choose JazzCash or UPaisa — this drops you on a **sandbox checkout page**
   (clearly labeled) that simulates the real gateway.
4. Click "Confirm payment" — this fires the same webhook a real gateway
   would call, which confirms the booking and logs a stub SMS/email to the
   backend console.
5. Log in as admin (`/login`) and open **Admin panel** → edit a fare or
   timing, view the booking, check the revenue dashboard and audit log.

## Project structure

```
backend/
  src/
    server.js          Express app entry point
    db.js               SQLite schema
    seed.js              Creates first admin + sample vans/schedules
    middleware/auth.js   JWT auth + admin role check
    routes/               auth, schedules, bookings, payments, admin
    utils/
      payments.js         JazzCash/UPaisa adapter (sandbox + go-live hooks)
      notifications.js    SMS/email adapter (sandbox + go-live hooks)
frontend/
  src/
    pages/                Customer pages + pages/admin (admin panel)
    components/           Navbar, Footer, route guards
    context/AuthContext.jsx
    utils/api.js           Typed fetch wrapper for every backend endpoint
```

## Going live with real payments & notifications

Nothing about the booking flow changes when you go live — only these files:

- **`backend/src/utils/payments.js`** — fill in `JAZZCASH_MERCHANT_ID`,
  `JAZZCASH_PASSWORD`, `JAZZCASH_INTEGRITY_SALT` (and the UPaisa
  equivalents) in `.env`, then implement the two `throw new Error(...)`
  blocks marked "Live integration not yet wired up" using JazzCash's
  Merchant Guide / UPaisa's REST API docs. The moment `JAZZCASH_MERCHANT_ID`
  is non-empty, the app stops using the sandbox mock checkout automatically.
- **`backend/src/utils/notifications.js`** — add `TWILIO_ACCOUNT_SID` /
  `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` and `SENDGRID_API_KEY` to
  `.env`, then `npm install twilio @sendgrid/mail` in `backend/`. Real
  sending switches on automatically; until then everything logs to the
  console so you can test the full flow without any accounts.

**Webhook security:** in sandbox mode, `POST /api/payments/webhook` verifies
an HMAC signature signed with `PAYMENT_WEBHOOK_SECRET`. In production,
replace `verifyWebhookSignature` in `payments.js` with the real gateway's
signature scheme (JazzCash's secure hash / UPaisa's signature header) —
**never confirm a booking without this check**, it's the only thing
standing between you and fraudulent "payments."

## Deployment

- **Backend:** any Node host (Render, Railway, a VPS, etc). SQLite is
  file-based — make sure your host gives you a persistent disk, or switch
  `db.js` to Postgres/MySQL if you outgrow a single file (the query style
  is close enough that migration is mostly a driver swap).
- **Frontend:** `npm run build` in `frontend/` produces static files in
  `frontend/dist/` — deploy to Vercel, Netlify, or any static host, and
  point `CORS_ORIGIN` in the backend `.env` at that domain.
- Set `JWT_SECRET` and `PAYMENT_WEBHOOK_SECRET` to long random values in
  production — the placeholders in `.env.example` are not safe to use as-is.

## What's not included (and why)

The original brief also asked for a React Native mobile app, live Google
Maps van tracking, and push notifications. Those weren't built here because
they need things only you can provide or decide: Apple/Google developer
accounts to ship an app, a Google Maps billing-enabled API key, and a call
on whether GPS tracking is worth the added complexity for a first launch.
The web app above is fully mobile-responsive in the meantime, so customers
on phones aren't blocked. If you want to add these later, the backend
already exposes everything a mobile app or map view would need — it's the
same `/api/*` endpoints the web app uses.

## Security notes already built in

- Passwords hashed with bcrypt; JWT-based sessions.
- Every `/api/admin/*` route checks `role === 'admin'` server-side (tested:
  a logged-in customer gets a 403, not just a hidden UI button).
- Rate limiting on auth and booking endpoints.
- Payment webhook requires a valid signature before any booking is marked
  confirmed.
- All admin price/timing/van changes are written to `admin_logs` with who
  changed what and when.
