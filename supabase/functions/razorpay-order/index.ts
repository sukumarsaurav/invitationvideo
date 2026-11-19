// POST { videoId, coupon? } with the customer's session.
// Prices the video on the server, records a pending order and opens a matching Razorpay order.
// Returns what Razorpay Checkout needs, or { status: 'paid' } when nothing is left to pay
// (a 100% coupon, or a video that was already paid).
import { admin, CustomerError, json, razorpay, razorpayConfigured, requireUser, rpc, serve, env } from '../_shared/razorpay.ts';

type Order = {
  order_id: string | null;
  order_status: 'created' | 'paid';
  amount: number;
  list_price: number;
  discount: number;
  currency: string;
  template_name: string;
  coupon_code: string | null;
  email: string | null;
};

serve(async (req) => {
  const db = admin();
  const user = await requireUser(req, db);
  const { videoId, coupon } = (await req.json().catch(() => ({}))) as { videoId?: string; coupon?: string };
  if (!videoId) throw new CustomerError('Video not found.');

  // Check before recording anything, so a missing setup never leaves orders behind.
  if (!razorpayConfigured()) throw new CustomerError('Online payment is being set up. Please try again soon.');

  const order = await rpc<Order>(db, 'create_order', { p_user: user.id, p_video_id: videoId, p_code: coupon ?? null, p_source: 'razorpay' });
  if (order.order_status === 'paid') return json({ status: 'paid' });

  const rzp = await razorpay<{ id: string }>('/orders', {
    method: 'POST',
    body: {
      amount: order.amount,
      currency: order.currency,
      receipt: order.order_id,
      notes: { order_id: order.order_id, video_id: videoId, coupon: order.coupon_code ?? '' },
    },
  });
  await rpc(db, 'attach_razorpay_order', { p_order_id: order.order_id, p_razorpay_order_id: rzp.id });

  return json({
    status: 'created',
    keyId: env('RAZORPAY_KEY_ID'),
    razorpayOrderId: rzp.id,
    amount: order.amount,
    currency: order.currency,
    description: order.template_name,
    email: order.email ?? user.email ?? '',
  });
});
