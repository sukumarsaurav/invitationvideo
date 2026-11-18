import { loadFont as loadCormorant } from '@remotion/google-fonts/CormorantGaramond';
import { loadFont as loadGreatVibes } from '@remotion/google-fonts/GreatVibes';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadTiro } from '@remotion/google-fonts/TiroDevanagariHindi';

// Loaded once at import time. Remotion's loader holds rendering (delayRender)
// until the files are ready, so preview and HD renders never draw a fallback font.
const script = loadGreatVibes('normal', { weights: ['400'], subsets: ['latin'] });
const display = loadPlayfair('normal', { weights: ['600', '700'], subsets: ['latin'] });
const serif = loadCormorant('normal', { weights: ['500', '600'], subsets: ['latin'] });
// Fallback for names typed in Hindi or Marathi: the Latin fonts above have no Devanagari.
const devanagari = loadTiro('normal', { weights: ['400'], subsets: ['devanagari', 'latin'] });

const withDevanagari = (family: string) => `'${family}', '${devanagari.fontFamily}'`;

export const fonts = {
  script: withDevanagari(script.fontFamily),
  display: withDevanagari(display.fontFamily),
  serif: withDevanagari(serif.fontFamily),
};

export const waitForTemplateFonts = () =>
  Promise.all([script.waitUntilDone(), display.waitUntilDone(), serif.waitUntilDone(), devanagari.waitUntilDone()]);
