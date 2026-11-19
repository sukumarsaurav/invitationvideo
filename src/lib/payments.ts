import { markPaid } from './drafts';
import { supabase } from './supabase';

/** The server's price for one video (amounts in paise), with a coupon if one was given. */
export type Quote = {
  status: 'draft' | 'paid' | 'rendered';
  list_price: number;
  discount: number;
  amount: number;
  currency: string;
  coupon_code: string | null;
  /** Why the coupon can't be used; the quote is then at full price. */
  coupon_error: string | null;
};

export const fetchQuote = async (videoId: string, coupon?: string): Promise<Quote> => {
  if (!supabase) throw new Error('Payments are not configured.');
  const { data, error } = await supabase.rpc('quote_price', { p_video_id: videoId, p_code: coupon || null });
  if (error) throw new Error(error.message);
  return data as Quote;
};

/** The customer closed Razorpay Checkout without paying. Not an error to show. */
export class CheckoutClosed extends Error {}

type CheckoutResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayCtor = new (options: Record<string, unknown>) => {
  open: () => void;
  on: (event: 'payment.failed', cb: (r: { error?: { description?: string } }) => void) => void;
};

let checkoutScript: Promise<RazorpayCtor> | null = null;

/** Razorpay's Checkout script, loaded the first time someone pays (allowed by the CSP in vercel.json). */
const loadCheckout = (): Promise<RazorpayCtor> => {
  checkoutScript ??= new Promise<RazorpayCtor>((resolve, reject) => {
    const existing = (window as unknown as { Razorpay?: RazorpayCtor }).Razorpay;
    if (existing) return resolve(existing);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => {
      const ctor = (window as unknown as { Razorpay?: RazorpayCtor }).Razorpay;
      if (ctor) resolve(ctor);
      else reject(new Error("Couldn't open the payment window. Check your connection and try again."));
    };
    s.onerror = () => {
      checkoutScript = null;
      s.remove();
      reject(new Error("Couldn't open the payment window. Check your connection and try again."));
    };
    document.head.appendChild(s);
  });
  return checkoutScript;
};

/** Calls a payment edge function with the customer's session; errors carry the server's message. */
const call = async <T>(fn: string, body: Record<string, unknown>): Promise<T> => {
  if (!supabase) throw new Error('Payments are not configured.');
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) {
    // Edge function errors carry { error } in the response body.
    const ctx = (error as { context?: Response }).context;
    const message = ctx ? await ctx.json().then((b: { error?: string }) => b.error).catch(() => null) : null;
    throw new Error(message || "Couldn't reach the payment service. Check your connection and try again.");
  }
  return data as T;
};

type StartResult =
  | { status: 'paid' }
  | { status: 'created'; keyId: string; razorpayOrderId: string; amount: number; currency: string; description: string; email: string };

/**
 * Pays for a video with Razorpay: the server makes the order (price and coupon checked there),
 * Checkout takes the payment, and the server confirms Razorpay's signature before marking the
 * video paid. Resolves when the video is paid; rejects with CheckoutClosed if the customer closes
 * Checkout, or an Error with a message to show.
 */
export const payWithRazorpay = async (videoId: string, coupon?: string): Promise<void> => {
  const [start, Razorpay] = await Promise.all([call<StartResult>('razorpay-order', { videoId, coupon: coupon || null }), loadCheckout()]);
  if (start.status === 'paid') {
    markPaid(videoId);
    return;
  }

  const response = await new Promise<CheckoutResponse>((resolve, reject) => {
    const checkout = new Razorpay({
      key: start.keyId,
      order_id: start.razorpayOrderId,
      amount: start.amount,
      currency: start.currency,
      name: 'Invitation Videos',
      description: start.description,
      prefill: { email: start.email },
      theme: { color: '#7a1f3d' },
      handler: resolve,
      modal: { ondismiss: () => reject(new CheckoutClosed()) },
    });
    // Checkout stays open after a failed attempt so the customer can try another way to pay;
    // nothing to do here except keep waiting.
    checkout.on('payment.failed', () => {});
    checkout.open();
  });

  await call<{ status: string }>('razorpay-verify', { ...response });
  markPaid(videoId);
};
