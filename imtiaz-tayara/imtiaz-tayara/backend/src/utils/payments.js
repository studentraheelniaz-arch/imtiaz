// Payment gateway adapters for JazzCash and UPaisa.
//
// IMPORTANT: JazzCash and UPaisa require a live merchant account (Merchant
// ID, Password, Integrity Salt / API key) which only you can obtain from
// them — see README.md section "Going live with real payments". Until
// those are set in .env, both adapters run in SANDBOX mode: they generate
// a real-shaped transaction ID and simulate a successful callback a moment
// later, so the entire booking flow — including the webhook — is testable
// end to end today.
import crypto from 'node:crypto';

const inSandbox = (method) =>
  method === 'jazzcash'
    ? !process.env.JAZZCASH_MERCHANT_ID
    : !process.env.UPAISA_MERCHANT_ID;

export async function initiatePayment({ method, amount, bookingReference }) {
  const transactionId = `${method.toUpperCase()}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  if (inSandbox(method)) {
    return {
      transactionId,
      sandbox: true,
      // In production this would be the real redirect URL returned by the
      // gateway. Here we point at our own mock checkout page.
      redirectUrl: `/mock-checkout?txn=${transactionId}&amount=${amount}&ref=${bookingReference}&method=${method}`,
    };
  }

  if (method === 'jazzcash') {
    // Real integration point: build the JazzCash HTTP POST request using
    // pp_MerchantID, pp_Password, and an HMAC-SHA256 secure hash built
    // from JAZZCASH_INTEGRITY_SALT, per JazzCash's Merchant Guide.
    throw new Error('Live JazzCash integration not yet wired up — add request-building logic here.');
  }

  if (method === 'upaisa') {
    // Real integration point: call UPaisa's REST API with UPAISA_API_KEY.
    throw new Error('Live UPaisa integration not yet wired up — add request-building logic here.');
  }

  throw new Error(`Unknown payment method: ${method}`);
}

// Verifies an inbound webhook. In sandbox mode we trust our own mock
// checkout (which signs with PAYMENT_WEBHOOK_SECRET). In production this
// must verify the gateway's real secure-hash / signature scheme instead.
export function verifyWebhookSignature(payload, signature) {
  const expected = crypto
    .createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET || 'dev-secret')
    .update(JSON.stringify(payload))
    .digest('hex');
  return signature === expected;
}

export function signPayload(payload) {
  return crypto
    .createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET || 'dev-secret')
    .update(JSON.stringify(payload))
    .digest('hex');
}
