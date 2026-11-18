import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

/** Opacity for a clip: fades in over the first frames and out over the last. */
export const useClipFade = (durationInFrames: number, fade = 12): number => {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, fade, durationInFrames - fade, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

/** 0 → 1 spring starting at `delay` frames; drives entrance animations. */
export const useEnter = (delay = 0, damping = 18): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.8 } });
};

/** Style for an element that rises and fades in. */
export const riseIn = (progress: number, distance = 40): React.CSSProperties => ({
  opacity: progress,
  transform: `translateY(${(1 - progress) * distance}px)`,
});

/** Slow continuous zoom used on backgrounds (1 → 1.08 over the clip). */
export const useSlowZoom = (durationInFrames: number, to = 1.08): number => {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, durationInFrames], [1, to], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
};
