import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="page"><div className="wrap flow" style={{ textAlign: 'center', paddingTop: 80 }}>
      <p className="overline">404</p>
      <h1>This page is not here</h1>
      <p className="muted" style={{ margin: '12px 0 24px' }}>It may have moved. The club’s front door is this way.</p>
      <Link href="/" className="gm-btn gm-btn-primary">Go to Gharmalak</Link>
    </div></main>
  );
}
