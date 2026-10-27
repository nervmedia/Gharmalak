'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, BadgeCheck, Building2, ChevronDown, Clock, MessageCircle, Phone, Search, ShieldCheck, Star, UserCheck, Users } from 'lucide-react';
import { buyerTopics, check, coveredBuildings, questions } from '@/lib/check';
import { inr, waLink } from '@/lib/config';

type Purpose = '' | 'rent' | 'buy';
type Product = 'report' | 'call';
type MoveIn = '' | 'this-month' | 'next-month' | 'later';
type Step = 'search' | 'details' | 'pay';

const MOVE_IN: { id: MoveIn; label: string }[] = [
  { id: 'this-month', label: 'This month' },
  { id: 'next-month', label: 'Next month' },
  { id: 'later', label: 'Later' },
];

const SAMPLE: { topic: string; text: string }[] = [
  { topic: 'Water', text: 'Corporation water most of the year. In April and May the society buys tankers 2 or 3 times a week.' },
  { topic: 'Power', text: 'Short cuts once or twice a week. Lifts and common lights are on backup; flats are not.' },
  { topic: 'Rules for tenants', text: 'Bachelors allowed in B and C wings only. Pets allowed. Tenants register with the office in the first week.' },
  { topic: 'Deposit', text: 'Three months is normal here. Most owners return it within a month, but two of us waited longer.' },
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
  const [purpose, setPurpose] = useState<Purpose>('');
  const [product, setProduct] = useState<Product>('report');
  const [moveIn, setMoveIn] = useState<MoveIn>('');
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
    if (p.get('for') === 'buy') { setPurpose('buy'); setProduct('call'); }
  }, []);

  function choosePurpose(v: 'rent' | 'buy') {
    setPurpose(v);
    setProduct(v === 'buy' ? 'call' : 'report');
  }

  const covered = coveredBuildings.some(b => b.toLowerCase() === building.trim().toLowerCase());
  const digits = phone.replace(/\D/g, '').slice(-10);
  const isCall = purpose === 'buy' && product === 'call';
  const amount = isCall ? check.callPrice : price;

  function search(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (building.trim().length < 2) err.building = 'Type the society or building name.';
    if (!area) err.area = 'Pick the area.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setStep('details');
  }

  async function request(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!purpose) err.purpose = 'Are you renting or buying?';
    if (!moveIn) err.moveIn = 'When are you moving?';
    if (name.trim().length < 2) err.name = 'Please enter your name.';
    if (!/^[6-9]\d{9}$/.test(digits)) err.phone = 'Enter a 10-digit WhatsApp number.';
    if (!consent) err.consent = 'Please agree so we can send the report on WhatsApp.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    try {
      const res = await fetch('/api/check/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ building: building.trim(), area, purpose, product: isCall ? 'call' : 'report', moveIn, name: name.trim(), phone: digits, consent, price, source }),
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
              <p className="overline">For renters and buyers · Wakad and Hinjewadi</p>
              <h1>Know the building <em>before</em> you pay the deposit.</h1>
              <p className="hero-body">Ask people who actually live there about water, power, rules, the society office and how deposits really get returned. Answers from at least {check.minResidents} verified residents, on WhatsApp, within {check.hours} hours.</p>
              <p className="hero-note"><ShieldCheck size={18} /> Every resident is verified with a bill or rent agreement. No brokers, no builders, no paid reviews.</p>
            </div>

            <div className="panel check-panel" id="search">
              {step === 'search' && (
                <form className="form" onSubmit={search} noValidate>
                  <div>
                    <h2 className="check-panel-title">Which building are you looking at?</h2>
                    <p className="muted check-panel-sub">One building, one report. {inr(price)}, paid once.</p>
                  </div>
                  <div className={`gm-field ${errors.building ? 'gm-field-error' : ''}`}>
                    <label className="gm-label" htmlFor="building">Society or building name</label>
                    <div className="gm-input-wrap"><span className="gm-input-prefix"><Search size={16} /></span><input id="building" className="gm-input" list="covered" autoComplete="off" placeholder="Name on the society gate" value={building} onChange={e => setBuilding(e.target.value.slice(0, 120))} aria-invalid={!!errors.building} /></div>
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
                  <button type="submit" className="gm-btn gm-btn-primary gm-btn-block check-cta">Check this building <ArrowRight size={18} /></button>
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
                    ? <div className="notice ok"><BadgeCheck size={16} /> Verified residents ready. Your report arrives within {check.hours} hours.</div>
                    : <div className="notice">{isCall
                      ? <>We&apos;ll find a verified owner here and message you within 48 hours to book the call. You pay only once an owner is confirmed.</>
                      : <>We don&apos;t have residents here yet. We&apos;ll find at least {check.minResidents} and message you within 48 hours. You pay only once they&apos;re confirmed.</>}</div>}

                  <fieldset className="gm-field plain-fieldset">
                    <legend className="gm-label">You are</legend>
                    <div className="gm-chips">
                      <button type="button" className="gm-chip" aria-pressed={purpose === 'rent'} onClick={() => choosePurpose('rent')}>Renting</button>
                      <button type="button" className="gm-chip" aria-pressed={purpose === 'buy'} onClick={() => choosePurpose('buy')}>Buying</button>
                    </div>
                    {errors.purpose && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.purpose}</p>}
                  </fieldset>
                  {purpose === 'buy' && (
                    <fieldset className="gm-field plain-fieldset">
                      <legend className="gm-label">What would help most?</legend>
                      <div className="check-options">
                        <button type="button" className="check-option" aria-pressed={product === 'call'} onClick={() => setProduct('call')}>
                          <Phone size={18} /><span><strong>Talk to an owner · {inr(check.callPrice)}</strong><small>{check.callMinutes}-minute call with someone who bought here</small></span>
                        </button>
                        <button type="button" className="check-option" aria-pressed={product === 'report'} onClick={() => setProduct('report')}>
                          <BadgeCheck size={18} /><span><strong>Written report · {inr(price)}</strong><small>{questions.length} answers from {check.minResidents}+ residents</small></span>
                        </button>
                      </div>
                    </fieldset>
                  )}
                  <fieldset className="gm-field plain-fieldset">
                    <legend className="gm-label">{purpose === 'buy' ? 'Deciding' : 'Moving in'}</legend>
                    <div className="gm-chips">
                      {MOVE_IN.map(m => <button key={m.id} type="button" className="gm-chip" aria-pressed={moveIn === m.id} onClick={() => setMoveIn(m.id)}>{m.label}</button>)}
                    </div>
                    {errors.moveIn && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.moveIn}</p>}
                  </fieldset>
                  <div className={`gm-field ${errors.name ? 'gm-field-error' : ''}`}>
                    <label className="gm-label" htmlFor="c-name">Your name</label>
                    <div className="gm-input-wrap"><input id="c-name" className="gm-input" autoComplete="name" value={name} onChange={e => setName(e.target.value.slice(0, 120))} /></div>
                    {errors.name && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.name}</p>}
                  </div>
                  <div className={`gm-field ${errors.phone ? 'gm-field-error' : ''}`}>
                    <label className="gm-label" htmlFor="c-phone">WhatsApp number</label>
                    <div className="gm-input-wrap"><span className="gm-input-prefix">+91</span><input id="c-phone" className="gm-input" inputMode="numeric" autoComplete="tel-national" value={phone} onChange={e => setPhone(e.target.value.replace(/[^\d\s]/g, '').slice(0, 12))} /></div>
                    {errors.phone ? <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.phone}</p> : <p className="gm-hint">{isCall ? 'We book the call here.' : 'The report comes here.'} We don&apos;t share your number with residents.</p>}
                  </div>
                  <div>
                    <label className="check"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> <span>{isCall ? 'Send updates about my call' : 'Send my report and updates about it'} on WhatsApp. <Link href="/privacy">Privacy</Link></span></label>
                    {errors.consent && <p className="gm-error" style={{ marginTop: 8 }}><AlertCircle className="gm-icon" /> {errors.consent}</p>}
                  </div>
                  {errors.server && <div className="notice err" role="alert">{errors.server}</div>}
                  <button type="submit" className="gm-btn gm-btn-primary gm-btn-block check-cta" disabled={busy}>{busy ? '…' : <>{isCall ? 'Request my call' : 'Request my report'} · {inr(amount)} <ArrowRight size={18} /></>}</button>
                </form>
              )}

              {step === 'pay' && (
                <div className="stack">
                  <p className="overline">Request {ref}</p>
                  <h2 className="check-panel-title">{isCall ? (covered ? 'Pay to book your call' : 'We’re finding an owner') : (covered ? 'Pay to get your report' : 'We’re finding residents')}</h2>
                  <p className="muted">{isCall
                    ? (covered
                      ? `Pay ${inr(amount)} and we’ll set up a ${check.callMinutes}-minute call with a verified owner of ${building.trim()} at a time that suits you both. We connect the call, so neither of you sees the other’s number.`
                      : `We’ll message +91 ${digits} within 48 hours once a verified owner of ${building.trim()} agrees to talk. You pay only then. We connect the call, so neither of you sees the other’s number.`)
                    : (covered
                      ? `Pay ${inr(amount)} and the answers for ${building.trim()} reach your WhatsApp within ${check.hours} hours.`
                      : `We’ll message +91 ${digits} within 48 hours once ${check.minResidents} residents of ${building.trim()} are confirmed. You pay only then.`)}</p>
                  {covered && (payLink
                    ? <a className="gm-btn gm-btn-primary gm-btn-block check-cta" href={payLink} target="_blank" rel="noopener">Pay {inr(amount)}</a>
                    : <a className="gm-btn gm-btn-whatsapp gm-btn-block" href={waLink(`Hi Gharmalak Check, request ${ref} for ${building.trim()}. Please send me the ${inr(amount)} payment link.`)} target="_blank" rel="noopener"><MessageCircle size={18} /> Get the payment link on WhatsApp</a>)}
                  <a className="gm-btn gm-btn-secondary gm-btn-block" href={waLink(`Hi Gharmalak Check, this is about request ${ref} (${building.trim()}).`)} target="_blank" rel="noopener"><MessageCircle size={18} /> Message us on WhatsApp</a>
                </div>
              )}
            </div>
          </div>

          <div className="stats" role="list">
            <div className="stat" role="listitem"><span className="amount">{check.minResidents}+</span><span>verified residents</span></div>
            <div className="stat" role="listitem"><span className="amount">{check.hours} h</span><span>to your WhatsApp</span></div>
            <div className="stat" role="listitem"><span className="amount">{inr(price)}</span><span>one building, paid once</span></div>
          </div>
        </div>
      </section>

      <section className="section" id="how" data-theme="light">
        <div className="wrap">
          <div className="section-head">
            <p className="overline">How it works</p>
            <h2>Three steps, before any money changes hands.</h2>
          </div>
          <div className="how-grid check-how">
            <article className="how-card"><span className="how-num">01</span><h3>Search the building</h3><p>Type the society name. If we don&apos;t cover it yet, we find residents for you.</p></article>
            <article className="how-card"><span className="how-num">02</span><h3>Pay {inr(price)}</h3><p>Once, for one building. If we can&apos;t find {check.minResidents} residents, you don&apos;t pay.</p></article>
            <article className="how-card"><span className="how-num">03</span><h3>Get honest answers</h3><p>{questions.length} questions answered by at least {check.minResidents} verified residents, with a short summary on top, on WhatsApp.</p></article>
          </div>
        </div>
      </section>

      <section className="section" id="buyers">
        <div className="wrap check-sample-grid">
          <div className="section-head">
            <p className="overline">Buying in a tower or township?</p>
            <h2>Talk to someone who already bought there.</h2>
            <p>The brochure won&apos;t tell you about leaks, late possession or how the builder treats owners after the sale. An owner will. Book a {check.callMinutes}-minute call with a verified owner of that building for {inr(check.callPrice)}.</p>
            <div className="hero-ctas">
              <a href="/check?for=buy#search" className="gm-btn gm-btn-primary"><Phone size={18} /> Book an owner call</a>
            </div>
          </div>
          <article className="check-report" aria-label="What buyers ask owners">
            <div className="check-report-head">
              <div>
                <span className="gm-badge gm-badge-neutral">On the call</span>
                <h3>What buyers usually ask</h3>
                <p className="muted">Owners are verified with their sale papers or a maintenance bill in their name.</p>
              </div>
            </div>
            <ul className="list-ticks">
              {buyerTopics.map(t => <li key={t}><BadgeCheck size={18} /> {t}</li>)}
            </ul>
            <p className="muted check-more">We connect the call, so numbers stay private. If the owner doesn&apos;t join, you get your money back.</p>
          </article>
        </div>
      </section>

      <section className="section" id="sample" data-theme="light">
        <div className="wrap check-sample-grid">
          <div className="section-head">
            <p className="overline">Sample report</p>
            <h2>What you get</h2>
            <p>A one-line summary, then each resident&apos;s own answers to {questions.length} questions. Residents are never named.</p>
            <ul className="list-ticks check-topics">
              {questions.map(q => <li key={q.id}><BadgeCheck size={18} /> {q.topic}</li>)}
            </ul>
          </div>
          <article className="check-report" aria-label="Sample report">
            <div className="check-report-head">
              <div>
                <span className="gm-badge gm-badge-neutral">Example</span>
                <h3>Sample Residency, Wakad</h3>
                <p className="muted">4 verified residents · 3 tenants, 1 owner</p>
              </div>
              <div className="check-score"><Star size={18} /> <span className="amount">3.8</span><small>/ 5</small></div>
            </div>
            <p className="check-summary"><strong>In short:</strong> good security and parking, water tight in summer, deposits usually returned within a month.</p>
            <dl className="check-answers">
              {SAMPLE.map(s => (
                <div key={s.topic}>
                  <dt>{s.topic}</dt>
                  <dd>{s.text}<span className="muted check-who"><UserCheck size={14} /> Tenant, 2 years</span></dd>
                </div>
              ))}
            </dl>
            <p className="muted check-more">+ 6 more topics in the full report</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head"><p className="overline">Why you can trust it</p><h2>Real residents, checked one by one.</h2></div>
          <div className="why-grid">
            <article className="why"><span className="why-icon"><ShieldCheck size={22} /></span><h3>Verified</h3><p>Each resident shows an electricity bill, maintenance receipt or rent agreement for that building.</p></article>
            <article className="why"><span className="why-icon"><Users size={22} /></span><h3>Tenants and owners</h3><p>Tenants often know the most about living there, so we ask both.</p></article>
            <article className="why"><span className="why-icon"><BadgeCheck size={22} /></span><h3>Nobody pays to look good</h3><p>Brokers, builders and owners can&apos;t pay to change a report, ever.</p></article>
            <article className="why"><span className="why-icon"><Clock size={22} /></span><h3>Fast</h3><p>Within {check.hours} hours for covered buildings, so you can decide before the deposit is due.</p></article>
          </div>
        </div>
      </section>

      <section className="section" data-theme="light">
        <div className="wrap">
          <div className="section-head"><p className="overline">Questions</p><h2>Before you ask</h2></div>
          <div className="faq">
            {[
              ['What if you don’t cover my building?', `Request it anyway. We find at least ${check.minResidents} residents and message you within 48 hours. You pay only when they’re confirmed.`],
              ['Who are the residents?', 'People who live in that building now, owners and tenants. We check a bill or rent agreement before their answers count, and they are paid a small fee for their time.'],
              ['Will residents see my number?', 'No. All answers come through Gharmalak. Residents never see who asked.'],
              ['Can I talk to someone who lives there?', `Yes. Buyers can book a ${check.callMinutes}-minute call with a verified owner for ${inr(check.callPrice)}, and renters can add a call after their report. We connect the call, so numbers stay private.`],
              ['Is this a broker service?', 'No. We don’t list flats or take brokerage. We only tell you what living there is really like.'],
            ].map(([q, a]) => (
              <details key={q}><summary>{q} <ChevronDown size={20} /></summary><p>{a}</p></details>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-band">
        <div className="wrap">
          <h2>Moving soon? Check the building first.</h2>
          <div className="hero-ctas">
            <a href="#search" className="gm-btn gm-btn-primary">Search a building <ArrowRight size={18} /></a>
            <Link href="/check/answer" className="gm-btn gm-btn-secondary">I live in Wakad or Hinjewadi</Link>
          </div>
        </div>
      </section>
    </>
  );
}
