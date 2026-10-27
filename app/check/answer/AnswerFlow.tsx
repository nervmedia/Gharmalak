'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, BadgeCheck, IndianRupee, MessageCircle, Phone, ShieldCheck, Star, Users } from 'lucide-react';
import { check, questions } from '@/lib/check';
import { inr, waLink } from '@/lib/config';

type Role = '' | 'owner' | 'tenant';
type Years = '' | 'under-1' | '1-3' | '3-plus';
const YEARS: { id: Years; label: string }[] = [
  { id: 'under-1', label: 'Under 1 year' },
  { id: '1-3', label: '1 to 3 years' },
  { id: '3-plus', label: 'Over 3 years' },
];

export function AnswerFlow() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [building, setBuilding] = useState('');
  const [area, setArea] = useState('');
  const [role, setRole] = useState<Role>('');
  const [years, setYears] = useState<Years>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [rating, setRating] = useState(0);
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [calls, setCalls] = useState(true);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState('');
  const digits = phone.replace(/\D/g, '').slice(-10);
  const filled = questions.filter(q => (answers[q.id] || '').trim().length >= 2).length;

  function next(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (name.trim().length < 2) err.name = 'Please enter your name.';
    if (!/^[6-9]\d{9}$/.test(digits)) err.phone = 'Enter a 10-digit WhatsApp number.';
    if (building.trim().length < 2) err.building = 'Type your society or building name.';
    if (!area) err.area = 'Pick the area.';
    if (!role) err.role = 'Do you own or rent?';
    if (!years) err.years = 'How long have you lived there?';
    setErrors(err);
    if (Object.keys(err).length) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (filled < 8) err.answers = `Please answer at least 8 of the ${questions.length} questions. A line or two is enough.`;
    if (!rating) err.rating = 'Pick a rating from 1 to 5.';
    if (recommend === null) err.recommend = 'Would you recommend it?';
    if (!consent) err.consent = 'Please agree so we can share your answers without your name.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    try {
      const res = await fetch('/api/check/answer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: digits, building: building.trim(), area, role, years, answers, rating, recommend, calls, consent }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const d = await res.json();
      setRef(d.id);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrors({ server: 'Something went wrong. Please try again, or message us on WhatsApp.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flow answer-flow">
      <div className="progress-steps" aria-hidden="true">
        <span className="on" /><span className={step >= 2 ? 'on' : ''} /><span className={step >= 3 ? 'on' : ''} />
      </div>

      {step === 1 && (
        <>
          <p className="overline">For residents of Wakad and Hinjewadi</p>
          <h1>Get paid to help the next family moving in.</h1>
          <p className="flow-lead">Answer {questions.length} short questions about your building. Once we check you live there, we pay you {inr(check.payoutAnswers)} by UPI, and {inr(check.payoutCall)} for each {check.callMinutes}-minute call a renter or buyer books with you.</p>
          <ul className="answer-points">
            <li><IndianRupee size={18} /> {inr(check.payoutAnswers)} for your answers, paid by UPI</li>
            <li><Phone size={18} /> {inr(check.payoutCall)} per call if you choose to take calls</li>
            <li><ShieldCheck size={18} /> Your name and flat number are never shown</li>
            <li><Users size={18} /> Owners and tenants both welcome</li>
          </ul>
          <form className="panel form" onSubmit={next} noValidate>
            <div className={`gm-field ${errors.name ? 'gm-field-error' : ''}`}>
              <label className="gm-label" htmlFor="a-name">Your name</label>
              <div className="gm-input-wrap"><input id="a-name" className="gm-input" autoComplete="name" value={name} onChange={e => setName(e.target.value.slice(0, 120))} /></div>
              {errors.name && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.name}</p>}
            </div>
            <div className={`gm-field ${errors.phone ? 'gm-field-error' : ''}`}>
              <label className="gm-label" htmlFor="a-phone">WhatsApp number</label>
              <div className="gm-input-wrap"><span className="gm-input-prefix">+91</span><input id="a-phone" className="gm-input" inputMode="numeric" autoComplete="tel-national" value={phone} onChange={e => setPhone(e.target.value.replace(/[^\d\s]/g, '').slice(0, 12))} /></div>
              {errors.phone ? <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.phone}</p> : <p className="gm-hint">We pay you and verify you on this number. Renters never see it.</p>}
            </div>
            <div className={`gm-field ${errors.building ? 'gm-field-error' : ''}`}>
              <label className="gm-label" htmlFor="a-building">Society or building name</label>
              <div className="gm-input-wrap"><input id="a-building" className="gm-input" autoComplete="off" value={building} onChange={e => setBuilding(e.target.value.slice(0, 120))} /></div>
              {errors.building && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.building}</p>}
            </div>
            <fieldset className="gm-field plain-fieldset">
              <legend className="gm-label">Area</legend>
              <div className="gm-chips">{check.areas.map(a => <button key={a} type="button" className="gm-chip" aria-pressed={area === a} onClick={() => setArea(a)}>{a}</button>)}</div>
              {errors.area && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.area}</p>}
            </fieldset>
            <fieldset className="gm-field plain-fieldset">
              <legend className="gm-label">You</legend>
              <div className="gm-chips">
                <button type="button" className="gm-chip" aria-pressed={role === 'tenant'} onClick={() => setRole('tenant')}>Rent here</button>
                <button type="button" className="gm-chip" aria-pressed={role === 'owner'} onClick={() => setRole('owner')}>Own and live here</button>
              </div>
              {errors.role && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.role}</p>}
            </fieldset>
            <fieldset className="gm-field plain-fieldset">
              <legend className="gm-label">Lived here for</legend>
              <div className="gm-chips">{YEARS.map(y => <button key={y.id} type="button" className="gm-chip" aria-pressed={years === y.id} onClick={() => setYears(y.id)}>{y.label}</button>)}</div>
              {errors.years && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.years}</p>}
            </fieldset>
            <button type="submit" className="gm-btn gm-btn-primary gm-btn-block check-cta">Next: the {questions.length} questions <ArrowRight size={18} /></button>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <p className="overline">{building.trim()} · {area}</p>
          <h1>Tell it like it is.</h1>
          <p className="flow-lead">A line or two for each is plenty. Describe the building, not people: no names, phone or flat numbers.</p>
          <form className="panel form" onSubmit={submit} noValidate>
            {questions.map((q, i) => (
              <div className="gm-field" key={q.id}>
                <label className="gm-label" htmlFor={`q-${q.id}`}><span className="answer-num">{String(i + 1).padStart(2, '0')}</span> {q.topic}</label>
                <p className="gm-hint answer-q">{q.q}</p>
                <div className="gm-input-wrap"><textarea id={`q-${q.id}`} className="gm-input answer-text" rows={2} maxLength={600} value={answers[q.id] || ''} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} /></div>
              </div>
            ))}
            {errors.answers && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.answers}</p>}

            <fieldset className="gm-field plain-fieldset">
              <legend className="gm-label">Overall, out of 5</legend>
              <div className="gm-chips">
                {[1, 2, 3, 4, 5].map(n => <button key={n} type="button" className="gm-chip" aria-pressed={rating === n} aria-label={`${n} out of 5`} onClick={() => setRating(n)}><Star size={16} /> {n}</button>)}
              </div>
              {errors.rating && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.rating}</p>}
            </fieldset>
            <fieldset className="gm-field plain-fieldset">
              <legend className="gm-label">Would you recommend living here?</legend>
              <div className="gm-chips">
                <button type="button" className="gm-chip" aria-pressed={recommend === true} onClick={() => setRecommend(true)}>Yes</button>
                <button type="button" className="gm-chip" aria-pressed={recommend === false} onClick={() => setRecommend(false)}>No</button>
              </div>
              {errors.recommend && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.recommend}</p>}
            </fieldset>
            <div className="notice answer-calls">
              <label className="check"><input type="checkbox" checked={calls} onChange={e => setCalls(e.target.checked)} /> <span><strong>Take paid calls.</strong> {role === 'owner' ? 'People thinking of buying here' : 'People thinking of renting here'} can book a {check.callMinutes}-minute call with you. You get {inr(check.payoutCall)} per call, we connect it so your number stays private, and you can say no to any time slot.</span></label>
            </div>
            <div>
              <label className="check"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> <span>Gharmalak may share my answers with renters and buyers without my name. <Link href="/privacy">Privacy</Link></span></label>
              {errors.consent && <p className="gm-error" style={{ marginTop: 8 }}><AlertCircle className="gm-icon" /> {errors.consent}</p>}
            </div>
            {errors.server && <div className="notice err" role="alert">{errors.server}</div>}
            <div className="answer-actions">
              <button type="button" className="gm-btn gm-btn-ghost" onClick={() => setStep(1)}>Back</button>
              <button type="submit" className="gm-btn gm-btn-primary check-cta" disabled={busy}>{busy ? '…' : <>Send my answers <ArrowRight size={18} /></>}</button>
            </div>
          </form>
        </>
      )}

      {step === 3 && (
        <>
          <p className="overline">Answers received · {ref}</p>
          <h1>Thank you. One last step.</h1>
          <p className="flow-lead">Send us a photo of {role === 'owner' ? 'the first page of your sale agreement or Index II, or a maintenance bill in your name,' : 'your rent agreement, or a recent electricity bill or maintenance receipt,'} for {building.trim()} on WhatsApp. We only check the name and address, and delete it within 30 days.</p>
          <div className="panel stack">
            <div className="notice ok"><BadgeCheck size={16} /> Once you&apos;re verified, we pay {inr(check.payoutAnswers)} to your UPI.</div>
            <a className="gm-btn gm-btn-whatsapp gm-btn-block" href={waLink(`Hi Gharmalak Check, I sent answers for ${building.trim()} (${ref}). Here is my proof of residence:`)} target="_blank" rel="noopener"><MessageCircle size={18} /> Send proof on WhatsApp</a>
            <p className="gm-hint">Neighbours in the same building can answer too. Each verified resident is paid.</p>
          </div>
        </>
      )}
    </div>
  );
}
