import { fitText } from '@remotion/layout-utils';
import type React from 'react';

type Props = {
  text: string;
  width: number;
  maxFontSize: number;
  fontFamily: string;
  fontWeight?: number | string;
  style?: React.CSSProperties;
};

/** Single-line text that shrinks to fit `width`, never growing past `maxFontSize`. */
export const FitText: React.FC<Props> = ({ text, width, maxFontSize, fontFamily, fontWeight, style }) => {
  let fontSize = maxFontSize;
  try {
    const fitted = fitText({
      text: text || ' ',
      withinWidth: width,
      fontFamily,
      fontWeight: fontWeight === undefined ? undefined : String(fontWeight),
      validateFontIsLoaded: false,
    }).fontSize;
    fontSize = Math.min(maxFontSize, Math.floor(fitted));
  } catch {
    // Measuring can fail before fonts load; fall back to the max size.
  }
  return (
    <div
      style={{
        width,
        fontFamily,
        fontWeight,
        fontSize,
        lineHeight: 1.15,
        whiteSpace: 'nowrap',
        textAlign: 'center',
        ...style,
      }}
    >
      {text}
    </div>
  );
};
