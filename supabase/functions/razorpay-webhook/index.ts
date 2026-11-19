// Razorpay → us. Set up in Razorpay Dashboard → Webhooks with the RAZORPAY_WEBHOOK_SECRET and the
// events payment.captured and order.paid. Settles orders whose customer closed the page before the
// browser could confirm. Deployed without JWT checks: the signature is the check.
import { admin, env, hmacSha256, json, safeEqual, serve, settlePayment, type RazorpayPayment } from '../_shared/razorpay.ts';

type Event = { event: string; payload?: { payment?: { entity?: RazorpayPayment } } };

serve(async (req) => {
  const raw = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';
  const expected = await hmacSha256(env('RAZORPAY_WEBHOOK_SECRET'), raw);
  if (!safeEqual(expected, signature)) return json({ error: 'Bad signature' }, 401);

  const event = JSON.parse(raw) as Event;
  const payment = event.payload?.payment?.entity;
  if ((event.event === 'payment.captured' || event.event === 'order.paid') && payment?.order_id) {
    try {
      await settlePayment(admin(), payment);
    } catch (e) {
      // Orders from another app on the same Razorpay account aren't ours: acknowledge and move on.
      if (e instanceof Error && e.message.includes('Order not found')) return json({ ignored: true });
      throw e;
    }
  }
  return json({ ok: true });
});
