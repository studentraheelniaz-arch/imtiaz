import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data.sqlite');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('customer','admin')) DEFAULT 'customer',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  van_number TEXT NOT NULL UNIQUE,
  capacity INTEGER NOT NULL DEFAULT 12,
  driver_name TEXT,
  driver_phone TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  van_id INTEGER NOT NULL REFERENCES vans(id),
  departure_city TEXT NOT NULL CHECK(departure_city IN ('Gambat','Karachi')),
  arrival_city TEXT NOT NULL CHECK(arrival_city IN ('Gambat','Karachi')),
  departure_time TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  price REAL NOT NULL,
  available_days TEXT NOT NULL DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  schedule_id INTEGER NOT NULL REFERENCES schedules(id),
  booking_date TEXT NOT NULL,
  seats_booked INTEGER NOT NULL,
  passenger_name TEXT NOT NULL,
  passenger_phone TEXT NOT NULL,
  boarding_point TEXT,
  total_price REAL NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending','confirmed','cancelled')) DEFAULT 'pending',
  booking_reference TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL REFERENCES bookings(id),
  transaction_id TEXT NOT NULL UNIQUE,
  amount REAL NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending','success','failed')) DEFAULT 'pending',
  payment_method TEXT NOT NULL CHECK(payment_method IN ('jazzcash','upaisa')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_schedules_route ON schedules(departure_city, arrival_city, is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_schedule_date ON bookings(schedule_id, booking_date, status);
`);

export default db;
