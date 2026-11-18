import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { HI } from './i18n-hi';

export type Lang = 'en' | 'hi';

type I18n = {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Translate an English UI string. `{name}` placeholders are filled from `vars`. Missing Hindi falls back to English. */
  t: (text: string, vars?: Record<string, string | number>) => string;
};

const KEY = 'iv.lang';

const readLang = (): Lang => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'en' || saved === 'hi') return saved;
  } catch {
    // Storage blocked: fall through to the browser language.
  }
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('hi') ? 'hi' : 'en';
};

const fill = (s: string, vars?: Record<string, string | number>) =>
  vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s;

const I18nContext = createContext<I18n>({ lang: 'en', setLang: () => {}, t: (s, v) => fill(s, v) });

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(readLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      // Not saved; the choice still applies for this visit.
    }
  }, []);

  const t = useCallback((text: string, vars?: Record<string, string | number>) => fill((lang === 'hi' && HI[text]) || text, vars), [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
