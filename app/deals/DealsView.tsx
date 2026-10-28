'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, AppWindow, ArrowRight, Bath, BatteryCharging, Blinds, Bug, Cctv, Check, ChefHat, CloudRain, CookingPot, Droplets, Fan, Flame, Layers, Paintbrush, Refrigerator, ShieldCheck, Snowflake, Sofa, Sun, Umbrella } from 'lucide-react';
import { deals, dealCities, dealMonths, monthLabel, tierLabel, type Deal, type DealKind } from '@/lib/deals';
import { currentRound, inr, site } from '@/lib/config';

const ICONS: Record<DealKind, typeof Sun> = {
  solar: Sun, heater: Flame, painting: Paintbrush, cooling: Snowflake, backup: BatteryCharging, waterproofing: Umbrella, pest: Bug, water: Droplets,
  security: Cctv, kitchen: ChefHat, fans: Fan, appliances: CookingPot, coolroof: Layers, rainwater: CloudRain, windows: AppWindow,
  bathroom: Bath, furniture: Sofa, decor: Blinds, whitegoods: Refrigerator,
};

function sourceFromUrl() {
  const p = new URLSearchParams(window.location.search);
  const parts = [p.get('utm_source') || p.get('src'), p.get('utm_campaign'), p.get('utm_content')].filter(Boolean);
  if (parts.length) return parts.join('/').slice(0, 120);
  return document.referrer ? new URL(document.referrer).hostname.slice(0, 120) : 'direct';
}

export function DealsView() {
  const [picked, setPicked] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Nagpur');
  const [consent, setConsent] = useState(false);
  const [source, setSource] = useState('direct');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { count: number; member: boolean }>(null);

  useEffect(() => {
    setSource(sourceFromUrl());
    const want = new URLSearchParams(window.location.search).get('deal');
    if (want && deals.some(d => d.id === want)) setPicked([want]);
    try { const p = localStorage.getItem('gm_phone'); if (p) setPhone(p); } catch {}
  }, []);

  const toggle = (id: string) => setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]));
  const digits = phone.replace(/\D/g, '').slice(-10);
  const today = new Date().toISOString().slice(0, 10);
  const founding = today <= '2026-12-31';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!picked.length) err.deals = 'Tap at least one deal above.';
    if (name.trim().length < 2) err.name = 'Please enter your name.';
    if (!/^[6-9]\d{9}$/.test(digits)) err.phone = 'Enter a 10-digit WhatsApp number.';
    if (!consent) err.consent = 'Please agree so we can message you on WhatsApp.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    try {
      const res = await fetch('/api/deals/interest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deals: picked, name: name.trim(), phone: digits, city, consent, source }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const d = await res.json();
      try { localStorage.setItem('gm_phone', digits); } catch {}
      setDone({ count: picked.length, member: d.member });
    } catch {
      setErrors({ server: 'Something went wrong. Please try again, or message us on WhatsApp.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="overline">Free to browse · No payment to show interest</p>
          <h1>Every deal for the <em>next 12 months.</em></h1>
          <p className="hero-body">Two group deals every month: a big one, where the group price saves you the most, and a quick win. Timed to the weather: solar before summer, waterproofing before the monsoon, painting before Diwali. Tap the deals you want. We&apos;ll WhatsApp you when each round opens, with the price to beat.</p>
          <p className="hero-note"><ShieldCheck size={18} /> Only top-rated, brand-certified installers. Members get the group price; browsing and showing interest are free.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0, borderTop: 0 }}>
        <div className="wrap">
          <div className="deal-months">
            {dealMonths.map(m => (
              <section key={m} className="deal-month-row" aria-label={monthLabel(m)}>
                <h2 className="deal-month">{monthLabel(m)}</h2>
                <ol className="deals-grid deals-pair">
                  {deals.filter(d => d.month === m).map(d => <DealCard key={d.id} d={d} on={picked.includes(d.id)} onToggle={() => toggle(d.id)} />)}
                </ol>
              </section>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 16, fontSize: 14 }}>Dates are for Nagpur. Other cities follow as they open; pick your city below so we know where to go next. Prices are typical spends per home, not quotes. Brand names show the kind of vendor we work with, not a signed partnership.</p>
        </div>
      </section>

      <section className="section" id="interest">
        <div className="wrap" style={{ maxWidth: 640 }}>
          {done ? (
            <div className="panel stack">
              <p className="overline">You&apos;re on the list</p>
              <h2>We&apos;ll message you when {done.count === 1 ? 'this round opens' : `these ${done.count} rounds open`}.</h2>
              {done.member ? (
                <p className="muted">You&apos;re already a member, so you&apos;ll get the group price. Thank you.</p>
              ) : (
                <>
                  <p className="muted">Showing interest is free. To buy at the group price when a round opens, you need a membership: {founding ? <>{inr(site.fee)} for your first year if you join by 31 December (it's {inr(site.regularFee)} a year after that), and the first 1,000 Nagpur members get it back on their first deal.</> : <>{inr(site.regularFee)} a year.</>}</p>
                  <Link href="/join" className="gm-btn gm-btn-primary">Join the club <ArrowRight size={18} /></Link>
                  <p className="muted" style={{ fontSize: 14 }}>No rush. You can join when the round you want opens.</p>
                </>
              )}
            </div>
          ) : (
            <form className="panel form" onSubmit={submit} noValidate>
              <div>
                <h2 style={{ fontSize: 22 }}>Tell me when these open</h2>
                <p className="muted">{picked.length ? `${picked.length} deal${picked.length > 1 ? 's' : ''} picked.` : 'Pick deals above first.'} Free, no payment.</p>
                {errors.deals && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.deals}</p>}
              </div>
              <div className={`gm-field ${errors.name ? 'gm-field-error' : ''}`}>
                <label className="gm-label" htmlFor="dname">Your name</label>
                <div className="gm-input-wrap"><input id="dname" className="gm-input" autoComplete="name" value={name} onChange={e => setName(e.target.value.slice(0, 120))} aria-invalid={!!errors.name} /></div>
                {errors.name && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.name}</p>}
              </div>
              <div className={`gm-field ${errors.phone ? 'gm-field-error' : ''}`}>
                <label className="gm-label" htmlFor="dphone">WhatsApp number</label>
                <div className="gm-input-wrap"><span className="gm-input-prefix">+91</span><input id="dphone" className="gm-input" inputMode="numeric" autoComplete="tel-national" value={phone} onChange={e => setPhone(e.target.value.slice(0, 14))} aria-invalid={!!errors.phone} /></div>
                {errors.phone && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.phone}</p>}
              </div>
              <fieldset className="gm-field plain-fieldset">
                <legend className="gm-label">City</legend>
                <div className="gm-chips">
                  {dealCities.map(c => <button key={c} type="button" className="gm-chip" aria-pressed={city === c} onClick={() => setCity(c)}>{c}</button>)}
                </div>
              </fieldset>
              <label className="check">
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
                <span>Message me on WhatsApp about these deals. I can reply STOP anytime. Gharmalak never sells my data (<Link href="/privacy">privacy</Link>).</span>
              </label>
              {errors.consent && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.consent}</p>}
              {errors.server && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.server}</p>}
              <button type="submit" className="gm-btn gm-btn-primary gm-btn-block" disabled={busy}>{busy ? 'Saving…' : 'Notify me, free'}</button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

function DealCard({ d, on, onToggle }: { d: Deal; on: boolean; onToggle: () => void }) {
  const Icon = ICONS[d.kind];
  const live = d.roundHref && d.id.includes(currentRound.category) && d.month === currentRound.opens.slice(0, 7);
  return (
    <li className={`deal-card ${d.tier === 'big' ? 'deal-card-big' : ''} ${on ? 'deal-card-on' : ''}`}>
      <div className="deal-card-top">
        <span className={`deal-tier deal-tier-${d.tier}`}>{tierLabel[d.tier]}</span>
        {live && <span className="gm-badge gm-badge-founding">Round 1 · opens {new Date(currentRound.opens).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
      </div>
      <h3 className="deal-title"><Icon size={20} /> {d.title}</h3>
      <p className="deal-ticket">{d.ticket}</p>
      <p className="muted deal-why">{d.why}</p>
      <p className="deal-brands">{d.brands}</p>
      <div className="deal-actions">
        <button type="button" className="gm-chip" aria-pressed={on} onClick={onToggle}>
          {on ? <><Check size={16} /> Interested</> : "I'm interested"}
        </button>
        {live && <Link href={d.roundHref!} className="deal-link">See the round <ArrowRight size={14} /></Link>}
      </div>
    </li>
  );
}
