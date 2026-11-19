/**
 * The free-download switch, for a promotion or a demo: with VITE_FREE_HD=true (Vercel environment
 * variables, .env.local, or .env.production for a local build) HD downloads skip payment and every
 * price and "pay" message is hidden. Off by default: prices show and Download asks for payment
 * (with Razorpay, or a test payment while the "test_payments" admin setting is on).
 *
 * Works in the browser (Vite's import.meta.env) and in the build scripts that pre-render pages
 * (Node's process.env), so the static pages and the app always agree. Functions, not constants:
 * the build scripts load .env.production after this module is imported.
 */
const nodeEnv = () => (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;

export const isFreeHd = (): boolean =>
  import.meta.env?.VITE_FREE_HD === 'true' || nodeEnv()?.VITE_FREE_HD === 'true';

/** Show prices and payment wording only when downloads are paid. */
export const showPrices = (): boolean => !isFreeHd();
