import { useEffect, useState } from 'react';

/**
 * Keeps the screen on while `active` (Screen Wake Lock API), re-acquiring it when the
 * tab becomes visible again. Also reports whether the tab was hidden at any point,
 * because browsers pause background tabs and a render would stall there.
 */
export const useWakeLock = (active: boolean) => {
  const [supported] = useState(() => typeof navigator !== 'undefined' && 'wakeLock' in navigator);
  const [wasHidden, setWasHidden] = useState(false);

  useEffect(() => {
    if (!active) return;
    setWasHidden(false);
    let lock: WakeLockSentinel | null = null;
    let released = false;

    const acquire = async () => {
      if (!supported || document.visibilityState !== 'visible') return;
      try {
        lock = await navigator.wakeLock.request('screen');
        if (released) await lock.release();
      } catch {
        // Denied (battery saver, iframe, insecure origin): the page still warns the user.
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') setWasHidden(true);
      else acquire();
    };

    acquire();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      released = true;
      document.removeEventListener('visibilitychange', onVisibility);
      lock?.release().catch(() => {});
    };
  }, [active, supported]);

  return { supported, wasHidden };
};
