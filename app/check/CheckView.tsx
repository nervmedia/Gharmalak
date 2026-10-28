'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, BadgeCheck, Building2, ChevronDown, MessageCircle, Phone, Search, ShieldCheck, Star, UserCheck, Users } from 'lucide-react';
import { check, coveredBuildings, households, questions, type Household } from '@/lib/check';
import { inr, waLink } from '@/lib/config';

type Product = 'report' | 'call';
type Deciding = '' | 'this-month' | 'next-month' | 'later';
type Step = 'search' | 'details' | 'pay';

const DECIDING: { id: Deciding; label: string }[] = [
  { id: 'this-month', label: 'This month' },
  { id: 'next-month', label: 'In 1 to 3 months' },
  { id: 'later', label: 'Just looking' },
];

const SAMPLE: { topic: string; text: string; who: string }[] = [
  { topic: 'Possession', text: 'Promised December 2022, got the keys in May 2023. The builder paid no delay penalty unless you pushed hard.', who: 'Owner since 2023 · Family' },
  { topic: 'Build quality', text: 'Good structure. Two of us had bathroom seepage in the first monsoon; it was fixed, but it took three complaints.', who: 'Owner since 2023 · Couple' },
  { topic: 'Papers', text: 'OC came 4 months after possession. Registration and SBI and HDFC loans went through without trouble.', who: 'Owner since 2023 · Family' },
  { topic: 'Water and power', text: 'Corporation water most of the year. In April and May the society buys tankers 2 or 3 times a week.', who: 'Owner since 2024 · Bachelor' },
];

function pickPrice(): number {
  try {
    const q = Number(new URLSearchParams(window.location.search).get('p'));
    if (check.prices.includes(q as 99 | 299)) { localStorage.setItem('gm_chk_price', String(q)); return q; }
    const saved = Number(localStorage.getItem('gm_chk_price'));
    if (check.prices.includes(saved as 99 | 299)) return saved;
    const p = check.prices[Math.floor(Math.random() * check.prices.length)];
    localStorage.setItem('gm_chk_price', String(p));
    return p;
  } catch {
    return 299;
  }
}

export function CheckView() {
  const [step, setStep] = useState<Step>('search');
  const [price, setPrice] = useState(299);
  const [source, setSource] = useState('direct');
  const [building, setBuilding] = useState('');
  const [area, setArea] = useState('');
  const [product, setProduct] = useState<Product>('call');
  const [household, setHousehold] = useState<Household | ''>('');
  const [deciding, setDeciding] = useState<Deciding>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState('');

  useEffect(() => {
    setPrice(pickPrice());
    const p = new URLSearchParams(window.location.search);
    const src = p.get('utm_source') || p.get('src') || (document.referrer ? new URL(document.referrer).hostname : '');
    if (src) setSource(src.slice(0, 60));
    if (p.get('for') === 'report') setProduct('report');
  }, []);

  const covered = coveredBuildings.some(b => b.toLowerCase() === building.trim().toLowerCase());
  const digits = phone.replace(/\D/g, '').slice(-10);
  const isCall = product === 'call';
  const amount = isCall ? check.callPrice : price;

  function search(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (building.trim().length < 2) err.building = 'Type the tower, society or township name.';
    if (!area) err.area = 'Pick the area.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setStep('details');
  }

  async function request(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!household) err.household = 'Tell us who will live there, so we match you with the right owner.';
    if (!deciding) err.deciding = 'When are you deciding?';
    if (name.trim().length < 2) err.name = 'Please enter your name.';
    if (!/^[6-9]\d{9}$/.test(digits)) err.phone = 'Enter a 10-digit WhatsApp number.';
    if (!consent) err.consent = 'Please agree so we can reach you on WhatsApp.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    try {
      const res = await fetch('/api/check/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ building: building.trim(), area, product, household, moveIn: deciding, name: name.trim(), phone: digits, consent, price, source }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const d = await res.json();
      setRef(d.id);
      setStep('pay');
    } catch {
      setErrors({ server: 'Something went wrong. Please try again, or message us on WhatsApp.' });
    } finally {
      setBusy(false);
    }
  }

  const payLink = check.paymentLinks[amount];

  return (
    <>
      <section className="hero check-hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <p className="overline">For homebuyers · Wakad and Hinjewadi</p>
              <h1>Talk to an owner <em>before</em> you buy.</h1>
              <p className="hero-body">The brochure won&apos;t tell you about leaks, late possession or how the builder treats owners after the sale. Someone who already bought in that tower will. Book a {check.callMinutes}-minute call with a verified owner, or get written answers from {check.minOwners} of them.</p>
              <p className="hero-note"><ShieldCheck size={18} /> Every owner is verified with their sale papers or a maintenance bill in their name. No brokers, no builders, no paid reviews.</p>
            </div>

            <div className="panel check-panel" id="search">
              {step === 'search' && (
                <form className="form" onSubmit={search} noValidate>
                  <div>
                    <h2 className="check-panel-title">Which building are you thinking of buying in?</h2>
                    <p className="muted check-panel-sub">A tower, society or township in Wakad or Hinjewadi.</p>
                  </div>
                  <div className={`gm-field ${errors.building ? 'gm-field-error' : ''}`}>
                    <label className="gm-label" htmlFor="building">Building or project name</label>
                    <div className="gm-input-wrap"><span className="gm-input-prefix"><Search size={16} /></span><input id="building" className="gm-input" list="covered" autoComplete="off" placeholder="Name on the gate or brochure" value={building} onChange={e => setBuilding(e.target.value.slice(0, 120))} aria-invalid={!!errors.building} /></div>
                    <datalist id="covered">{coveredBuildings.map(b => <option key={b} value={b} />)}</datalist>
                    {errors.building && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.building}</p>}
                  </div>
                  <fieldset className="gm-field plain-fieldset">
                    <legend className="gm-label">Area</legend>
                    <div className="gm-chips">
                      {check.areas.map(a => <button key={a} type="button" className="gm-chip" aria-pressed={area === a} onClick={() => setArea(a)}>{a}</button>)}
                    </div>
                    {errors.area && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.area}</p>}
                  </fieldset>
                  <button type="submit" className="gm-btn gm-btn-primary gm-btn-block check-cta">Find an owner <ArrowRight size={18} /></button>
                </form>
              )}

              {step === 'details' && (
                <form className="form" onSubmit={request} noValidate>
                  <div className="check-building">
                    <Building2 size={22} />
                    <div>
                      <strong>{building.trim()}</strong>
                      <span className="muted">{area}, Pune</span>
                    </div>
                    <button type="button" className="gm-btn gm-btn-ghost check-change" onClick={() => setStep('search')}>Change</button>
                  </div>
                  {covered
                    ? <div className="notice ok"><BadgeCheck size={16} /> Verified owners ready here.</div>
                    : <div className="notice">We don&apos;t have owners here yet. We&apos;ll find {isCall ? 'one who agrees to talk' : `at least ${check.minOwners}`} and message you within 48 hours. You pay only once they&apos;re confirmed.</div>}

                  <fieldset className="gm-field plain-fieldset">
                    <legend className="gm-label">What would help most?</legend>
                    <div className="check-options">
                      <button type="button" className="check-option" aria-pressed={product === 'call'} onClick={() => setProduct('call')}>
                        <Phone size={18} /><span><strong>Talk to an owner · {inr(check.callPrice)}</strong><small>{check.callMinutes}-minute call with someone who bought here</small></span>
                      </button>
                      <button type="button" className="check-option" aria-pressed={product === 'report'} onClick={() => setProduct('report')}>
                        <BadgeCheck size={18} /><span><strong>Written answers · {inr(price)}</strong><small>{questions.length} questions answered by {check.minOwners}+ owners</small></span>
                      </button>
                    </div>
                  </fieldset>
                  <fieldset className="gm-field plain-fieldset">
                    <legend className="gm-label">Who will live there?</legend>
                    <div className="gm-chips">
                      {households.map(h => <button key={h.id} type="button" className="gm-chip" aria-pressed={household === h.id} onClick={() => setHousehold(h.id)}>{h.label}</button>)}
                    </div>
                    {errors.household ? <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.household}</p> : <p className="gm-hint">You hear from owners like you: bachelors from bachelors, families from families.</p>}
                  </fieldset>
                  <fieldset className="gm-field plain-fieldset">
                    <legend className="gm-label">Deciding</legend>
                    <div className="gm-chips">
                      {DECIDING.map(m => <button key={m.id} type="button" className="gm-chip" aria-pressed={deciding === m.id} onClick={() => setDeciding(m.id)}>{m.label}</button>)}
                    </div>
                    {errors.deciding && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.deciding}</p>}
                  </fieldset>
                  <div className={`gm-field ${errors.name ? 'gm-field-error' : ''}`}>
                    <label className="gm-label" htmlFor="c-name">Your name</label>
                    <div className="gm-input-wrap"><input id="c-name" className="gm-input" autoComplete="name" value={name} onChange={e => setName(e.target.value.slice(0, 120))} /></div>
                    {errors.name && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.name}</p>}
                  </div>
                  <div className={`gm-field ${errors.phone ? 'gm-field-error' : ''}`}>
                    <label className="gm-label" htmlFor="c-phone">WhatsApp number</label>
                    <div className="gm-input-wrap"><span className="gm-input-prefix">+91</span><input id="c-phone" className="gm-input" inputMode="numeric" autoComplete="tel-national" value={phone} onChange={e => setPhone(e.target.value.replace(/[^\d\s]/g, '').slice(0, 12))} /></div>
                    {errors.phone ? <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.phone}</p> : <p className="gm-hint">{isCall ? 'We book the call here.' : 'The answers come here.'} Owners never see your number.</p>}
                  </div>
                  <div>
                    <label className="check"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> <span>{isCall ? 'Send updates about my call' : 'Send the answers and updates about them'} on WhatsApp. <Link href="/privacy">Privacy</Link></span></label>
                    {errors.consent && <p className="gm-error" style={{ marginTop: 8 }}><AlertCircle className="gm-icon" /> {errors.consent}</p>}
                  </div>
                  {errors.server && <div className="notice err" role="alert">{errors.server}</div>}
                  <button type="submit" className="gm-btn gm-btn-primary gm-btn-block check-cta" disabled={busy}>{busy ? '…' : <>{isCall ? 'Request my call' : 'Request the answers'} · {inr(amount)} <ArrowRight size={18} /></>}</button>
                </form>
              )}

              {step === 'pay' && (
                <div className="stack">
                  <p className="overline">Request {ref}</p>
                  <h2 className="check-panel-title">{covered ? (isCall ? 'Pay to book your call' : 'Pay to get the answers') : 'We’re finding owners'}</h2>
                  <p className="muted">{isCall
                    ? (covered
                      ? `Pay ${inr(amount)} and we’ll set up a ${check.callMinutes}-minute call with a verified owner of ${building.trim()} at a time that suits you both. We connect the call, so neither of you sees the other’s number.`
                      : `We’ll message +91 ${digits} within 48 hours once a verified owner of ${building.trim()} agrees to talk. You pay only then. We connect the call, so neither of you sees the other’s number.`)
                    : (covered
                      ? `Pay ${inr(amount)} and the owners’ answers for ${building.trim()} reach your WhatsApp within ${check.hours} hours.`
                      : `We’ll message +91 ${digits} within 48 hours once ${check.minOwners} owners in ${building.trim()} are confirmed. You pay only then.`)}</p>
                  {covered && (payLink
                    ? <a className="gm-btn gm-btn-primary gm-btn-block check-cta" href={payLink} target="_blank" rel="noopener">Pay {inr(amount)}</a>
                    : <a className="gm-btn gm-btn-whatsapp gm-btn-block" href={waLink(`Hi Gharmalak Check, request ${ref} for ${building.trim()}. Please send me the ${inr(amount)} payment link.`)} target="_blank" rel="noopener"><MessageCircle size={18} /> Get the payment link on WhatsApp</a>)}
                  <a className="gm-btn gm-btn-secondary gm-btn-block" href={waLink(`Hi Gharmalak Check, this is about request ${ref} (${building.trim()}).`)} target="_blank" rel="noopener"><MessageCircle size={18} /> Message us on WhatsApp</a>
                </div>
              )}
            </div>
          </div>

          <div className="stats" role="list">
            <div className="stat" role="listitem"><span className="amount">{check.callMinutes} min</span><span>call with a verified owner</span></div>
            <div className="stat" role="listitem"><span className="amount">0</span><span>numbers shared</span></div>
            <div className="stat" role="listitem"><span className="amount">{inr(check.callPrice)}</span><span>refunded if the owner doesn&apos;t join</span></div>
          </div>
        </div>
      </section>

      <section className="section" id="how" data-theme="light">
        <div className="wrap">
          <div className="section-head">
            <p className="overline">How it works</p>
            <h2>Three steps, before you pay the booking amount.</h2>
          </div>
          <div className="how-grid check-how">
            <article className="how-card"><span className="how-num">01</span><h3>Name the building</h3><p>Tell us the tower or township. If we don&apos;t have an owner there yet, we find one for you.</p></article>
            <article className="how-card"><span className="how-num">02</span><h3>Pick a time</h3><p>A verified owner who lives like you do agrees to a slot. You pay only once they&apos;ve said yes.</p></article>
            <article className="how-card"><span className="how-num">03</span><h3>Ask anything</h3><p>{check.callMinutes} minutes, connected by Gharmalak. Neither of you sees the other&apos;s number.</p></article>
          </div>
        </div>
      </section>

      <section className="section" id="sample">
        <div className="wrap check-sample-grid">
          <div className="section-head">
            <p className="overline">Prefer it in writing?</p>
            <h2>Written answers from {check.minOwners} owners</h2>
            <p>{questions.length} questions answered by at least {check.minOwners} verified owners, with a one-line summary on top, on WhatsApp within {check.hours} hours. Owners are never named.</p>
            <ul className="list-ticks check-topics">
              {questions.map(q => <li key={q.id}><BadgeCheck size={18} /> {q.topic}</li>)}
            </ul>
          </div>
          <article className="check-report" aria-label="Sample answers">
            <div className="check-report-head">
              <div>
                <span className="gm-badge gm-badge-neutral">Example</span>
                <h3>Sample Heights, Wakad</h3>
                <p className="muted">4 verified owners</p>
              </div>
              <div className="check-score"><Star size={18} /> <span className="amount">3.9</span><small>/ 5</small></div>
            </div>
            <p className="check-summary"><strong>In short:</strong> solid building and easy papers, but possession was 5 months late and the builder is slow on repairs.</p>
            <dl className="check-answers">
              {SAMPLE.map(s => (
                <div key={s.topic}>
                  <dt>{s.topic}</dt>
                  <dd>{s.text}<span className="muted check-who"><UserCheck size={14} /> {s.who}</span></dd>
                </div>
              ))}
            </dl>
            <p className="muted check-more">+ 6 more topics in the full answers</p>
          </article>
        </div>
      </section>

      <section className="section" data-theme="light">
        <div className="wrap">
          <div className="section-head"><p className="overline">Why you can trust it</p><h2>Real owners, checked one by one.</h2></div>
          <div className="why-grid">
            <article className="why"><span className="why-icon"><ShieldCheck size={22} /></span><h3>Verified owners</h3><p>Each owner shows their sale agreement, Index II or a maintenance bill in their name for that building.</p></article>
            <article className="why"><span className="why-icon"><Users size={22} /></span><h3>Only people who bought</h3><p>No brokers, no sales staff, no tenants guessing. Just owners who put their own money in.</p></article>
            <article className="why"><span className="why-icon"><BadgeCheck size={22} /></span><h3>Nobody pays to look good</h3><p>Builders and brokers can&apos;t pay to join a call or change an answer, ever.</p></article>
            <article className="why"><span className="why-icon"><UserCheck size={22} /></span><h3>People like you</h3><p>A bachelor talks to a bachelor, a family to a family, so the answers fit your life.</p></article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head"><p className="overline">Questions</p><h2>Before you ask</h2></div>
          <div className="faq">
            {[
              ['What if you don’t have an owner in my building?', `Request it anyway. We find a verified owner who agrees to talk and message you within 48 hours. You pay only when they’re confirmed.`],
              ['Who are the owners?', 'People who bought a flat in that building. We check their sale agreement, Index II or a maintenance bill in their name before they can answer or take a call, and they are paid a small fee for their time.'],
              ['Why does it ask if I’m a bachelor, couple or family?', 'Because the same building can be great for one and hard for another. We match you with an owner who lives there the way you will, so you hear about what matters to you.'],
              ['Will the owner see my number?', 'No. We connect the call and send written answers through Gharmalak. Neither side sees the other’s number.'],
              ['What if the owner doesn’t join the call?', `You get your ${inr(check.callPrice)} back, or we book another owner, whichever you prefer.`],
              ['Is this a broker service?', 'No. We don’t sell flats or take brokerage. We only connect you with people who already own there.'],
            ].map(([q, a]) => (
              <details key={q}><summary>{q} <ChevronDown size={20} /></summary><p>{a}</p></details>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-band">
        <div className="wrap">
          <h2>Buying soon? Talk to an owner first.</h2>
          <div className="hero-ctas">
            <a href="#search" className="gm-btn gm-btn-primary">Find an owner <ArrowRight size={18} /></a>
            <Link href="/check/answer" className="gm-btn gm-btn-secondary">I own a flat in Wakad or Hinjewadi</Link>
          </div>
        </div>
      </section>
    </>
  );
}
