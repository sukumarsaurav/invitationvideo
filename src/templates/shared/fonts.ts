import { loadFont as loadAllura } from '@remotion/google-fonts/Allura';
import { loadFont as loadBebas } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadCinzel } from '@remotion/google-fonts/Cinzel';
import { loadFont as loadCormorant } from '@remotion/google-fonts/CormorantGaramond';
import { loadFont as loadGreatVibes } from '@remotion/google-fonts/GreatVibes';
import { loadFont as loadMarcellus } from '@remotion/google-fonts/Marcellus';
import { loadFont as loadMonoton } from '@remotion/google-fonts/Monoton';
import { loadFont as loadMontserrat } from '@remotion/google-fonts/Montserrat';
import { loadFont as loadPacifico } from '@remotion/google-fonts/Pacifico';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadTiro } from '@remotion/google-fonts/TiroDevanagariHindi';

// Loaded once at import time. Remotion's loader holds rendering (delayRender)
// until the files are ready, so preview and HD renders never draw a fallback font.
const script = loadGreatVibes('normal', { weights: ['400'], subsets: ['latin'] });
const display = loadPlayfair('normal', { weights: ['600', '700'], subsets: ['latin'] });
const serif = loadCormorant('normal', { weights: ['500', '600'], subsets: ['latin'] });
// Extra families for the wider wedding range: one script, two caps serifs, a sans and three party faces.
const scriptAlt = loadAllura('normal', { weights: ['400'], subsets: ['latin'] });
const caps = loadCinzel('normal', { weights: ['600', '700'], subsets: ['latin'] });
const elegant = loadMarcellus('normal', { weights: ['400'], subsets: ['latin'] });
const sans = loadMontserrat('normal', { weights: ['500', '700'], subsets: ['latin'] });
const fun = loadPacifico('normal', { weights: ['400'], subsets: ['latin'] });
const poster = loadBebas('normal', { weights: ['400'], subsets: ['latin'] });
const neon = loadMonoton('normal', { weights: ['400'], subsets: ['latin'] });
// Fallback for names typed in Hindi or Marathi: the Latin fonts above have no Devanagari.
const devanagari = loadTiro('normal', { weights: ['400'], subsets: ['devanagari', 'latin'] });

const withDevanagari = (family: string) => `'${family}', '${devanagari.fontFamily}'`;

export const fonts = {
  /** Great Vibes: flowing wedding script. */
  script: withDevanagari(script.fontFamily),
  /** Playfair Display: high-contrast serif. */
  display: withDevanagari(display.fontFamily),
  /** Cormorant Garamond: light book serif for supporting lines. */
  serif: withDevanagari(serif.fontFamily),
  /** Allura: lighter, rounder script. */
  scriptAlt: withDevanagari(scriptAlt.fontFamily),
  /** Cinzel: carved Roman capitals. */
  caps: withDevanagari(caps.fontFamily),
  /** Marcellus: soft flared serif, good in spaced capitals. */
  elegant: withDevanagari(elegant.fontFamily),
  /** Montserrat: geometric sans. */
  sans: withDevanagari(sans.fontFamily),
  /** Pacifico: bold brush script for fun designs. */
  fun: withDevanagari(fun.fontFamily),
  /** Bebas Neue: tall condensed poster capitals. */
  poster: withDevanagari(poster.fontFamily),
  /** Monoton: neon-tube display capitals; headings only. */
  neon: withDevanagari(neon.fontFamily),
};

const ALL = [script, display, serif, scriptAlt, caps, elegant, sans, fun, poster, neon, devanagari];

export const waitForTemplateFonts = () => Promise.all(ALL.map((f) => f.waitUntilDone()));
