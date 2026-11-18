import type React from 'react';
import { Composition } from 'remotion';
import { getDurationInFrames, makeExampleData } from '../templates/data';
import { TEMPLATES } from '../templates/registry';
import { bindTemplate } from '../templates/TemplateVideo';
import type { TemplateProps } from '../templates/types';

/** Every template as a Studio composition, for designing templates with live reload. */
export const RemotionRoot: React.FC = () => (
  <>
    {TEMPLATES.map((def) => {
      const defaultProps: TemplateProps = { data: makeExampleData(def), watermark: false };
      return (
        <Composition
          key={def.slug}
          id={def.slug}
          component={bindTemplate(def)}
          width={def.width}
          height={def.height}
          fps={def.fps}
          durationInFrames={getDurationInFrames(def, defaultProps.data)}
          defaultProps={defaultProps}
          calculateMetadata={({ props }: { props: TemplateProps }) => ({
            durationInFrames: getDurationInFrames(def, props.data),
          })}
        />
      );
    })}
  </>
);
