'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, ChevronDown, MessageCircle, ShieldCheck } from 'lucide-react';
import { useLang } from '@/components/LangProvider';
import { MalakCard } from '@/components/MalakCard';
import { areas, site, waLink } from '@/lib/config';

type Form = { name: string; phone: string; area: string; home: '' | 'house' | 'flat'; interests: string[]; consent: boolean };
const INTERESTS = ['solar', 'painting', 'waterproofing', 'other'] as const;

export function JoinFlow() {
  const { t, lang } = useLang();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [f, setF] = useState<Form>({ name: '', phone: '', area: '', home: '', interests: ['solar'], consent: false });
  const [errors, setErrors] = useState<Partial<Record<keyof Form | 'server', string>>>({});
  const [busy, setBusy] = useState(false);
  const [source, setSource] = useState('direct');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const src = p.get('utm_source') || p.get('src') || (document.referrer ? new URL(document.referrer).hostname : '');
    if (src) setSource(src.slice(0, 60));
    if (p.get('step') === 'done') setStep(3);
  }, []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF(s => ({ ...s, [k]: v }));
  const toggle = (i: string) => set('interests', f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: typeof errors = {};
    if (f.name.trim().length < 2) err.name = t.f_err_name;
    if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\D/g, '').slice(-10)) || f.phone.replace(/\D/g, '').length < 10) err.phone = t.f_err_phone;
    if (!f.area) err.area = t.f_err_area;
    if (!f.home) err.home = t.f_err_home;
    if (!f.consent) err.consent = t.f_err_consent;
    setErrors(err);
    if (Object.keys(err).length) {
      const first = document.querySelector<HTMLElement>(`[data-field="${Object.keys(err)[0]}"] input, [data-field="${Object.keys(err)[0]}"] select, [data-field="${Object.keys(err)[0]}"] button`);
      first?.focus();
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, phone: f.phone.replace(/\D/g, '').slice(-10), lang, source }) });
      if (!res.ok) throw new Error(String(res.status));
      const d = await res.json();
      try { localStorage.setItem('gm_phone', f.phone.replace(/\D/g, '').slice(-10)); localStorage.setItem('gm_name', f.name.trim()); } catch {}
      setStep(d.status === 'paid' ? 3 : 2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrors({ server: t.f_err_server });
    } finally {
      setBusy(false);
    }
  }

  const name = f.name.trim() || (typeof window !== 'undefined' ? (() => { try { return localStorage.getItem('gm_name') || ''; } catch { return ''; } })() : '');

  return (
    <div className="flow">
      <div className="progress-steps" aria-hidden="true">
        <span className={step >= 1 ? 'on' : ''} /><span className={step >= 2 ? 'on' : ''} /><span className={step >= 3 ? 'on' : ''} />
      </div>

      {step === 1 && (
        <>
          <p className="overline">{t.join_over}</p>
          <h1>{t.join_title}</h1>
          <p className="flow-lead">{t.join_body}</p>
          <form className="panel form" onSubmit={submit} noValidate>
            <div className={`gm-field ${errors.name ? 'gm-field-error' : ''}`} data-field="name">
              <label className="gm-label" htmlFor="name">{t.f_name}</label>
              <div className="gm-input-wrap"><input id="name" className="gm-input" autoComplete="name" value={f.name} onChange={e => set('name', e.target.value)} maxLength={120} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-err' : undefined} /></div>
              {errors.name && <p className="gm-error" id="name-err"><AlertCircle className="gm-icon" /> {errors.name}</p>}
            </div>

            <div className={`gm-field ${errors.phone ? 'gm-field-error' : ''}`} data-field="phone">
              <label className="gm-label" htmlFor="phone">{t.f_phone}</label>
              <div className="gm-input-wrap"><span className="gm-input-prefix">+91</span><input id="phone" className="gm-input" inputMode="numeric" autoComplete="tel-national" value={f.phone} onChange={e => set('phone', e.target.value.replace(/[^\d\s]/g, '').slice(0, 12))} aria-invalid={!!errors.phone} aria-describedby="phone-hint" /></div>
              {errors.phone ? <p className="gm-error" id="phone-hint"><AlertCircle className="gm-icon" /> {errors.phone}</p> : <p className="gm-hint" id="phone-hint">{t.f_phone_hint}</p>}
            </div>

            <div className={`gm-field ${errors.area ? 'gm-field-error' : ''}`} data-field="area">
              <label className="gm-label" htmlFor="area">{t.f_area}</label>
              <div className="gm-input-wrap select-wrap">
                <select id="area" className="gm-select" value={f.area} onChange={e => set('area', e.target.value)} aria-invalid={!!errors.area}>
                  <option value="" disabled>{t.f_area_pick}</option>
                  {areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown size={18} />
              </div>
              {errors.area && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.area}</p>}
            </div>

            <fieldset className="gm-field" data-field="home" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="gm-label" style={{ marginBottom: 8 }}>{t.f_home}</legend>
              <div className="gm-chips">
                <button type="button" className="gm-chip" aria-pressed={f.home === 'house'} onClick={() => set('home', 'house')}>{t.f_house}</button>
                <button type="button" className="gm-chip" aria-pressed={f.home === 'flat'} onClick={() => set('home', 'flat')}>{t.f_flat}</button>
              </div>
              {errors.home && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.home}</p>}
            </fieldset>

            <fieldset className="gm-field" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="gm-label" style={{ marginBottom: 8 }}>{t.f_interest}</legend>
              <div className="gm-chips">
                {INTERESTS.map(i => <button key={i} type="button" className="gm-chip" aria-pressed={f.interests.includes(i)} onClick={() => toggle(i)}>{t[`i_${i}` as 'i_solar']}</button>)}
              </div>
            </fieldset>

            <div data-field="consent">
              <label className="check"><input type="checkbox" checked={f.consent} onChange={e => set('consent', e.target.checked)} /> <span>{t.f_consent} <Link href="/privacy">{t.privacy}</Link></span></label>
              {errors.consent && <p className="gm-error" style={{ marginTop: 8 }}><AlertCircle className="gm-icon" /> {errors.consent}</p>}
            </div>

            {errors.server && <div className="notice err" role="alert">{errors.server}</div>}
            <button type="submit" className="gm-btn gm-btn-primary gm-btn-block" disabled={busy} style={{ minHeight: 52 }}>{busy ? '…' : <>{t.f_submit} <ArrowRight size={18} /></>}</button>
            <p className="gm-hint" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><ShieldCheck size={16} /> {t.faq4_a}</p>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <p className="overline">{t.pay_over}</p>
          <h1>{t.pay_title}</h1>
          <p className="flow-lead">{t.pay_body}</p>
          <div className="panel stack">
            <div className="notice"><span className="amount" style={{ color: 'var(--ink)' }}>+91 {f.phone.replace(/\D/g, '').slice(-10)}</span></div>
            {site.paymentLink ? (
              <a className="gm-btn gm-btn-primary gm-btn-block" style={{ minHeight: 52 }} href={site.paymentLink} target="_blank" rel="noopener" onClick={() => setTimeout(() => setStep(3), 800)}>{t.pay_cta}</a>
            ) : (
              <>
                <div className="notice">{t.pay_missing}</div>
                <a className="gm-btn gm-btn-whatsapp gm-btn-block" href={waLink(`Hi Gharmalak, I just registered (${f.phone.replace(/\D/g, '').slice(-10)}). Please send me the ₹499 payment link.`)} target="_blank" rel="noopener"><MessageCircle size={18} /> WhatsApp</a>
              </>
            )}
            <button type="button" className="gm-btn gm-btn-ghost" onClick={() => setStep(3)}>{t.pay_after}</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <p className="overline">{t.card_member}</p>
          <h1>{t.done_title}</h1>
          <div className="welcome-card"><MalakCard name={name || 'Gharmalak member'} number="GM · NAGPUR" label={t.card_member} over={t.card_over} /></div>
          <div className="panel stack">
            <p>{t.done_body}</p>
            <a className="gm-btn gm-btn-whatsapp gm-btn-block" href={waLink('Hi Gharmalak, I have joined the club. Please add me to Round 1 updates.')} target="_blank" rel="noopener"><MessageCircle size={18} /> {t.done_wa}</a>
            <Link className="gm-btn gm-btn-secondary gm-btn-block" href="/round/solar-nagpur">{t.round_cta}</Link>
          </div>
        </>
      )}
    </div>
  );
}
