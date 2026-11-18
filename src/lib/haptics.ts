/**
 * A short tap on phones that support it (Android). Silently does nothing elsewhere,
 * and before the person has touched the page (browsers block vibration until then).
 */
export const tap = (ms = 10) => {
  try {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
    const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
    if (activation && !activation.hasBeenActive) return;
    navigator.vibrate(ms);
  } catch {
    // Blocked by the browser: no feedback, nothing else changes.
  }
};
