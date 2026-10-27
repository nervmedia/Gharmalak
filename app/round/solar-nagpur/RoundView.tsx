'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Check, Clock, MessageCircle, Sun } from 'lucide-react';
import { useLang } from '@/components/LangProvider';
import { useStats } from '@/components/useStats';
import { currentRound, waLink } from '@/lib/config';

export function RoundView() {
  const { t } = useLang();
  const stats = useStats();
  const [phone, setPhone] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'already' | 'notmember' | 'error'>('idle');
  const [extra, setExtra] = useState(0);

  useEffect(() => { try { const p = localStorage.getItem('gm_phone'); if (p) setPhone(p); } catch {} }, []);

  const today = new Date().toISOString().slice(0, 10);
  const status = today < currentRound.opens ? t.r_status_soon : today <= currentRound.closes ? t.r_status_open : t.r_status_closed;
  const optins = (stats?.optins ?? 0) + extra;
  const pct = Math.min(100, Math.round((optins / currentRound.target) * 100));
  const closes = new Date(currentRound.closes).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  async function optIn(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(digits)) { setState('error'); return; }
    setState('busy');
    const res = await fetch('/api/optin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: digits }) }).catch(() => null);
    if (!res) { setState('error'); return; }
    if (res.status === 404) { setState('notmember'); return; }
    if (!res.ok) { setState('error'); return; }
    const d = await res.json();
    if (d.created) setExtra(x => x + 1);
    setState(d.created ? 'done' : 'already');
  }

  return (
    <div className="round-hero">
      <div>
        <p className="overline">{t.round_over}</p>
        <h1>{t.round_title}</h1>
        <p className="hero-body">{t.round_body}</p>

        <h2 style={{ fontSize: 22, marginTop: 40 }}>{t.r_what}</h2>
        <ul className="list-ticks">
          {[t.r_what1, t.r_what2, t.r_what3, t.r_what4].map(x => <li key={x}><Check size={20} /> {x}</li>)}
        </ul>

        <h2 style={{ fontSize: 22, marginTop: 40, marginBottom: 16 }}>{t.r_how}</h2>
        <ol className="gm-steps" style={{ width: '100%' }}>
          {[1, 2, 3, 4].map(n => (
            <li key={n} className={`gm-step ${n === 1 ? 'gm-step-current' : ''}`}>
              <span className="gm-step-dot">{n}</span>
              <p className="gm-step-title">{t[`step${n}_t` as 'step1_t']}</p>
              <p className="gm-step-body">{t[`step${n}_b` as 'step1_b']}</p>
            </li>
          ))}
        </ol>
      </div>

      <aside className="stack" style={{ position: 'sticky', top: 92 }}>
        <article className="gm-deal" style={{ width: '100%' }}>
          <div className="gm-deal-head">
            <h2 className="gm-deal-title"><Sun className="gm-icon" /> {t.i_solar}</h2>
            <span className="gm-badge gm-badge-pending"><Clock className="gm-icon" /> {status}</span>
          </div>
          <div className="round-facts">
            <div className="fact"><small>{t.round_pbt}</small><strong>{t.round_pbt_val}</strong></div>
            <div className="fact"><small>{t.round_saving}</small><strong>{t.round_saving_val}</strong></div>
          </div>
          <div className="meter">
            <div className="gm-progress" role="progressbar" aria-valuenow={optins} aria-valuemin={0} aria-valuemax={currentRound.target} aria-label={t.round_homes}><span style={{ width: `${Math.max(pct, 2)}%` }} /></div>
            <div className="meter-row"><span><strong className="amount" style={{ color: 'var(--ink)' }}>{optins}</strong> / {currentRound.target} {t.round_homes}</span><span>{t.round_closes} {closes}</span></div>
          </div>
        </article>

        <form className="panel form" onSubmit={optIn} noValidate>
          <div>
            <h2 style={{ fontSize: 20 }}>{t.r_opt_title}</h2>
            <p className="muted" style={{ fontSize: 15, marginTop: 6 }}>{t.r_opt_body}</p>
          </div>
          <div className={`gm-field ${state === 'error' ? 'gm-field-error' : ''}`}>
            <label className="gm-label" htmlFor="optin-phone">{t.f_phone}</label>
            <div className="gm-input-wrap"><span className="gm-input-prefix">+91</span><input id="optin-phone" className="gm-input" inputMode="numeric" autoComplete="tel-national" value={phone} onChange={e => { setPhone(e.target.value.replace(/[^\d\s]/g, '').slice(0, 12)); setState('idle'); }} /></div>
            {state === 'error' && <p className="gm-error"><AlertCircle className="gm-icon" /> {t.f_err_phone}</p>}
          </div>
          <button className="gm-btn gm-btn-primary gm-btn-block" disabled={state === 'busy'}>{state === 'busy' ? '…' : t.r_opt_cta}</button>
          {state === 'done' && <div className="notice ok" role="status">{t.r_opt_done}</div>}
          {state === 'already' && <div className="notice ok" role="status">{t.r_opt_already}</div>}
          {state === 'notmember' && <div className="notice err" role="alert">{t.r_opt_notmember} <Link href="/join">{t.nav_join}</Link></div>}
          <a className="gm-btn gm-btn-whatsapp gm-btn-block" href={waLink('YES, opt me in to Round 1: rooftop solar, Nagpur.')} target="_blank" rel="noopener"><MessageCircle size={18} /> WhatsApp: YES</a>
        </form>
      </aside>
    </div>
  );
}
