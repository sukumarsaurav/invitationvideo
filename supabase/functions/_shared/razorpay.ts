// Shared by the razorpay-* edge functions: CORS, the service-role database client, the signed-in
// customer, and Razorpay's REST API and signatures. Secrets come from `supabase secrets set`:
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
import { createClient } from 'npm:@supabase/supabase-js@2.119.0';

type Db = ReturnType<typeof admin>;

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

/** A message the customer can read, sent with a 4xx so the page shows it as it is. */
export class CustomerError extends Error {}

export const env = (name: string): string => {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`${name} is not set`);
  return v;
};

/** Online payment is set up when both Razorpay keys are present. */
export const razorpayConfigured = () => Boolean(Deno.env.get('RAZORPAY_KEY_ID') && Deno.env.get('RAZORPAY_KEY_SECRET'));

/** Service-role client on the invites schema. */
export const admin = () =>
  createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    db: { schema: 'invites' },
    auth: { persistSession: false, autoRefreshToken: false },
  });

/** The signed-in customer from the request's Authorization header, checked with Supabase Auth. */
export const requireUser = async (req: Request, db: Db) => {
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) throw new CustomerError('Sign in to pay.');
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw new CustomerError('Sign in to pay.');
  return data.user;
};

/** Database errors raised on purpose (P0001 etc.) are customer messages; anything else is not. */
export const rpc = async <T>(db: Db, fn: string, args: Record<string, unknown>): Promise<T> => {
  const { data, error } = await db.rpc(fn, args);
  if (error) {
    if (['P0001', 'P0002', '42501'].includes(error.code ?? '')) throw new CustomerError(error.message);
    throw new Error(`${fn}: ${error.message}`);
  }
  return data as T;
};

const API = 'https://api.razorpay.com/v1';

export const razorpay = async <T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> => {
  const auth = btoa(`${env('RAZORPAY_KEY_ID')}:${env('RAZORPAY_KEY_SECRET')}`);
  const res = await fetch(`${API}${path}`, {
    method: init.method ?? 'GET',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Razorpay ${path}: ${res.status} ${JSON.stringify(body)}`);
  return body as T;
};

export type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  fee?: number | null;
  tax?: number | null;
};

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export const hmacSha256 = async (secret: string, message: string) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)));
};

/** Compares two hex strings without leaking where they differ. */
export const safeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

/** Settles our order for a Razorpay payment, if the payment really went through. Captures it if it was only authorised. */
export const settlePayment = async (db: Db, payment: RazorpayPayment): Promise<string> => {
  let p = payment;
  if (p.status === 'authorized') {
    p = await razorpay<RazorpayPayment>(`/payments/${p.id}/capture`, { method: 'POST', body: { amount: p.amount, currency: p.currency } });
  }
  if (p.status !== 'captured') throw new CustomerError('The payment did not go through. No money was taken.');
  return rpc<string>(db, 'settle_razorpay_order', {
    p_razorpay_order_id: p.order_id,
    p_payment_id: p.id,
    p_amount: p.amount,
    p_fee: p.fee ?? null,
    p_fee_tax: p.tax ?? null,
  });
};

/** Runs a handler with CORS, POST-only and error handling. */
export const serve = (handler: (req: Request) => Promise<Response>) =>
  Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    try {
      return await handler(req);
    } catch (e) {
      if (e instanceof CustomerError) return json({ error: e.message }, 400);
      console.error(e);
      return json({ error: 'Something went wrong with the payment. Please try again.' }, 500);
    }
  });
