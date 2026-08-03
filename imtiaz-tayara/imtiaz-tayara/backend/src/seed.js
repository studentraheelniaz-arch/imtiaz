import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from './db.js';

function upsertAdmin() {
  const email = process.env.FIRST_ADMIN_EMAIL || 'admin@imtiaztayara.pk';
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }
  const hash = bcrypt.hashSync(process.env.FIRST_ADMIN_PASSWORD || 'ChangeMe123!', 10);
  db.prepare(
    `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?,?,?,?,'admin')`
  ).run(process.env.FIRST_ADMIN_NAME || 'Admin', email, '0300-0000000', hash);
  console.log(`Created first admin: ${email}`);
}

function seedVansAndSchedules() {
  const vanCount = db.prepare('SELECT COUNT(*) c FROM vans').get().c;
  if (vanCount > 0) {
    console.log('Vans already seeded, skipping.');
    return;
  }

  const insertVan = db.prepare(
    `INSERT INTO vans (van_number, capacity, driver_name, driver_phone, is_active) VALUES (?,?,?,?,1)`
  );
  const vans = [
    insertVan.run('IT-101', 12, 'Ghulam Rasool', '0301-1234567'),
    insertVan.run('IT-102', 14, 'Nazeer Ahmed', '0302-2345678'),
    insertVan.run('IT-103', 12, 'Sikandar Ali', '0303-3456789'),
    insertVan.run('IT-104', 14, 'Wahid Bux', '0304-4567890'),
  ];

  const insertSchedule = db.prepare(`
    INSERT INTO schedules
      (van_id, departure_city, arrival_city, departure_time, arrival_time, price, available_days, is_active)
    VALUES (?,?,?,?,?,?,?,1)
  `);

  const allDays = 'Mon,Tue,Wed,Thu,Fri,Sat,Sun';

  // Gambat -> Karachi
  insertSchedule.run(vans[0].lastInsertRowid, 'Gambat', 'Karachi', '06:00', '13:30', 2500, allDays);
  insertSchedule.run(vans[1].lastInsertRowid, 'Gambat', 'Karachi', '10:00', '17:30', 2500, allDays);
  insertSchedule.run(vans[2].lastInsertRowid, 'Gambat', 'Karachi', '21:00', '04:30', 2800, allDays);

  // Karachi -> Gambat
  insertSchedule.run(vans[3].lastInsertRowid, 'Karachi', 'Gambat', '07:00', '14:30', 2500, allDays);
  insertSchedule.run(vans[0].lastInsertRowid, 'Karachi', 'Gambat', '14:00', '21:30', 2500, allDays);
  insertSchedule.run(vans[1].lastInsertRowid, 'Karachi', 'Gambat', '22:30', '06:00', 2800, allDays);

  console.log('Seeded 4 vans and 6 schedules (3 each direction).');
}

upsertAdmin();
seedVansAndSchedules();
console.log('Seed complete.');
