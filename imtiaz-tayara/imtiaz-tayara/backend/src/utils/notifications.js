// Notification helpers.
//
// These run in "stub" mode (log to console only) until you add real
// credentials to .env. This keeps the app fully runnable/testable without
// live Twilio / SendGrid accounts, and swaps to real delivery the moment
// keys are present — no code changes needed.

const appName = process.env.APP_NAME || 'Imtiaz Tayara';

export async function sendBookingSms(phone, booking) {
  const message = `${appName}: Your booking is confirmed. Ref #${booking.booking_reference}. ${booking.seats_booked} seat(s), Rs. ${booking.total_price}. Safe travels!`;

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log(`[SMS STUB] to ${phone}: ${message}`);
    return { ok: true, stub: true };
  }

  // Real Twilio send (installed lazily so the package is optional in dev):
  const twilio = (await import('twilio')).default;
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const result = await client.messages.create({
    body: message,
    from: process.env.TWILIO_FROM_NUMBER,
    to: phone,
  });
  return { ok: true, sid: result.sid };
}

export async function sendBookingEmail(email, booking) {
  const subject = `${appName} — Booking Confirmed (#${booking.booking_reference})`;
  const body = `Thank you for booking with ${appName}!\n\nReference: ${booking.booking_reference}\nSeats: ${booking.seats_booked}\nTotal: Rs. ${booking.total_price}\nDate: ${booking.booking_date}\n\nSafe travels!`;

  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[EMAIL STUB] to ${email}: subject="${subject}"\n${body}`);
    return { ok: true, stub: true };
  }

  const sgMail = (await import('@sendgrid/mail')).default;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject,
    text: body,
  });
  return { ok: true };
}
