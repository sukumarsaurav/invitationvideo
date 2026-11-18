import { useEffect, useRef } from 'react';

/** Admin sessions end after this long without a click, key press or scroll. */
export const IDLE_MINUTES = 30;

const KEY = 'iv.admin.lastActive';
const IDLE_MS = IDLE_MINUTES * 60_000;

const read = () => {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
};

const write = (t: number) => {
  try {
    localStorage.setItem(KEY, String(t));
  } catch {
    // Not stored: the in-memory timer still applies to this tab.
  }
};

/** True when the last admin activity on this device is older than the idle limit. */
export const idleExpired = () => {
  const last = read();
  return last > 0 && Date.now() - last > IDLE_MS;
};

/** Marks activity now (call after a successful sign-in, so an old timestamp doesn't end it). */
export const markActive = () => write(Date.now());

/**
 * Calls onIdle after IDLE_MINUTES without activity in any admin tab on this device (the last-activity
 * time is shared through localStorage), and on return to a tab that has been idle that long.
 */
export const useIdleSignOut = (enabled: boolean, onIdle: () => void) => {
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!enabled) return;
    let lastWrite = 0;
    const touch = () => {
      const now = Date.now();
      // Throttled: one storage write every 15 seconds is plenty.
      if (now - lastWrite > 15_000) {
        lastWrite = now;
        write(now);
      }
    };
    const check = () => {
      if (idleExpired()) onIdleRef.current();
    };
    touch();
    const events = ['pointerdown', 'keydown', 'scroll', 'wheel'] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(check, 30_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, touch));
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, [enabled]);
};
