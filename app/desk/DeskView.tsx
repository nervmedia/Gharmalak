'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Lock, LogOut, RefreshCw, Search, MessageCircle, Check } from 'lucide-react';
import { Mark } from '@/components/Mark';
import { inr, site } from '@/lib/config';
import { deals, monthLabel } from '@/lib/deals';

type Reg = { phone: string; name: string; area: string; home: string; interests: string[]; lang: string; source: string; status: string; paymentId: string | null; createdAt: string; paidAt: string | null };
type CheckReq = { id: string; phone: string; name: string; building: string; area: string; purpose: string; product?: string; household?: string; moveIn: string; price: number; source: string; status: string; createdAt: string };
type CheckAns = { id: string; phone: string; name: string; building: string; area: string; role: string; years: string; household?: string; answers: Record<string, string>; rating: number; recommend: boolean; calls?: boolean; status: string; createdAt: string };
type DealInt = { dealId: string; phone: string; name: string; city: string; source: string; member: boolean; createdAt: string };
type Data = { registrations: Reg[]; optins: { phone: string; createdAt: string }[]; counts: { members: number; paid: number; optins: number }; round: { id: string; target: number; opens: string; closes: string }; storage: string; checkRequests?: CheckReq[]; checkAnswers?: CheckAns[]; dealInterests?: DealInt[] };

function DeskShell({ children, onLogout }: { children: React.ReactNode; onLogout?: () => void }) {
  return (
    <>
      <header className="site-header"><div className="wrap header-row">
        <span className="brand"><Mark size={24} /><span className="brand-name">Gharmalak</span><span className="gm-badge gm-badge-neutral" style={{ marginLeft: 8 }}>Founder desk</span></span>
        {onLogout && <div className="header-actions"><button className="gm-btn gm-btn-ghost" onClick={onLogout}><LogOut size={18} /> Sign out</button></div>}
      </div></header>
      <main id="main" className="desk"><div className="wrap">{children}</div></main>
    </>
  );
}

export function DeskLogin({ configured }: { configured: boolean }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await fetch('/api/desk/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) }).catch(() => null);
    setBusy(false);
    if (r?.ok) { window.location.reload(); return; }
    setErr(r?.status === 429 ? 'Too many tries. Wait 5 minutes.' : r?.status === 503 ? 'The desk password is not set on the server yet.' : 'That password is not right.');
  }
  return (
    <DeskShell>
      <div className="flow" style={{ maxWidth: 420, paddingTop: 40 }}>
        <form className="panel form" onSubmit={login}>
          <div><Lock size={22} style={{ color: 'var(--brass)' }} /><h1 style={{ fontSize: 26, marginTop: 12 }}>Founder desk</h1><p className="muted">Members, payments and round opt-ins.</p></div>
          {!configured && <div className="notice err">Set DESK_PASSWORD and SESSION_SECRET in the server environment to use the desk.</div>}
          <div className="gm-field"><label className="gm-label" htmlFor="pw">Password</label><div className="gm-input-wrap"><input id="pw" type="password" className="gm-input" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} /></div></div>
          {err && <div className="notice err" role="alert">{err}</div>}
          <button className="gm-btn gm-btn-primary gm-btn-block" disabled={busy || !pw}>Sign in</button>
        </form>
      </div>
    </DeskShell>
  );
}

const fmt = (iso: string | null) => iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';

export function DeskView() {
  const [d, setD] = useState<Data | null>(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid' | 'optin'>('all');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    const r = await fetch('/api/desk/data', { cache: 'no-store' }).catch(() => null);
    if (r?.status === 401) { window.location.reload(); return; }
    if (!r?.ok) { setErr('Could not load data. Check the database settings.'); return; }
    setErr(''); setD(await r.json());
  }, []);
  useEffect(() => { load(); const id = setInterval(load, 60_000); return () => clearInterval(id); }, [load]);

  const opted = useMemo(() => new Set(d?.optins.map(o => o.phone)), [d]);
  const rows = useMemo(() => {
    if (!d) return [];
    const s = q.trim().toLowerCase();
    return d.registrations.filter(r =>
      (filter === 'all' || (filter === 'paid' && r.status === 'paid') || (filter === 'unpaid' && r.status !== 'paid') || (filter === 'optin' && opted.has(r.phone))) &&
      (!s || r.name.toLowerCase().includes(s) || r.phone.includes(s) || r.area.toLowerCase().includes(s)));
  }, [d, q, filter, opted]);

  const byArea = useMemo(() => {
    const m = new Map<string, number>();
    d?.registrations.forEach(r => m.set(r.area, (m.get(r.area) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [d]);
  const checkCovered = useMemo(() => {
    const m = new Map<string, number>();
    d?.checkAnswers?.forEach(a => { const k = a.building.trim().toLowerCase(); m.set(k, (m.get(k) || 0) + 1); });
    return [...m.values()].filter(n => n >= 3).length;
  }, [d]);
  const today = new Date().toISOString().slice(0, 10);
  const newToday = d?.registrations.filter(r => r.createdAt.slice(0, 10) === today).length ?? 0;

  async function markPaid(phone: string) {
    const paymentId = prompt('Razorpay payment id (optional)') ?? null;
    if (paymentId === null) return;
    await fetch('/api/desk/mark-paid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, paymentId }) });
    load();
  }
  async function logout() { await fetch('/api/desk/logout', { method: 'POST' }); window.location.reload(); }
  const remind = (r: Reg) => `https://wa.me/91${r.phone}?text=${encodeURIComponent(`Hi ${r.name.split(' ')[0]}, thank you for joining Gharmalak. Your founding seat is reserved. Pay ₹499 here to confirm it: ${site.paymentLink || '[payment link]'}`)}`;

  return (
    <DeskShell onLogout={logout}>
      <div className="desk-head">
        <div><p className="overline">Nagpur pilot</p><h1>Today at Gharmalak</h1></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="gm-btn gm-btn-secondary" onClick={load}><RefreshCw size={18} /> Refresh</button>
          <a className="gm-btn gm-btn-primary" href="/api/desk/export"><Download size={18} /> Export CSV</a>
        </div>
      </div>
      {err && <div className="notice err" style={{ marginBottom: 16 }}>{err}</div>}
      {d?.storage === 'file' && <div className="notice" style={{ marginBottom: 16 }}>Test mode: data is saved in a file on the server. Add the MySQL settings before launch.</div>}

      <div className="kpis">
        <div className="kpi"><small>Members joined</small><span className="amount">{d?.counts.members ?? '·'}</span><small>{newToday} today</small></div>
        <div className="kpi"><small>Paid</small><span className="amount">{d?.counts.paid ?? '·'}</span><small>{d && d.counts.members ? Math.round(d.counts.paid / d.counts.members * 100) : 0}% of joined</small></div>
        <div className="kpi"><small>Membership revenue</small><span className="amount">{d ? inr(d.counts.paid * site.fee) : '·'}</span><small>before GST</small></div>
        <div className="kpi"><small>Round 1 opt-ins</small><span className="amount">{d?.counts.optins ?? '·'}</span><small>target {d?.round.target ?? ''}</small></div>
      </div>

      <div className="desk-grid">
        <div className="panel">
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Members by area</h2>
          <div className="bars">
            {byArea.length ? byArea.map(([a, n]) => (
              <div key={a} className="bar-row"><span>{a}</span><div className="gm-progress"><span style={{ width: `${n / byArea[0][1] * 100}%` }} /></div><span className="amount">{n}</span></div>
            )) : <p className="muted">No members yet.</p>}
          </div>
        </div>
        <div className="panel">
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Round 1 · rooftop solar</h2>
          <div className="gm-progress"><span style={{ width: `${Math.min(100, (d?.counts.optins ?? 0) / (d?.round.target || 50) * 100)}%` }} /></div>
          <div className="meter-row"><span>{d?.counts.optins ?? 0} of {d?.round.target ?? 50} homes</span><span>{d ? `Opens ${new Date(d.round.opens).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · closes ${new Date(d.round.closes).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}</span></div>
          <p className="muted" style={{ marginTop: 16, fontSize: 15 }}>When 10 quotes are in, set the price to beat and message everyone who opted in.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="gm-input-wrap"><span className="gm-input-prefix"><Search size={16} /></span><input className="gm-input" placeholder="Search name, number or area" value={q} onChange={e => setQ(e.target.value)} aria-label="Search members" /></div>
        <div className="gm-chips">
          {(['all', 'paid', 'unpaid', 'optin'] as const).map(f => <button key={f} className="gm-chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f === 'optin' ? 'Opted in' : f[0].toUpperCase() + f.slice(1)}</button>)}
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>Name</th><th>WhatsApp</th><th>Area</th><th>Home</th><th>Wants</th><th>Status</th><th>Joined</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.phone}>
                <td>{r.name}<br /><small className="muted">{r.lang.toUpperCase()} · {r.source}</small></td>
                <td className="mono">{r.phone}</td>
                <td>{r.area}</td>
                <td>{r.home === 'house' ? 'House' : 'Flat'}</td>
                <td>{r.interests.join(', ')}</td>
                <td>{r.status === 'paid' ? <span className="gm-badge gm-badge-verified"><Check size={14} /> Paid</span> : <span className="gm-badge gm-badge-pending">Not paid</span>} {opted.has(r.phone) && <span className="gm-badge gm-badge-founding">Round 1</span>}</td>
                <td>{fmt(r.createdAt)}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {r.status !== 'paid' && <>
                    <a className="gm-btn gm-btn-ghost" href={remind(r)} target="_blank" rel="noopener" aria-label={`Send payment reminder to ${r.name}`}><MessageCircle size={16} /></a>
                    <button className="gm-btn gm-btn-ghost" onClick={() => markPaid(r.phone)}>Mark paid</button>
                  </>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {d && !rows.length && <div className="empty">No members match.</div>}
      </div>

      <div className="desk-head" style={{ marginTop: 48 }}>
        <div><p className="overline">Free, before anyone pays</p><h1>Deal interest</h1></div>
      </div>
      <div className="kpis">
        <div className="kpi"><small>People interested</small><span className="amount">{d ? new Set(d.dealInterests?.map(i => i.phone)).size : '·'}</span><small>{d ? new Set(d.dealInterests?.filter(i => !i.member).map(i => i.phone)).size : 0} not yet members</small></div>
        <div className="kpi"><small>Deal picks</small><span className="amount">{d?.dealInterests?.length ?? '·'}</span><small>one person can pick several</small></div>
        <div className="kpi"><small>Top source</small><span className="amount" style={{ fontSize: 20 }}>{(() => { const m = new Map<string, number>(); d?.dealInterests?.forEach(i => m.set(i.source, (m.get(i.source) || 0) + 1)); const top = [...m.entries()].sort((a, b) => b[1] - a[1])[0]; return top ? `${top[0]} (${top[1]})` : '·'; })()}</span><small>utm_source/campaign/ad</small></div>
      </div>
      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>Deal</th><th>Month</th><th>Picks</th><th>Non-members</th><th>By city</th><th>By source</th></tr></thead>
          <tbody>
            {deals.map(dl => {
              const list = d?.dealInterests?.filter(i => i.dealId === dl.id) ?? [];
              const tally = (key: 'city' | 'source') => { const m = new Map<string, number>(); list.forEach(i => m.set(i[key], (m.get(i[key]) || 0) + 1)); return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} ${v}`).join(', '); };
              return <tr key={dl.id}><td>{dl.title}</td><td>{monthLabel(dl.month)}</td><td>{list.length}</td><td>{list.filter(i => !i.member).length}</td><td>{tally('city')}</td><td>{tally('source')}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
      <div className="table-wrap" style={{ marginTop: 16 }}>
        <table className="data">
          <thead><tr><th>Name</th><th>WhatsApp</th><th>City</th><th>Deal</th><th>Source</th><th>Member</th><th>When</th></tr></thead>
          <tbody>
            {d?.dealInterests?.map(i => (
              <tr key={i.dealId + i.phone}><td>{i.name}</td><td className="mono">{i.phone}</td><td>{i.city}</td><td>{deals.find(x => x.id === i.dealId)?.title ?? i.dealId}</td><td>{i.source}</td><td>{i.member ? <span className="gm-badge gm-badge-verified"><Check size={14} /> Paid</span> : <span className="gm-badge gm-badge-pending">Free</span>}</td><td>{fmt(i.createdAt)}</td></tr>
            ))}
          </tbody>
        </table>
        {d && !d.dealInterests?.length && <div className="empty">No deal interest yet.</div>}
      </div>

      <div className="desk-head" style={{ marginTop: 48 }}>
        <div><p className="overline">Pune test</p><h1>Gharmalak Check</h1></div>
      </div>
      <div className="kpis">
        <div className="kpi"><small>Report requests</small><span className="amount">{d?.checkRequests?.length ?? '·'}</span><small>{d?.checkRequests?.filter(r => r.price === 99).length ?? 0} at ₹99 · {d?.checkRequests?.filter(r => r.price === 299).length ?? 0} at ₹299 · {d?.checkRequests?.filter(r => r.product === 'call').length ?? 0} owner calls</small></div>
        <div className="kpi"><small>Owner answers</small><span className="amount">{d?.checkAnswers?.length ?? '·'}</span><small>waiting for proof until verified</small></div>
        <div className="kpi"><small>Buildings with 3+ answers</small><span className="amount">{d ? checkCovered : '·'}</span><small>goal 20 of 30</small></div>
        <div className="kpi"><small>Buildings requested</small><span className="amount">{d ? new Set(d.checkRequests?.map(r => r.building.toLowerCase())).size : '·'}</span><small>unique names</small></div>
      </div>
      <div className="table-wrap" style={{ marginBottom: 24 }}>
        <table className="data">
          <thead><tr><th>Request</th><th>Renter</th><th>WhatsApp</th><th>Building</th><th>Rent or buy</th><th>Moving</th><th>Price</th><th>When</th><th></th></tr></thead>
          <tbody>
            {d?.checkRequests?.map(r => (
              <tr key={r.id}>
                <td className="mono">{r.id}</td>
                <td>{r.name}<br /><small className="muted">{r.source}</small></td>
                <td className="mono">{r.phone}</td>
                <td>{r.building}<br /><small className="muted">{r.area}</small></td>
                <td>{r.purpose === 'buy' ? 'Buy' : 'Rent'}<br /><small className="muted">{r.product === 'call' ? 'Owner call' : 'Report'} · {r.household || '–'}</small></td>
                <td>{r.moveIn.replace('-', ' ')}</td>
                <td>{inr(r.price)}</td>
                <td>{fmt(r.createdAt)}</td>
                <td><a className="gm-btn gm-btn-ghost" href={`https://wa.me/91${r.phone}?text=${encodeURIComponent(`Hi ${r.name.split(' ')[0]}, this is Gharmalak Check about ${r.building} (${r.id}).`)}`} target="_blank" rel="noopener" aria-label={`Message ${r.name}`}><MessageCircle size={16} /></a></td>
              </tr>
            ))}
          </tbody>
        </table>
        {d && !d.checkRequests?.length && <div className="empty">No report requests yet.</div>}
      </div>
      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>Answer</th><th>Owner</th><th>WhatsApp</th><th>Building</th><th>Role</th><th>Rating</th><th>Recommend</th><th>When</th></tr></thead>
          <tbody>
            {d?.checkAnswers?.map(a => (
              <tr key={a.id} title={Object.entries(a.answers).map(([k, v]) => `${k}: ${v}`).join('\n')}>
                <td className="mono">{a.id}</td>
                <td>{a.name}<br /><small className="muted">{a.years.replace('-', ' ')} yrs</small></td>
                <td className="mono">{a.phone}</td>
                <td>{a.building}<br /><small className="muted">{a.area}</small></td>
                <td>{a.role === 'owner' ? 'Owner' : 'Tenant'}<br /><small className="muted">{a.household || '–'} · {a.calls ? 'takes calls' : 'no calls'}</small></td>
                <td>{a.rating} / 5</td>
                <td>{a.recommend ? 'Yes' : 'No'}</td>
                <td>{fmt(a.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {d && !d.checkAnswers?.length && <div className="empty">No owner answers yet.</div>}
      </div>
    </DeskShell>
  );
}
