import { Audio } from '@remotion/media';
import type React from 'react';
import { useCallback } from 'react';
import { AbsoluteFill, Series, useVideoConfig } from 'remotion';
import { getIncludedClips, resolveClipValues } from './data';
import { getTrack } from './music';
import { Watermark } from './shared/Watermark';
import type { TemplateDefinition, TemplateProps } from './types';

const FADE_IN_S = 0.4;
const FADE_OUT_S = 1.5;
const MUSIC_VOLUME = 0.8;

/** The chosen track under the whole video, faded in and out with the video's length. Loops if the video is longer. */
const Music = ({ id }: { id: string }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const track = getTrack(id);
  const volume = useCallback(
    (f: number) => MUSIC_VOLUME * Math.max(0, Math.min(1, f / (FADE_IN_S * fps), (durationInFrames - f) / (FADE_OUT_S * fps))),
    [fps, durationInFrames],
  );
  if (!track) return null;
  // Absolute URL: the browser renderer fetches the file itself.
  const src = typeof window === 'undefined' ? track.src : new URL(track.src, window.location.origin).href;
  return <Audio src={src} volume={volume} loop loopVolumeCurveBehavior="extend" />;
};

/** Plays the clips the customer kept, one after another, with the watermark on previews. */
export const TemplateVideo: React.FC<TemplateProps & { def: TemplateDefinition }> = ({ def, data, watermark }) => {
  const clips = getIncludedClips(def, data);
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {data.music ? <Music id={data.music} /> : null}
      <Series>
        {clips.map((clip) => {
          const Clip = def.clips[clip.id];
          if (!Clip) return null;
          return (
            <Series.Sequence key={clip.id} durationInFrames={clip.durationInFrames} name={clip.name}>
              <Clip values={resolveClipValues(def, clip, data)} durationInFrames={clip.durationInFrames} />
            </Series.Sequence>
          );
        })}
      </Series>
      {watermark ? <Watermark /> : null}
    </AbsoluteFill>
  );
};

/** Component bound to one template, in the shape Player and renderMediaOnWeb expect. */
export const bindTemplate = (def: TemplateDefinition): React.FC<TemplateProps> => {
  const Bound: React.FC<TemplateProps> = (props) => <TemplateVideo def={def} {...props} />;
  Bound.displayName = `Template(${def.slug})`;
  return Bound;
};
