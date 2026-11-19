// POST { razorpay_order_id, razorpay_payment_id, razorpay_signature } from Checkout's success handler.
// Checks Razorpay's signature, then settles the order (capturing the payment if it was only
// authorised). The webhook does the same if the customer closes the page before this runs.
import { admin, CustomerError, env, hmacSha256, json, razorpay, requireUser, safeEqual, serve, settlePayment, type RazorpayPayment } from '../_shared/razorpay.ts';

serve(async (req) => {
  const db = admin();
  await requireUser(req, db);
  const body = (await req.json().catch(() => ({}))) as Record<string, string | undefined>;
  const orderId = body.razorpay_order_id ?? '';
  const paymentId = body.razorpay_payment_id ?? '';
  const signature = body.razorpay_signature ?? '';
  if (!orderId || !paymentId || !signature) throw new CustomerError('The payment details are missing.');

  const expected = await hmacSha256(env('RAZORPAY_KEY_SECRET'), `${orderId}|${paymentId}`);
  if (!safeEqual(expected, signature)) throw new CustomerError("We couldn't confirm this payment. If money was taken, contact support.");

  const payment = await razorpay<RazorpayPayment>(`/payments/${paymentId}`);
  if (payment.order_id !== orderId) throw new CustomerError("We couldn't confirm this payment. If money was taken, contact support.");
  return json({ status: await settlePayment(db, payment) });
});
