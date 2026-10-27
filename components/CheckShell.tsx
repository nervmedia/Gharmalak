import Link from 'next/link';
import { Mark } from './Mark';

// Header and footer for Gharmalak Check pages. No club or round links, so renters and residents see only Check.
export function CheckHeader({ cta }: { cta?: { href: string; label: string } }) {
  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link href="/check" className="brand" aria-label="Gharmalak Check home">
          <Mark size={26} />
          <span className="brand-text">
            <span className="brand-name">Gharmalak <span className="check-tag">Check</span></span>
            <span className="brand-desc">VERIFIED RESIDENTS · PUNE</span>
          </span>
        </Link>
        <nav className="header-nav" aria-label="Main">
          <Link href="/check#how">How it works</Link>
          <Link href="/check#sample">Sample report</Link>
          <Link href="/check/answer">For residents</Link>
        </nav>
        {cta && <div className="header-actions"><Link href={cta.href} className="gm-btn gm-btn-primary check-header-cta">{cta.label}</Link></div>}
      </div>
    </header>
  );
}

export function CheckFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-row">
        <div className="brand">
          <Mark size={22} />
          <span className="brand-name">Gharmalak <span className="check-tag">Check</span></span>
        </div>
        <p className="muted">Honest answers from people who live there. No brokers, no builders, no paid reviews.</p>
        <nav className="footer-nav" aria-label="Footer">
          <Link href="/check/answer">For residents</Link>
          <Link href="/privacy">Privacy</Link>
          <span className="muted">© {new Date().getFullYear()} Gharmalak</span>
        </nav>
      </div>
    </footer>
  );
}
