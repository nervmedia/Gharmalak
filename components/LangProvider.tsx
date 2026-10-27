'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { dict, type Dict, type Lang } from '@/lib/i18n';

const Ctx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void }>({ lang: 'en', t: dict.en, setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gm_lang') as Lang | null;
      if (saved && dict[saved]) setLangState(saved);
    } catch {}
  }, []);
  useEffect(() => { document.documentElement.lang = lang === 'en' ? 'en-IN' : lang; }, [lang]);
  const setLang = (l: Lang) => { setLangState(l); try { localStorage.setItem('gm_lang', l); } catch {} };
  return <Ctx.Provider value={{ lang, t: dict[lang], setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
