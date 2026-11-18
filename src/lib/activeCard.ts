import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * Picks the ONE template card that should play: the first card (in page order) whose
 * middle is inside the centre band of the screen. Keeps phones from decoding many videos at once.
 */
const inBand = new Map<string, number>(); // id -> page order
let active: string | null = null;
const listeners = new Set<() => void>();

const recompute = () => {
  let best: string | null = null;
  let bestOrder = Infinity;
  for (const [id, order] of inBand) if (order < bestOrder) [best, bestOrder] = [id, order];
  if (best !== active) {
    active = best;
    listeners.forEach((l) => l());
  }
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** True while this card is the one that should play. */
export const useIsActiveCard = (id: string, order: number, el: HTMLElement | null) => {
  useEffect(() => {
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) inBand.set(id, order);
        else inBand.delete(id);
        recompute();
      },
      // A horizontal band across the middle of the screen.
      { rootMargin: '-40% 0px -40% 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      inBand.delete(id);
      recompute();
    };
  }, [id, order, el]);
  return useSyncExternalStore(subscribe, () => active === id);
};

/** True once the element has come within `margin` of the screen (then stays true). */
export const useNearScreen = (el: HTMLElement | null, margin = '300px') => {
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!el || near) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [el, near, margin]);
  return near;
};
