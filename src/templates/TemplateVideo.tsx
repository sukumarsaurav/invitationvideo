import type React from 'react';
import { AbsoluteFill, Series } from 'remotion';
import { getIncludedClips, resolveClipValues } from './data';
import { Watermark } from './shared/Watermark';
import type { TemplateDefinition, TemplateProps } from './types';

/** Plays the clips the customer kept, one after another, with the watermark on previews. */
export const TemplateVideo: React.FC<TemplateProps & { def: TemplateDefinition }> = ({ def, data, watermark }) => {
  const clips = getIncludedClips(def, data);
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
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
