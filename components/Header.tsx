'use client';
import Link from 'next/link';
import { Mark } from './Mark';
import { useLang } from './LangProvider';
import { langs } from '@/lib/i18n';

export function Header() {
  const { t, lang, setLang } = useLang();
  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link href="/" className="brand" aria-label="Gharmalak home">
          <Mark size={26} />
          <span className="brand-text">
            <span className="brand-name">Gharmalak<span className="brand-tld">.com</span></span>
            <span className="brand-desc">{t.descriptor}</span>
          </span>
        </Link>
        <nav className="header-nav" aria-label="Main">
          <Link href="/#how">{t.nav_how}</Link>
          <Link href="/deals">{t.nav_deals}</Link>
          <Link href="/my-home">{t.nav_home}</Link>
          <Link href="/round/solar-nagpur">{t.nav_round}</Link>
        </nav>
        <div className="header-actions">
          <div className="gm-seg lang-seg" role="group" aria-label="Language">
            {langs.map(l => (
              <button key={l.id} type="button" aria-pressed={lang === l.id} onClick={() => setLang(l.id)}>{l.label}</button>
            ))}
          </div>
          <Link href="/join" className="gm-btn gm-btn-primary header-cta">{t.nav_join}</Link>
        </div>
      </div>
    </header>
  );
}
