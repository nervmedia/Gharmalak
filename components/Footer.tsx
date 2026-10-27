'use client';
import Link from 'next/link';
import { Mark } from './Mark';
import { useLang } from './LangProvider';

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="site-footer">
      <div className="wrap footer-row">
        <div className="brand">
          <Mark size={22} />
          <span className="brand-name">Gharmalak</span>
        </div>
        <p className="muted">{t.footer_line}</p>
        <nav className="footer-nav" aria-label="Footer">
          <Link href="/round/solar-nagpur">{t.nav_round}</Link>
          <Link href="/privacy">{t.privacy}</Link>
          <span className="muted">© {new Date().getFullYear()} Gharmalak</span>
        </nav>
      </div>
    </footer>
  );
}
